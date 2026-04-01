import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const planos = await prisma.plano.findMany({
      where: { ativo: true },
      orderBy: { precoMensal: 'asc' },
      select: {
        id: true,
        nome: true,
        descricao: true,
        ram: true,
        cpu: true,
        ssd: true,
        banda: true,
        precoMensal: true,
      },
    })

    return NextResponse.json(planos)
  } catch (error) {
    console.error('[PLANOS_PUBLIC]', error)
    return NextResponse.json({ error: 'Erro ao buscar planos' }, { status: 500 })
  }
}
