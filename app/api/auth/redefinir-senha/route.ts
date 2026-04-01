import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { token, novaSenha } = await req.json()

    if (!token || !novaSenha) {
      return NextResponse.json({ error: 'Dados invalidos' }, { status: 400 })
    }

    if (novaSenha.length < 8) {
      return NextResponse.json(
        { error: 'Senha deve ter pelo menos 8 caracteres' },
        { status: 400 }
      )
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return NextResponse.json({ error: 'Token invalido ou expirado' }, { status: 400 })
    }

    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { token } })
      return NextResponse.json({ error: 'Token expirado' }, { status: 400 })
    }

    const senhaHash = await bcrypt.hash(novaSenha, 12)

    await prisma.user.update({
      where: { email: resetToken.email },
      data: { senha: senhaHash },
    })

    await prisma.passwordResetToken.delete({ where: { token } })

    return NextResponse.json({ message: 'Senha redefinida com sucesso' })
  } catch (error) {
    console.error('[REDEFINIR_SENHA]', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
