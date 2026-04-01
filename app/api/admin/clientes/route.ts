import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [clientes, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'CLIENT' },
        select: {
          id: true,
          nome: true,
          email: true,
          createdAt: true,
          _count: { select: { vps: true, tickets: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
    ])

    return NextResponse.json({ clientes, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('[ADMIN_CLIENTES]', error)
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 })
  }
}
