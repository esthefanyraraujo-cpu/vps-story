import { prisma } from '@/lib/prisma'
import { formatarMoeda } from '@/lib/utils'
import Link from 'next/link'
import { auth } from '@/lib/auth'

async function getPlanos(isAdmin: boolean) {
  return prisma.plano.findMany({
    where: {
      OR: [
        { ativo: true },
        isAdmin ? { nome: 'VPS Teste Admin' } : {}
      ]
    },
    orderBy: { precoMensal: 'asc' },
  })
}

export async function LandingPlanos() {
  const session = await auth()
  const isAdmin = session?.user?.role === 'ADMIN'
  const planos = await getPlanos(isAdmin)

  return (
    <section id="planos" className="py-20 bg-gray-50 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Planos e Precos</h2>
          <p className="text-gray-600 text-lg">Escolha o plano ideal para o seu projeto.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {planos.map((plano, i) => {
            const isTestPlan = plano.nome === 'VPS Teste Admin'
            const precoExibido = isAdmin 
              ? Number(plano.precoMensal) * 0.01 
              : Number(plano.precoMensal)

            return (
              <div
                key={plano.id}
                className={`bg-white rounded-2xl shadow-sm p-8 border-2 flex flex-col ${
                  isTestPlan ? 'border-yellow-500 bg-yellow-50/30' : 
                  i === 1 ? 'border-purple-500 shadow-purple-100 shadow-lg' : 'border-transparent'
                }`}
              >
                {isTestPlan && (
                  <div className="text-center mb-3">
                    <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      PLANO DE TESTE (ADMIN)
                    </span>
                  </div>
                )}
                
                {i === 1 && !isTestPlan && (
                  <div className="text-center mb-3">
                    <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      MAIS POPULAR
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-900 mb-1">{plano.nome}</h3>
                <p className="text-gray-500 text-sm mb-6">{plano.descricao}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-purple-600">{formatarMoeda(precoExibido)}</span>
                  <span className="text-gray-500 text-sm">/mes</span>
                  {isAdmin && (
                    <p className="text-xs text-gray-400 line-through">De {formatarMoeda(plano.precoMensal)}</p>
                  )}
                </div>

                <ul className="space-y-2.5 mb-8 flex-1 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {plano.ram >= 1024 ? `${plano.ram / 1024} GB` : `${plano.ram} MB`} RAM
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {plano.cpu} vCPUs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {plano.ssd} GB SSD NVMe
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {plano.banda} TB transferencia
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Suporte 24/7
                  </li>
                </ul>

                <Link
                  href={`/checkout/${plano.id}`}
                  className={`block text-center py-3 rounded-xl font-semibold transition-colors ${
                    isTestPlan ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                    i === 1
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-100 hover:bg-purple-600 hover:text-white text-gray-900'
                  }`}
                >
                  {isTestPlan ? 'Iniciar Teste' : 'Contratar Agora'}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
