import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatarData } from '@/lib/utils'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NovoTicketForm } from '@/components/dashboard/novo-ticket-form'

async function getTickets(userId: string) {
  return prisma.ticket.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  })
}

export default async function TicketsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const tickets = await getTickets(session.user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Meus Tickets</h1>
        <NovoTicketForm />
      </div>

      <div className="bg-white rounded-xl border">
        {tickets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum ticket encontrado.</div>
        ) : (
          <div className="divide-y">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="p-6 flex items-center justify-between">
                <div>
                  <Link
                    href={`/dashboard/tickets/${ticket.id}`}
                    className="font-medium text-gray-900 hover:text-purple-600"
                  >
                    {ticket.titulo}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      ticket.prioridade === 'ALTA' ? 'bg-red-100 text-red-700' :
                      ticket.prioridade === 'MEDIA' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {ticket.prioridade}
                    </span>
                    <span className="text-xs text-gray-400">{formatarData(ticket.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    ticket.status === 'FECHADO' ? 'bg-gray-100 text-gray-700' :
                    ticket.status === 'RESPONDIDO' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {ticket.status}
                  </span>
                  <Link
                    href={`/dashboard/tickets/${ticket.id}`}
                    className="text-sm text-purple-600 hover:underline"
                  >
                    Abrir
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
