import Link from 'next/link'

export function LandingHero() {
  return (
    <section className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white py-24 px-4">
      <div className="container mx-auto text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 bg-purple-700/50 border border-purple-500/50 rounded-full px-4 py-1.5 text-sm mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span>Servidores online 24/7 com 99.9% de uptime</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          VPS de Alta Performance{' '}
          <span className="text-purple-300">para o seu Negocio</span>
        </h1>

        <p className="text-xl text-purple-200 mb-10 max-w-2xl mx-auto">
          Servidores VPS com SSD NVMe, processadores modernos e rede de alta velocidade.
          Ideal para sites, aplicacoes, jogos e muito mais.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/planos"
            className="bg-white text-purple-900 hover:bg-purple-50 font-bold py-3.5 px-8 rounded-xl transition-colors text-lg"
          >
            Ver Planos e Precos
          </Link>
          <Link
            href="/registro"
            className="border border-white/30 hover:bg-white/10 text-white font-semibold py-3.5 px-8 rounded-xl transition-colors text-lg"
          >
            Criar Conta Gratis
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-8 max-w-lg mx-auto text-center">
          <div>
            <p className="text-3xl font-bold">99.9%</p>
            <p className="text-purple-300 text-sm mt-1">Uptime garantido</p>
          </div>
          <div>
            <p className="text-3xl font-bold">&lt;1min</p>
            <p className="text-purple-300 text-sm mt-1">Tempo de ativacao</p>
          </div>
          <div>
            <p className="text-3xl font-bold">24/7</p>
            <p className="text-purple-300 text-sm mt-1">Suporte tecnico</p>
          </div>
        </div>
      </div>
    </section>
  )
}
