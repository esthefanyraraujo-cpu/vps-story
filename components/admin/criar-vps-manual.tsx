'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, X } from 'lucide-react'

interface Plano {
  id: string
  nome: string
}

interface Props {
  userId: string
  userName: string
  planoId?: string // Opcional: se fornecido, pula a selecao
  planoNome?: string
}

export function CriarVPSManual({ userId, userName, planoId: defaultPlanoId, planoNome }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [planos, setPlanos] = useState<Plano[]>([])
  const [planoId, setPlanoId] = useState<string>(defaultPlanoId || '')

  useEffect(() => {
    if (open && !defaultPlanoId) {
      fetch('/api/public/planos')
        .then((res) => res.json())
        .then((data) => setPlanos(data))
        .catch(() => alert('Erro ao carregar planos'))
    }
  }, [open, defaultPlanoId])

  async function handleCriar() {
    const finalPlanoId = defaultPlanoId || planoId
    if (!finalPlanoId) return

    setLoading(true)
    try {
      const res = await fetch('/api/admin/vps/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planoId }),
      })

      if (!res.ok) throw new Error()

      alert('Sucesso! A VPS está sendo provisionada.')
      setOpen(false)
    } catch (error) {
      alert('Erro ao criar VPS')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Plus className="w-4 h-4" /> Criar VPS
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900">Criar VPS Manual para {userName}</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {!defaultPlanoId ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">Selecione o Plano</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                    value={planoId}
                    onChange={(e) => setPlanoId(e.target.value)}
                  >
                    <option value="">Escolha um plano...</option>
                    {planos.map((plano) => (
                      <option key={plano.id} value={plano.id}>
                        {plano.nome}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-sm text-purple-900">
                    Você está prestes a criar uma VPS do plano <strong>{planoNome}</strong> para <strong>{userName}</strong>.
                  </p>
                </div>
              )}

              <button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={(!defaultPlanoId && !planoId) || loading}
                onClick={handleCriar}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Provisionando...' : 'Confirmar e Provisionar Agora'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
