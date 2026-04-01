'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

interface Props {
  ticketId: string
}

export function TicketMensagemForm({ ticketId }: Props) {
  const router = useRouter()
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ mensagem: string }>()

  async function onSubmit(data: { mensagem: string }) {
    setCarregando(true)
    setErro('')

    const res = await fetch(`/api/tickets/${ticketId}/mensagens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const json = await res.json()
    setCarregando(false)

    if (!res.ok) {
      setErro(json.error || 'Erro ao enviar mensagem')
      return
    }

    reset()
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border p-4 space-y-3">
      <h3 className="font-medium text-gray-900">Responder</h3>

      {erro && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {erro}
        </div>
      )}

      <textarea
        {...register('mensagem', { required: 'Mensagem nao pode ser vazia' })}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
        placeholder="Digite sua mensagem..."
      />
      {errors.mensagem && <p className="text-sm text-red-600">{errors.mensagem.message}</p>}

      <button
        type="submit"
        disabled={carregando}
        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        {carregando ? 'Enviando...' : 'Enviar Resposta'}
      </button>
    </form>
  )
}
