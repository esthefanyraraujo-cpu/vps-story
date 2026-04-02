import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { provisionarVPS } from '@/lib/vps-provisioner'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { userId, planoId } = body

    if (!userId || !planoId) {
      return NextResponse.json({ error: 'Usuario e Plano sao obrigatorios' }, { status: 400 })
    }

    const plano = await prisma.plano.findUnique({ where: { id: planoId } })
    if (!plano) {
      return NextResponse.json({ error: 'Plano nao encontrado' }, { status: 404 })
    }

    // Criar um registro de pagamento aprovado manualmente
    const pagamento = await prisma.pagamento.create({
      data: {
        userId,
        planoId,
        valor: plano.precoMensal,
        gateway: 'STRIPE', // Placeholder
        status: 'PENDENTE',
        transacaoId: `manual_admin_${Date.now()}`
      },
    })

    // Disparar o provisionamento real
    await provisionarVPS(pagamento.id)

    return NextResponse.json({ message: 'VPS criada com sucesso!' })
  } catch (error) {
    console.error('[ADMIN_VPS_MANUAL]', error)
    return NextResponse.json({ error: 'Erro ao criar VPS manualmente' }, { status: 500 })
  }
}
