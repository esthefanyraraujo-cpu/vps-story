import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatarData, formatarMoeda } from '@/lib/utils'
import { redirect } from 'next/navigation'

async function getPagamentos(userId: string) {
  return prisma.pagamento.findMany({
    where: { userId },
    include: { plano: true },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function PagamentosPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const pagamentos = await getPagamentos(session.user.id)

  const statusColor: Record<string, string> = {
    PAGO: 'bg-green-100 text-green-800',
    PENDENTE: 'bg-yellow-100 text-yellow-800',
    FALHOU: 'bg-red-100 text-red-800',
  }

  const gatewayLabel: Record<string, string> = {
    MP: 'Mercado Pago',
    STRIPE: 'Cartao (Stripe)',
    PAGSEGURO: 'PagSeguro',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Historico de Pagamentos</h1>

      <div className="bg-white rounded-xl border">
        {pagamentos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum pagamento encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Plano</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Gateway</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Valor</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pagamentos.map((pag) => (
                  <tr key={pag.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{pag.plano.nome}</td>
                    <td className="p-4 text-gray-600">{gatewayLabel[pag.gateway] || pag.gateway}</td>
                    <td className="p-4 font-semibold text-gray-900">{formatarMoeda(pag.valor)}</td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[pag.status]}`}>
                        {pag.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">{formatarData(pag.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
