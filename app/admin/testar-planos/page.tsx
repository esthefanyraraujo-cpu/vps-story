import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { formatarMoeda } from '@/lib/utils'
import { CriarVPSManual } from '@/components/admin/criar-vps-manual'

async function getPlanos() {
  return prisma.plano.findMany({
    orderBy: { precoMensal: 'asc' },
  })
}

export default async function AdminTestarPlanosPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/login')

  const planos = await getPlanos()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Modo de Teste do Administrador</h1>
        <p className="text-gray-500">
          Aqui voce pode criar qualquer VPS para sua propria conta sem custo e sem passar pelo checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planos.map((plano) => (
          <div key={plano.id} className="bg-white rounded-xl border p-6 flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900">{plano.nome}</h3>
              <span className={`text-xs px-2 py-1 rounded-full font-bold ${plano.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {plano.ativo ? 'PUBLICO' : 'OCULTO'}
              </span>
            </div>
            
            <div className="space-y-2 mb-6 flex-1">
              <p className="text-sm text-gray-600">{plano.descricao}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 pt-2">
                <p>RAM: {plano.ram}GB</p>
                <p>CPU: {plano.cpu} vCPUs</p>
                <p>SSD: {plano.ssd}GB</p>
                <p>Tipo: {plano.hetznerTipo}</p>
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs text-gray-400 line-through">
                  <span>Preco Real:</span>
                  <span>{formatarMoeda(plano.precoMensal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Preco Admin (99% OFF):</span>
                  <span className="text-xl font-black text-green-600">
                    {formatarMoeda(Number(plano.precoMensal) * 0.01)}
                  </span>
                </div>
              </div>
              
              <CriarVPSManual 
                userId={session.user.id} 
                userName="Sua Conta (Admin)" 
                planoId={plano.id}
                planoNome={plano.nome}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
