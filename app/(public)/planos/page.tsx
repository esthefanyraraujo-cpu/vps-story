import { prisma } from '@/lib/prisma'
import { formatarMoeda } from '@/lib/utils'
import Link from 'next/link'

export const revalidate = 3600

async function getPlanos() {
  return prisma.plano.findMany({
    where: { ativo: true },
    orderBy: { precoMensal: 'asc' },
  })
}

export default async function PlanosPage() {
  const planos = await getPlanos()

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nossos Planos VPS</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Escolha o plano ideal para o seu projeto. Todos com SSD NVMe, alta disponibilidade e suporte 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {planos.map((plano, i) => (
            <div
              key={plano.id}
              className={`bg-white rounded-2xl shadow-lg p-8 border-2 flex flex-col ${
                i === 1 ? 'border-purple-500 scale-105' : 'border-transparent'
              }`}
            >
              {i === 1 && (
                <div className="text-center mb-4">
                  <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MAIS POPULAR
                  </span>
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{plano.nome}</h2>
              <p className="text-gray-500 mb-6">{plano.descricao}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-purple-600">
                  {formatarMoeda(plano.precoMensal)}
                </span>
                <span className="text-gray-500">/mes</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>{plano.ram} GB RAM</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>{plano.cpu} vCPUs</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>{plano.ssd} GB SSD NVMe</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>{plano.banda} TB Transferencia</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Suporte 24/7</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Painel de Controle</span>
                </li>
              </ul>

              <Link
                href={`/checkout/${plano.id}`}
                className={`block text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                  i === 1
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                Contratar Agora
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
