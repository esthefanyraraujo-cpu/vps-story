import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

interface Params {
  params: { id: string }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await req.json()
    const { nome, descricao, ram, cpu, ssd, banda, precoMensal, hetznerTipo, ativo } = body

    const plano = await prisma.plano.update({
      where: { id: params.id },
      data: {
        ...(nome !== undefined && { nome }),
        ...(descricao !== undefined && { descricao }),
        ...(ram !== undefined && { ram: Number(ram) }),
        ...(cpu !== undefined && { cpu: Number(cpu) }),
        ...(ssd !== undefined && { ssd: Number(ssd) }),
        ...(banda !== undefined && { banda: Number(banda) }),
        ...(precoMensal !== undefined && { precoMensal }),
        ...(hetznerTipo !== undefined && { hetznerTipo }),
        ...(ativo !== undefined && { ativo }),
      },
    })

    return NextResponse.json(plano)
  } catch (error) {
    console.error('[ADMIN_PLANO_PATCH]', error)
    return NextResponse.json({ error: 'Erro ao atualizar plano' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Soft delete
    await prisma.plano.update({
      where: { id: params.id },
      data: { ativo: false },
    })

    return NextResponse.json({ message: 'Plano desativado' })
  } catch (error) {
    console.error('[ADMIN_PLANO_DELETE]', error)
    return NextResponse.json({ error: 'Erro ao desativar plano' }, { status: 500 })
  }
}
