import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ticketSchema } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const isAdmin = session.user.role === 'ADMIN'

    const tickets = await prisma.ticket.findMany({
      where: isAdmin ? {} : { userId: session.user.id },
      include: {
        user: { select: { nome: true } },
        _count: { select: { mensagens: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(tickets)
  } catch (error) {
    console.error('[TICKETS_GET]', error)
    return NextResponse.json({ error: 'Erro ao buscar tickets' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const result = ticketSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { titulo, mensagem, prioridade } = result.data

    const ticket = await prisma.ticket.create({
      data: {
        userId: session.user.id,
        titulo,
        prioridade,
        mensagens: {
          create: {
            autorId: session.user.id,
            mensagem,
          },
        },
      },
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error('[TICKETS_POST]', error)
    return NextResponse.json({ error: 'Erro ao criar ticket' }, { status: 500 })
  }
}
