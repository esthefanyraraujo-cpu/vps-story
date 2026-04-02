import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatarData, formatarMoeda, diasAteExpirar } from '@/lib/utils'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CriarVPSManual } from '@/components/admin/criar-vps-manual'

async function getDashboardData(userId: string) {
  const [vpsServers, pagamentos, tickets] = await Promise.all([
    prisma.vPS.findMany({
      where: { userId },
      include: { plano: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.pagamento.findMany({
      where: { userId },
      include: { plano: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.ticket.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
  ])
  return { vpsServers, pagamentos, tickets }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const { vpsServers, pagamentos, tickets } = await getDashboardData(session.user.id)

  const statusColor: Record<string, string> = {
    ATIVO: 'bg-green-100 text-green-800',
    SUSPENSO: 'bg-yellow-100 text-yellow-800',
    CANCELADO: 'bg-red-100 text-red-800',
  }

  const statusPagamentoColor: Record<string, string> = {
    PAGO: 'bg-green-100 text-green-800',
    PENDENTE: 'bg-yellow-100 text-yellow-800',
    FALHOU: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bem-vindo, {session.user.name}!
        </h1>
        <p className="text-gray-600 mt-1">Gerencie suas VPS, pagamentos e tickets de suporte.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-6">
          <p className="text-sm text-gray-500">VPS Ativos</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">
            {vpsServers.filter((v) => v.status === 'ATIVO').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <p className="text-sm text-gray-500">Tickets Abertos</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">
            {tickets.filter((t) => t.status !== 'FECHADO').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <p className="text-sm text-gray-500">Total de VPS</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">{vpsServers.length}</p>
        </div>
      </div>

      {/* VPS List */}
      <div className="bg-white rounded-xl border">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Meus Servidores VPS</h2>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <CriarVPSManual userId={session.user.id} userName={session.user.name || 'Admin'} />
            )}
            <Link
              href="/planos"
              className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Contratar VPS
            </Link>
          </div>
        </div>

        {vpsServers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Voce nao tem nenhuma VPS ainda.</p>
            <Link href="/planos" className="text-purple-600 hover:underline mt-2 inline-block">
              Ver planos disponíveis
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {vpsServers.map((vps) => (
              <div key={vps.id} className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{vps.nome}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {vps.ip && <span className="mr-3">IP: {vps.ip}</span>}
                    {vps.plano.nome} •{' '}
                    {diasAteExpirar(vps.dataExpiracao)} dias restantes
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[vps.status]}`}>
                    {vps.status}
                  </span>
                  <Link
                    href={`/dashboard/vps/${vps.id}`}
                    className="text-sm text-purple-600 hover:underline"
                  >
                    Gerenciar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-xl border">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Pagamentos Recentes</h2>
          <Link href="/dashboard/pagamentos" className="text-sm text-purple-600 hover:underline">
            Ver todos
          </Link>
        </div>

        {pagamentos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum pagamento encontrado.</div>
        ) : (
          <div className="divide-y">
            {pagamentos.map((pag) => (
              <div key={pag.id} className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{pag.plano.nome}</p>
                  <p className="text-sm text-gray-500">{formatarData(pag.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusPagamentoColor[pag.status]}`}>
                    {pag.status}
                  </span>
                  <span className="font-semibold text-gray-900">{formatarMoeda(pag.valor)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-xl border">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Tickets Recentes</h2>
          <Link href="/dashboard/tickets" className="text-sm text-purple-600 hover:underline">
            Ver todos
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum ticket encontrado.</div>
        ) : (
          <div className="divide-y">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{ticket.titulo}</p>
                  <p className="text-sm text-gray-500">{formatarData(ticket.updatedAt)}</p>
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
                    Ver
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
