'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  vpsId: string
  status: string
}

export function AdminVPSActions({ vpsId, status }: Props) {
  const router = useRouter()
  const [carregando, setCarregando] = useState(false)

  async function alterarStatus(novoStatus: string) {
    if (!confirm(`Confirmar alterar status para ${novoStatus}?`)) return

    setCarregando(true)

    const res = await fetch(`/api/admin/vps/${vpsId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus }),
    })

    setCarregando(false)

    if (res.ok) {
      router.refresh()
    } else {
      alert('Erro ao atualizar status')
    }
  }

  async function deletarVPS() {
    if (!confirm('ATENCAO: Esta acao ira deletar permanentemente o servidor na Hetzner. Confirmar?')) return

    setCarregando(true)

    const res = await fetch(`/api/admin/vps/${vpsId}`, {
      method: 'DELETE',
    })

    setCarregando(false)

    if (res.ok) {
      router.refresh()
    } else {
      alert('Erro ao deletar VPS')
    }
  }

  return (
    <div className="flex items-center gap-2">
      {status === 'ATIVO' && (
        <button
          onClick={() => alterarStatus('SUSPENSO')}
          disabled={carregando}
          className="text-xs px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded font-medium transition-colors"
        >
          Suspender
        </button>
      )}
      {status === 'SUSPENSO' && (
        <button
          onClick={() => alterarStatus('ATIVO')}
          disabled={carregando}
          className="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded font-medium transition-colors"
        >
          Reativar
        </button>
      )}
      {status !== 'CANCELADO' && (
        <button
          onClick={deletarVPS}
          disabled={carregando}
          className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded font-medium transition-colors"
        >
          Deletar
        </button>
      )}
    </div>
  )
}
