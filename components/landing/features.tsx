const features = [
  {
    icon: '⚡',
    title: 'SSD NVMe Ultra-Rapido',
    description: 'Armazenamento NVMe com velocidade de leitura e escrita superior para maxima performance.',
  },
  {
    icon: '🌐',
    title: 'Rede de Alta Velocidade',
    description: 'Conectividade de 1 Gbps com multiplos pontos de presenca para baixa latencia.',
  },
  {
    icon: '🔒',
    title: 'Seguranca Total',
    description: 'Firewall dedicado, backup automatico e protecao contra DDoS inclusos em todos os planos.',
  },
  {
    icon: '📊',
    title: 'Painel de Controle',
    description: 'Gerencie seus servidores, visualize metricas e acesse logs em tempo real.',
  },
  {
    icon: '🚀',
    title: 'Ativacao Instantanea',
    description: 'Seu servidor e ativado automaticamente apos a confirmacao do pagamento.',
  },
  {
    icon: '🛠',
    title: 'Suporte 24/7',
    description: 'Equipe tecnica disponivel a qualquer hora para resolver seus problemas rapidamente.',
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className="py-20 bg-white px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Por que escolher a VPS Store?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Oferecemos infraestrutura de ponta com os melhores recursos do mercado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="p-6 rounded-xl border hover:border-purple-300 transition-colors">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
