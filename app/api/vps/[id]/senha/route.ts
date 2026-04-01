import { auth } from '@/lib/auth'
import { decrypt } from '@/lib/crypto'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface Params {
  params: { id: string }
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const vps = await prisma.vPS.findUnique({
      where: { id: params.id },
    })

    if (!vps) {
      return NextResponse.json({ error: 'VPS nao encontrada' }, { status: 404 })
    }

    // Verificar se o usuario e dono ou admin
    if (vps.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    if (!vps.rootPasswordEncrypted) {
      return NextResponse.json({ error: 'Senha nao disponivel' }, { status: 404 })
    }

    const senha = decrypt(vps.rootPasswordEncrypted)
    return NextResponse.json({ senha })
  } catch (error) {
    console.error('[VPS_SENHA]', error)
    return NextResponse.json({ error: 'Erro ao obter senha' }, { status: 500 })
  }
}
