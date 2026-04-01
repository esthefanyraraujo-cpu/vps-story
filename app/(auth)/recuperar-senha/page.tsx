'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export default function RecuperarSenhaPage() {
  const [enviado, setEnviado] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>()

  async function onSubmit(data: { email: string }) {
    setCarregando(true)
    setErro('')

    const res = await fetch('/api/auth/recuperar-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    setCarregando(false)

    if (!res.ok) {
      const json = await res.json()
      setErro(json.error || 'Erro ao enviar email')
      return
    }

    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email enviado!</h2>
            <p className="text-gray-600 mb-6">
              Se este email estiver cadastrado, voce receberá um link para redefinir sua senha.
            </p>
            <Link href="/login" className="text-purple-600 hover:underline font-medium">
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Recuperar senha</h1>
          <p className="mt-2 text-gray-600">
            Informe seu email para receber o link de redefinicao.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-8">
          {erro && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                {...register('email', { required: 'Email e obrigatorio' })}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
            >
              {carregando ? 'Enviando...' : 'Enviar link de recuperacao'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-purple-600 hover:underline">
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
