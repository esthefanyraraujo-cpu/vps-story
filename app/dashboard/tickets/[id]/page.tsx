import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatarData } from '@/lib/utils'
import { notFound, redirect } from 'next/navigation'
import { TicketMensagemForm } from '@/components/dashboard/ticket-mensagem-form'

interface Props {
  params: { id: string }
}

async function getTicket(id: string, userId: string, isAdmin: boolean) {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, nome: true } },
      mensagens: {
        include: { autor: { select: { id: true, nome: true, role: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!ticket) return null
  if (!isAdmin && ticket.userId !== userId) return null
  return ticket
}

export default async function TicketDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const ticket = await getTicket(params.id, session.user.id, isAdmin)
  if (!ticket) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{ticket.titulo}</h1>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            ticket.status === 'FECHADO' ? 'bg-gray-100 text-gray-700' :
            ticket.status === 'RESPONDIDO' ? 'bg-blue-100 text-blue-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {ticket.status}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Aberto por {ticket.user.nome} em {formatarData(ticket.createdAt)}
        </p>
      </div>

      {/* Mensagens */}
      <div className="space-y-4">
        {ticket.mensagens.map((msg) => (
          <div
            key={msg.id}
            className={`p-4 rounded-xl border ${
              msg.autor.role === 'ADMIN'
                ? 'bg-purple-50 border-purple-200'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-gray-900">{msg.autor.nome}</span>
                {msg.autor.role === 'ADMIN' && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                    Suporte
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">{formatarData(msg.createdAt)}</span>
            </div>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{msg.mensagem}</p>
          </div>
        ))}
      </div>

      {/* Responder */}
      {ticket.status !== 'FECHADO' && (
        <TicketMensagemForm ticketId={ticket.id} />
      )}

      {ticket.status === 'FECHADO' && (
        <div className="p-4 bg-gray-50 border rounded-xl text-center text-gray-500 text-sm">
          Este ticket esta fechado.
        </div>
      )}
    </div>
  )
}
