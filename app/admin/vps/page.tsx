import { prisma } from '@/lib/prisma'
import { formatarData, diasAteExpirar } from '@/lib/utils'
import { AdminVPSActions } from '@/components/admin/vps-actions'

async function getAllVPS() {
  return prisma.vPS.findMany({
    include: {
      user: { select: { id: true, nome: true, email: true } },
      plano: { select: { nome: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function AdminVPSPage() {
  const servidores = await getAllVPS()

  const statusColor: Record<string, string> = {
    ATIVO: 'bg-green-100 text-green-800',
    SUSPENSO: 'bg-yellow-100 text-yellow-800',
    CANCELADO: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar VPS</h1>
        <p className="text-gray-500 text-sm">{servidores.length} servidores no total</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Servidor</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Cliente</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Plano</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">IP</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Expiracao</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {servidores.map((vps) => (
                <tr key={vps.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{vps.nome}</p>
                    <p className="text-xs text-gray-400">ID Hetzner: {vps.hetznerServerId}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-900">{vps.user.nome}</p>
                    <p className="text-xs text-gray-400">{vps.user.email}</p>
                  </td>
                  <td className="p-4 text-gray-600">{vps.plano.nome}</td>
                  <td className="p-4 font-mono text-sm text-gray-600">{vps.ip || '-'}</td>
                  <td className="p-4 text-sm text-gray-600">
                    <span className={diasAteExpirar(vps.dataExpiracao) <= 5 ? 'text-red-600 font-medium' : ''}>
                      {diasAteExpirar(vps.dataExpiracao)} dias
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[vps.status]}`}>
                      {vps.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <AdminVPSActions vpsId={vps.id} status={vps.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {servidores.length === 0 && (
          <div className="p-8 text-center text-gray-500">Nenhum servidor encontrado.</div>
        )}
      </div>
    </div>
  )
}
