'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  planoId: string
  ativo: boolean
}

export function AdminPlanosActions({ planoId, ativo }: Props) {
  const router = useRouter()
  const [carregando, setCarregando] = useState(false)

  async function toggleAtivo() {
    const novoAtivo = !ativo
    const confirmacao = novoAtivo
      ? 'Reativar este plano?'
      : 'Desativar este plano? Ele nao aparecera para novos clientes.'

    if (!confirm(confirmacao)) return

    setCarregando(true)

    const res = await fetch(`/api/admin/planos/${planoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: novoAtivo }),
    })

    setCarregando(false)

    if (res.ok) {
      router.refresh()
    } else {
      alert('Erro ao atualizar plano')
    }
  }

  return (
    <button
      onClick={toggleAtivo}
      disabled={carregando}
      className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
        ativo
          ? 'bg-red-100 hover:bg-red-200 text-red-700'
          : 'bg-green-100 hover:bg-green-200 text-green-700'
      }`}
    >
      {carregando ? 'Atualizando...' : ativo ? 'Desativar Plano' : 'Reativar Plano'}
    </button>
  )
}
