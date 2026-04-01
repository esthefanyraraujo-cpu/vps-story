import { auth } from '@/lib/auth'
import { deletarServidor } from '@/lib/hetzner'
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
    const { status } = body

    if (!['ATIVO', 'SUSPENSO', 'CANCELADO'].includes(status)) {
      return NextResponse.json({ error: 'Status invalido' }, { status: 400 })
    }

    const vps = await prisma.vPS.update({
      where: { id: params.id },
      data: { status },
    })

    return NextResponse.json(vps)
  } catch (error) {
    console.error('[ADMIN_VPS_PATCH]', error)
    return NextResponse.json({ error: 'Erro ao atualizar VPS' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const vps = await prisma.vPS.findUnique({ where: { id: params.id } })
    if (!vps) {
      return NextResponse.json({ error: 'VPS nao encontrada' }, { status: 404 })
    }

    // Deletar servidor na Hetzner
    await deletarServidor(vps.hetznerServerId)

    await prisma.vPS.update({
      where: { id: params.id },
      data: { status: 'CANCELADO' },
    })

    return NextResponse.json({ message: 'VPS deletada com sucesso' })
  } catch (error) {
    console.error('[ADMIN_VPS_DELETE]', error)
    return NextResponse.json({ error: 'Erro ao deletar VPS' }, { status: 500 })
  }
}
