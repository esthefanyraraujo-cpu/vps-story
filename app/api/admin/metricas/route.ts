import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const [
      totalClientes,
      totalVPS,
      vpsAtivos,
      totalReceitaMes,
      ticketsAbertos,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.vPS.count(),
      prisma.vPS.count({ where: { status: 'ATIVO' } }),
      prisma.pagamento.aggregate({
        where: {
          status: 'PAGO',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { valor: true },
      }),
      prisma.ticket.count({ where: { status: { in: ['ABERTO', 'RESPONDIDO'] } } }),
    ])

    return NextResponse.json({
      totalClientes,
      totalVPS,
      vpsAtivos,
      receitaMes: totalReceitaMes._sum.valor || 0,
      ticketsAbertos,
    })
  } catch (error) {
    console.error('[ADMIN_METRICAS]', error)
    return NextResponse.json({ error: 'Erro ao buscar metricas' }, { status: 500 })
  }
}
