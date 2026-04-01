import { prisma } from '@/lib/prisma'
import { formatarMoeda } from '@/lib/utils'
import { AdminPlanosActions } from '@/components/admin/planos-actions'

async function getPlanos() {
  return prisma.plano.findMany({
    orderBy: { precoMensal: 'asc' },
    include: {
      _count: { select: { vps: true } },
    },
  })
}

export default async function AdminPlanosPage() {
  const planos = await getPlanos()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Planos</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planos.map((plano) => (
          <div
            key={plano.id}
            className={`bg-white rounded-xl border p-6 ${!plano.ativo ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">{plano.nome}</h3>
                <p className="text-sm text-gray-500 mt-1">{plano.descricao}</p>
              </div>
              {!plano.ativo && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  Inativo
                </span>
              )}
            </div>

            <div className="text-2xl font-bold text-purple-600 mb-4">
              {formatarMoeda(plano.precoMensal)}
              <span className="text-sm font-normal text-gray-500">/mes</span>
            </div>

            <ul className="space-y-1.5 text-sm text-gray-600 mb-4">
              <li>{plano.ram >= 1024 ? `${plano.ram / 1024} GB` : `${plano.ram} MB`} RAM</li>
              <li>{plano.cpu} vCPUs</li>
              <li>{plano.ssd} GB SSD NVMe</li>
              <li>{plano.banda} TB transferencia</li>
              <li>Tipo Hetzner: {plano.hetznerTipo}</li>
            </ul>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>{plano._count.vps} VPS ativos</span>
            </div>

            <AdminPlanosActions planoId={plano.id} ativo={plano.ativo} />
          </div>
        ))}
      </div>

      {planos.length === 0 && (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
          Nenhum plano cadastrado.
        </div>
      )}
    </div>
  )
}
