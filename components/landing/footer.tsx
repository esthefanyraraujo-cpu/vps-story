import Link from 'next/link'

export function LandingFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="font-bold text-white text-lg">VPS Store</span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Servidores VPS de alto desempenho para aplicacoes, sites e jogos.
              Infraestrutura confiavel com suporte especializado.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Produto</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/planos" className="hover:text-white transition-colors">Planos</Link></li>
              <li><Link href="#features" className="hover:text-white transition-colors">Recursos</Link></li>
              <li><Link href="#faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Conta</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white transition-colors">Entrar</Link></li>
              <li><Link href="/registro" className="hover:text-white transition-colors">Criar conta</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Meu Painel</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} VPS Store. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
