import { auth } from '@/lib/auth'
import { desligarServidor, ligarServidor, reiniciarServidor } from '@/lib/hetzner'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

interface Params {
  params: { id: string }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const { acao } = await req.json()

    const vps = await prisma.vPS.findUnique({
      where: { id: params.id },
    })

    if (!vps) {
      return NextResponse.json({ error: 'VPS nao encontrada' }, { status: 404 })
    }

    // Verificar se o usuario e dono ou admin
    if (vps.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    switch (acao) {
      case 'ligar':
        await ligarServidor(vps.hetznerServerId)
        break
      case 'desligar':
        await desligarServidor(vps.hetznerServerId)
        break
      case 'reiniciar':
        await reiniciarServidor(vps.hetznerServerId)
        break
      default:
        return NextResponse.json({ error: 'Acao invalida' }, { status: 400 })
    }

    return NextResponse.json({ message: `VPS ${acao} com sucesso` })
  } catch (error) {
    console.error('[VPS_ACAO]', error)
    return NextResponse.json({ error: 'Erro ao executar acao' }, { status: 500 })
  }
}
