'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  vpsId: string
  status: string
}

export function VPSActions({ vpsId, status }: Props) {
  const router = useRouter()
  const [carregando, setCarregando] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState('')

  async function executarAcao(acao: string) {
    setCarregando(acao)
    setMensagem('')

    const res = await fetch(`/api/vps/${vpsId}/acao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao }),
    })

    const data = await res.json()
    setCarregando(null)

    if (res.ok) {
      setMensagem(`Acao "${acao}" executada com sucesso!`)
      router.refresh()
    } else {
      setMensagem(data.error || 'Erro ao executar acao')
    }
  }

  if (status === 'CANCELADO') {
    return (
      <p className="text-gray-500 text-sm">Este servidor foi cancelado e nao pode ser gerenciado.</p>
    )
  }

  return (
    <div className="space-y-4">
      {mensagem && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          {mensagem}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => executarAcao('ligar')}
          disabled={!!carregando || status !== 'SUSPENSO'}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {carregando === 'ligar' ? 'Ligando...' : 'Ligar'}
        </button>

        <button
          onClick={() => executarAcao('reiniciar')}
          disabled={!!carregando || status !== 'ATIVO'}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {carregando === 'reiniciar' ? 'Reiniciando...' : 'Reiniciar'}
        </button>

        <button
          onClick={() => executarAcao('desligar')}
          disabled={!!carregando || status !== 'ATIVO'}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {carregando === 'desligar' ? 'Desligando...' : 'Desligar'}
        </button>
      </div>

      <p className="text-xs text-gray-400">
        Atencao: o reinicio pode levar alguns segundos para o servidor voltar a ficar disponivel.
      </p>
    </div>
  )
}
