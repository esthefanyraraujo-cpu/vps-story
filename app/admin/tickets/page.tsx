import { prisma } from '@/lib/prisma'
import { formatarData } from '@/lib/utils'
import Link from 'next/link'

async function getTickets() {
  return prisma.ticket.findMany({
    include: {
      user: { select: { nome: true, email: true } },
      _count: { select: { mensagens: true } },
    },
    orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
  })
}

export default async function AdminTicketsPage() {
  const tickets = await getTickets()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tickets de Suporte</h1>
        <p className="text-gray-500 text-sm">{tickets.length} tickets no total</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Titulo</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Cliente</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Prioridade</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Mensagens</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Ultima atualizacao</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Acao</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900 max-w-xs truncate">{ticket.titulo}</td>
                  <td className="p-4">
                    <p className="text-sm text-gray-900">{ticket.user.nome}</p>
                    <p className="text-xs text-gray-400">{ticket.user.email}</p>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      ticket.prioridade === 'ALTA' ? 'bg-red-100 text-red-700' :
                      ticket.prioridade === 'MEDIA' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {ticket.prioridade}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      ticket.status === 'FECHADO' ? 'bg-gray-100 text-gray-700' :
                      ticket.status === 'RESPONDIDO' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">{ticket._count.mensagens}</td>
                  <td className="p-4 text-gray-500 text-sm">{formatarData(ticket.updatedAt)}</td>
                  <td className="p-4">
                    <Link
                      href={`/dashboard/tickets/${ticket.id}`}
                      className="text-sm text-purple-600 hover:underline"
                    >
                      Responder
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tickets.length === 0 && (
          <div className="p-8 text-center text-gray-500">Nenhum ticket encontrado.</div>
        )}
      </div>
    </div>
  )
}
