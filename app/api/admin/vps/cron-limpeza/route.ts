import { prisma } from '@/lib/prisma'
import { deletarServidor } from '@/lib/hetzner'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Validar token de autorização simples via header para evitar abusos
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    console.log('[CRON] Iniciando limpeza de VPS expiradas...')

    // 1. VPS para SUSPENDER (Expirou hoje, mas ainda não deletamos)
    const paraSuspender = await prisma.vPS.findMany({
      where: {
        dataExpiracao: { lt: agora },
        status: 'ATIVO'
      }
    })

    // 2. VPS para DELETAR (Expirou há mais de 3 dias e já está suspensa)
    const tresDiasAtras = new Date()
    tresDiasAtras.setDate(agora.getDate() - 3)

    const paraDeletar = await prisma.vPS.findMany({
      where: {
        dataExpiracao: { lt: tresDiasAtras },
        status: 'SUSPENSO'
      }
    })

    const resultados = []

    // Lógica de Suspensão
    for (const vps of paraSuspender) {
      try {
        console.log(`[CRON] Suspendendo VPS ${vps.nome} (Hetzner ID: ${vps.hetznerServerId})...`)
        await fetch(`https://api.hetzner.cloud/v1/servers/${vps.hetznerServerId}/actions/poweroff`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.HETZNER_API_TOKEN}` }
        })
        await prisma.vPS.update({
          where: { id: vps.id },
          data: { status: 'SUSPENSO' }
        })
        resultados.push({ nome: vps.nome, acao: 'SUSPENSAO', status: 'SUCESSO' })
      } catch (e) {
        resultados.push({ nome: vps.nome, acao: 'SUSPENSAO', status: 'ERRO', error: String(e) })
      }
    }

    // Lógica de Deleção Permanente
    for (const vps of paraDeletar) {
      try {
        console.log(`[CRON] Deletando permanentemente VPS ${vps.nome}...`)
        await deletarServidor(vps.hetznerServerId)
        await prisma.vPS.update({
          where: { id: vps.id },
          data: { status: 'CANCELADO' }
        })
        resultados.push({ nome: vps.nome, acao: 'DELECAO', status: 'SUCESSO' })
      } catch (e) {
        resultados.push({ nome: vps.nome, acao: 'DELECAO', status: 'ERRO', error: String(e) })
      }
    }

    return NextResponse.json({
      message: 'Processamento de limpeza e suspensao concluido.',
      detalhes: resultados
    })
  } catch (error) {
    console.error('[CRON_ERROR]', error)
    return NextResponse.json({ error: 'Erro interno na cron de limpeza' }, { status: 500 })
  }
}
