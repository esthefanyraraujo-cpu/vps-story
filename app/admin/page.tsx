import { prisma } from '@/lib/prisma'
import { formatarMoeda } from '@/lib/utils'
import Link from 'next/link'

async function getMetricas() {
  const [totalClientes, totalVPS, vpsAtivos, ticketsAbertos, receitaMes] = await Promise.all([
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.vPS.count(),
    prisma.vPS.count({ where: { status: 'ATIVO' } }),
    prisma.ticket.count({ where: { status: { in: ['ABERTO', 'RESPONDIDO'] } } }),
    prisma.pagamento.aggregate({
      where: {
        status: 'PAGO',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { valor: true },
    }),
  ])

  return { totalClientes, totalVPS, vpsAtivos, ticketsAbertos, receitaMes: receitaMes._sum.valor || 0 }
}

export default async function AdminPage() {
  const metricas = await getMetricas()

  const cards = [
    { label: 'Total de Clientes', value: metricas.totalClientes, href: '/admin/clientes' },
    { label: 'VPS Ativos', value: metricas.vpsAtivos, href: '/admin/vps' },
    { label: 'Total de VPS', value: metricas.totalVPS, href: '/admin/vps' },
    { label: 'Tickets Abertos', value: metricas.ticketsAbertos, href: '/admin/tickets' },
    { label: 'Receita do Mes', value: formatarMoeda(metricas.receitaMes), href: '#' },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl border p-6 hover:border-purple-300 transition-colors"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acoes Rapidas</h2>
          <div className="space-y-3">
            <Link href="/admin/planos" className="flex items-center gap-2 text-purple-600 hover:underline text-sm">
              Gerenciar Planos
            </Link>
            <Link href="/admin/vps" className="flex items-center gap-2 text-purple-600 hover:underline text-sm">
              Gerenciar VPS
            </Link>
            <Link href="/admin/tickets" className="flex items-center gap-2 text-purple-600 hover:underline text-sm">
              Responder Tickets
            </Link>
            <Link href="/admin/clientes" className="flex items-center gap-2 text-purple-600 hover:underline text-sm">
              Ver Clientes
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
