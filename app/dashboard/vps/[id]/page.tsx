import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatarData, diasAteExpirar } from '@/lib/utils'
import { notFound, redirect } from 'next/navigation'
import { VPSActions } from '@/components/dashboard/vps-actions'

interface Props {
  params: { id: string }
}

async function getVPS(id: string, userId: string) {
  const vps = await prisma.vPS.findUnique({
    where: { id },
    include: { plano: true },
  })
  if (!vps || vps.userId !== userId) return null
  return vps
}

export default async function VPSDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const vps = await getVPS(params.id, session.user.id)
  if (!vps) notFound()

  const diasRestantes = diasAteExpirar(vps.dataExpiracao)

  const statusColor: Record<string, string> = {
    ATIVO: 'bg-green-100 text-green-800',
    SUSPENSO: 'bg-yellow-100 text-yellow-800',
    CANCELADO: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{vps.nome}</h1>
          <p className="text-gray-500 mt-1">Plano: {vps.plano.nome}</p>
        </div>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${statusColor[vps.status]}`}>
          {vps.status}
        </span>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Endereco IP</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{vps.ip || 'Aguardando...'}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">RAM</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            {vps.plano.ram >= 1024 ? `${vps.plano.ram / 1024} GB` : `${vps.plano.ram} MB`}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">CPU / SSD</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            {vps.plano.cpu} vCPUs / {vps.plano.ssd} GB
          </p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Expiracao</p>
          <p className={`text-lg font-semibold mt-1 ${diasRestantes <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
            {diasRestantes} dias
          </p>
          <p className="text-xs text-gray-400">{formatarData(vps.dataExpiracao)}</p>
        </div>
      </div>

      {/* SSH Info */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acesso SSH</h2>
        {vps.ip ? (
          <div className="space-y-3">
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm">
              ssh root@{vps.ip}
            </div>
            <p className="text-sm text-gray-500">
              Usuario: <code className="bg-gray-100 px-1.5 py-0.5 rounded">root</code>
            </p>
          </div>
        ) : (
          <p className="text-gray-500">IP sendo configurado, aguarde alguns minutos...</p>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acoes do Servidor</h2>
        <VPSActions vpsId={vps.id} status={vps.status} />
      </div>

      {/* Dados do Plano */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuracoes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">RAM</p>
            <p className="font-medium">{vps.plano.ram >= 1024 ? `${vps.plano.ram / 1024} GB` : `${vps.plano.ram} MB`}</p>
          </div>
          <div>
            <p className="text-gray-500">CPU</p>
            <p className="font-medium">{vps.plano.cpu} vCPUs</p>
          </div>
          <div>
            <p className="text-gray-500">SSD</p>
            <p className="font-medium">{vps.plano.ssd} GB NVMe</p>
          </div>
          <div>
            <p className="text-gray-500">Transferencia</p>
            <p className="font-medium">{vps.plano.banda} TB/mes</p>
          </div>
        </div>
      </div>
    </div>
  )
}
