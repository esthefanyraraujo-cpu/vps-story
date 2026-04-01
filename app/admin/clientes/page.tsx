import { prisma } from '@/lib/prisma'
import { formatarData } from '@/lib/utils'

async function getClientes() {
  return prisma.user.findMany({
    where: { role: 'CLIENT' },
    select: {
      id: true,
      nome: true,
      email: true,
      createdAt: true,
      _count: { select: { vps: true, tickets: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function AdminClientesPage() {
  const clientes = await getClientes()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <p className="text-gray-500 text-sm">{clientes.length} clientes cadastrados</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Nome</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">VPS</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Tickets</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Cadastro</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{cliente.nome}</td>
                  <td className="p-4 text-gray-600">{cliente.email}</td>
                  <td className="p-4 text-gray-600">{cliente._count.vps}</td>
                  <td className="p-4 text-gray-600">{cliente._count.tickets}</td>
                  <td className="p-4 text-gray-500 text-sm">{formatarData(cliente.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {clientes.length === 0 && (
          <div className="p-8 text-center text-gray-500">Nenhum cliente cadastrado.</div>
        )}
      </div>
    </div>
  )
}
