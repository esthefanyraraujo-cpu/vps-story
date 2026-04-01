'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  planoId: string
}

const gateways = [
  { value: 'MP', label: 'Mercado Pago', descricao: 'PIX, boleto ou cartao de credito' },
  { value: 'STRIPE', label: 'Cartao Internacional', descricao: 'Visa, Mastercard, Amex via Stripe' },
  { value: 'PAGSEGURO', label: 'PagSeguro', descricao: 'PIX, boleto ou cartao via PagSeguro' },
]

export function CheckoutForm({ planoId }: Props) {
  const router = useRouter()
  const [gateway, setGateway] = useState<'MP' | 'STRIPE' | 'PAGSEGURO'>('MP')
  const [cpf, setCpf] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleCheckout() {
    if (gateway === 'PAGSEGURO' && !cpf) {
      setErro('CPF e obrigatorio para PagSeguro')
      return
    }

    setCarregando(true)
    setErro('')

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planoId, gateway, cpf }),
    })

    const data = await res.json()
    setCarregando(false)

    if (!res.ok) {
      setErro(data.error || 'Erro ao processar pagamento')
      return
    }

    if (data.url) {
      window.location.href = data.url
    }
  }

  return (
    <div className="bg-white rounded-xl border p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Forma de Pagamento</h2>

      {erro && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {erro}
        </div>
      )}

      <div className="space-y-3">
        {gateways.map((gw) => (
          <label
            key={gw.value}
            className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
              gateway === gw.value ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <input
              type="radio"
              name="gateway"
              value={gw.value}
              checked={gateway === gw.value as typeof gateway}
              onChange={(e) => setGateway(e.target.value as typeof gateway)}
              className="mt-0.5 accent-purple-600"
            />
            <div>
              <p className="font-medium text-gray-900">{gw.label}</p>
              <p className="text-sm text-gray-500">{gw.descricao}</p>
            </div>
          </label>
        ))}
      </div>

      {gateway === 'PAGSEGURO' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CPF (obrigatorio para PagSeguro)
          </label>
          <input
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="000.000.000-00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={carregando}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors text-lg"
      >
        {carregando ? 'Redirecionando...' : 'Finalizar Compra'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Pagamento seguro. Seu servidor sera ativado imediatamente apos a confirmacao.
      </p>
    </div>
  )
}
