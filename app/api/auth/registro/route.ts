import { prisma } from '@/lib/prisma'
import { registroSchema } from '@/lib/validations'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = registroSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { nome, email, senha } = result.data

    // Verificar se email ja existe
    const existente = await prisma.user.findUnique({ where: { email } })
    if (existente) {
      return NextResponse.json(
        { error: 'Este email ja esta em uso' },
        { status: 409 }
      )
    }

    const senhaHash = await bcrypt.hash(senha, 12)

    await prisma.user.create({
      data: { nome, email, senha: senhaHash },
    })

    return NextResponse.json({ message: 'Conta criada com sucesso' }, { status: 201 })
  } catch (error) {
    console.error('[REGISTRO]', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
