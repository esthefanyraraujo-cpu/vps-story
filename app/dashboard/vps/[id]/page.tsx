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

  const isWindows = vps.plano.nome.toLowerCase().includes('windows')

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

      {/* Connection Info */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {isWindows ? 'Acesso Area de Trabalho Remota (RDP)' : 'Acesso SSH'}
        </h2>
        {vps.ip ? (
          <div className="space-y-4">
            {isWindows && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <div className="bg-blue-500 text-white rounded-full p-1 h-fit">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Aguarde a Instalação do Windows</p>
                  <p className="text-sm text-blue-700 mt-0.5">
                    O Windows Server leva cerca de <strong>15 a 20 minutos</strong> para ser instalado e configurar o acesso remoto após a criação. Se a conexão falhar agora, tente novamente em alguns instantes.
                  </p>
                </div>
              </div>
            )}
            {isWindows ? (
              <>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Use o programa <strong>Conexao de Area de Trabalho Remota</strong> do Windows.
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    Computador: <code className="bg-white px-1.5 py-0.5 rounded border">{vps.ip}</code>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <p className="text-sm text-gray-500">
                    Usuario: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">Administrator</code>
                  </p>
                  <p className="text-sm text-gray-500 text-xs italic">
                    * A senha foi enviada para o seu e-mail.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm">
                  ssh root@{vps.ip}
                </div>
                <p className="text-sm text-gray-500">
                  Usuario: <code className="bg-gray-100 px-1.5 py-0.5 rounded">root</code>
                </p>
              </>
            )}
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
