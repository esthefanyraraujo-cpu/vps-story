'use client'

import { useState } from 'react'

const faqs = [
  {
    pergunta: 'Como funciona a ativacao do servidor?',
    resposta: 'Apos a confirmacao do pagamento, seu servidor VPS e ativado automaticamente em menos de 1 minuto. Voce recebe um email com o IP e as credenciais de acesso.',
  },
  {
    pergunta: 'Quais metodos de pagamento sao aceitos?',
    resposta: 'Aceitamos Mercado Pago (PIX, cartao, boleto), Stripe (cartao internacional) e PagSeguro.',
  },
  {
    pergunta: 'Posso fazer upgrade de plano?',
    resposta: 'Sim! Voce pode solicitar o upgrade a qualquer momento entrando em contato com nosso suporte via ticket.',
  },
  {
    pergunta: 'Qual sistema operacional e instalado?',
    resposta: 'Por padrao instalamos Ubuntu 22.04 LTS. Outros sistemas operacionais podem ser solicitados via suporte.',
  },
  {
    pergunta: 'Ha politica de reembolso?',
    resposta: 'Oferecemos reembolso completo em ate 7 dias a partir da ativacao caso nao fique satisfeito.',
  },
  {
    pergunta: 'Os servidores ficam no Brasil?',
    resposta: 'Nossos servidores ficam na Europa (Alemanha) com excelente conectividade para o Brasil. Oferecemos baixa latencia para a maioria das aplicacoes.',
  },
]

export function LandingFAQ() {
  const [aberto, setAberto] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 bg-white px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
          <p className="text-gray-600 text-lg">Tire suas duvidas sobre nossos servicos.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border rounded-xl overflow-hidden">
              <button
                className="w-full text-left p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => setAberto(aberto === i ? null : i)}
              >
                <span className="font-medium text-gray-900">{faq.pergunta}</span>
                <span className={`text-gray-400 transition-transform ${aberto === i ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {aberto === i && (
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t bg-gray-50">
                  <p className="pt-4">{faq.resposta}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
