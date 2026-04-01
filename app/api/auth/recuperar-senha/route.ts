import { enviarRecuperacaoSenha } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { addHours } from 'date-fns'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email e obrigatorio' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    // Sempre retornar sucesso para nao revelar emails cadastrados
    if (!user) {
      return NextResponse.json({ message: 'Email enviado se cadastrado' })
    }

    // Remover tokens anteriores
    await prisma.passwordResetToken.deleteMany({ where: { email } })

    const token = randomBytes(32).toString('hex')
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt: addHours(new Date(), 1),
      },
    })

    await enviarRecuperacaoSenha(email, user.nome, token)

    return NextResponse.json({ message: 'Email enviado se cadastrado' })
  } catch (error) {
    console.error('[RECUPERAR_SENHA]', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
