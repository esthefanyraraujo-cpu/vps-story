import { auth } from '@/lib/auth'
import { enviarNotificacaoTicket } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface Params {
  params: { id: string }
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        mensagens: {
          include: { autor: { select: { id: true, nome: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket nao encontrado' }, { status: 404 })
    }

    if (ticket.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    return NextResponse.json(ticket.mensagens)
  } catch (error) {
    console.error('[TICKET_MENSAGENS_GET]', error)
    return NextResponse.json({ error: 'Erro ao buscar mensagens' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const { mensagem } = await req.json()

    if (!mensagem || mensagem.trim().length === 0) {
      return NextResponse.json({ error: 'Mensagem nao pode ser vazia' }, { status: 400 })
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: { user: true },
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket nao encontrado' }, { status: 404 })
    }

    if (ticket.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const novaMensagem = await prisma.ticketMensagem.create({
      data: {
        ticketId: params.id,
        autorId: session.user.id,
        mensagem: mensagem.trim(),
      },
      include: { autor: { select: { id: true, nome: true, role: true } } },
    })

    // Atualizar status do ticket
    const novoStatus = session.user.role === 'ADMIN' ? 'RESPONDIDO' : 'ABERTO'
    await prisma.ticket.update({
      where: { id: params.id },
      data: { status: novoStatus },
    })

    // Notificar por email se for resposta do admin
    if (session.user.role === 'ADMIN' && ticket.userId !== session.user.id) {
      try {
        await enviarNotificacaoTicket(ticket.user.email, ticket.user.nome, ticket.titulo)
      } catch (emailError) {
        console.error('[EMAIL_TICKET]', emailError)
      }
    }

    return NextResponse.json(novaMensagem, { status: 201 })
  } catch (error) {
    console.error('[TICKET_MENSAGENS_POST]', error)
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 })
  }
}
