import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatarMoeda } from '@/lib/utils'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckoutForm } from '@/components/dashboard/checkout-form'

interface Props {
  params: { planoId: string }
}

async function getPlano(id: string) {
  return prisma.plano.findUnique({
    where: { id, ativo: true },
  })
}

export default async function CheckoutPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect(`/login?callbackUrl=/checkout/${params.planoId}`)

  const plano = await getPlano(params.planoId)
  if (!plano) redirect('/planos')

  const isAdmin = session?.user?.role === 'ADMIN'
  const precoOriginal = Number(plano.precoMensal)
  const precoFinal = isAdmin ? precoOriginal * 0.01 : precoOriginal

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/planos" className="text-sm text-purple-600 hover:underline">
            ← Voltar aos planos
          </Link>
        </div>

        <div className="grid gap-6">
          {/* Resumo do plano */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Resumo do Pedido</h2>
              {isAdmin && (
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full uppercase">
                  Desconto de Administrador (99% OFF)
                </span>
              )}
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900 text-xl">{plano.nome}</h3>
                <p className="text-gray-500 mt-1">{plano.descricao}</p>
                <ul className="mt-3 space-y-1 text-sm text-gray-600">
                  <li>{plano.ram >= 1024 ? `${plano.ram / 1024} GB` : `${plano.ram} MB`} RAM</li>
                  <li>{plano.cpu} vCPUs</li>
                  <li>{plano.ssd} GB SSD NVMe</li>
                  <li>{plano.banda} TB transferencia/mes</li>
                </ul>
              </div>
              <div className="text-right">
                {isAdmin && (
                  <p className="text-xs text-gray-400 line-through">{formatarMoeda(precoOriginal)}</p>
                )}
                <p className="text-3xl font-bold text-purple-600">{formatarMoeda(precoFinal)}</p>
                <p className="text-sm text-gray-500">/mes</p>
              </div>
            </div>
          </div>

          {/* Formulario de checkout */}
          <CheckoutForm planoId={plano.id} />
        </div>
      </div>
    </div>
  )
}
