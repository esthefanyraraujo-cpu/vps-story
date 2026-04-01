'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface Props {
  params: { token: string }
}

export default function RedefinirSenhaPage({ params }: Props) {
  const router = useRouter()
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{ senha: string; confirmarSenha: string }>()

  const senha = watch('senha')

  async function onSubmit(data: { senha: string; confirmarSenha: string }) {
    if (data.senha !== data.confirmarSenha) {
      setErro('As senhas nao coincidem')
      return
    }

    setCarregando(true)
    setErro('')

    const res = await fetch('/api/auth/redefinir-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: params.token, novaSenha: data.senha }),
    })

    const json = await res.json()
    setCarregando(false)

    if (!res.ok) {
      setErro(json.error || 'Erro ao redefinir senha')
      return
    }

    router.push('/login?senha=redefinida')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Nova senha</h1>
          <p className="mt-2 text-gray-600">Digite sua nova senha abaixo.</p>
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
                Nova senha
              </label>
              <input
                {...register('senha', {
                  required: 'Senha e obrigatoria',
                  minLength: { value: 8, message: 'Minimo 8 caracteres' },
                })}
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Minimo 8 caracteres"
              />
              {errors.senha && (
                <p className="mt-1 text-sm text-red-600">{errors.senha.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar senha
              </label>
              <input
                {...register('confirmarSenha', { required: 'Confirme a senha' })}
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Repita a senha"
              />
              {errors.confirmarSenha && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmarSenha.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
            >
              {carregando ? 'Redefinindo...' : 'Redefinir senha'}
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
