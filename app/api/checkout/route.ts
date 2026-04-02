import { auth } from '@/lib/auth'
import { criarPreferencia } from '@/lib/mercadopago'
import { criarOrdemPagSeguro } from '@/lib/pagseguro'
import { prisma } from '@/lib/prisma'
import { criarCheckoutSession } from '@/lib/stripe'
import { checkoutSchema } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const result = checkoutSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { planoId, gateway, cpf } = result.data

    const plano = await prisma.plano.findUnique({ where: { id: planoId, ativo: true } })
    if (!plano) {
      return NextResponse.json({ error: 'Plano nao encontrado' }, { status: 404 })
    }

    // Criar registro de pagamento pendente
    const pagamento = await prisma.pagamento.create({
      data: {
        userId: session.user.id,
        planoId,
        valor: plano.precoMensal,
        gateway,
        status: 'PENDENTE',
      },
    })

    let redirectUrl = ''

    if (gateway === 'MP') {
      redirectUrl = await criarPreferencia(
        { nome: plano.nome, precoMensal: plano.precoMensal },
        pagamento.id
      )
    } else if (gateway === 'STRIPE') {
      redirectUrl = await criarCheckoutSession(
        { nome: plano.nome, precoMensal: plano.precoMensal },
        pagamento.id
      )
    } else if (gateway === 'PAGSEGURO') {
      if (!cpf) {
        return NextResponse.json({ error: 'CPF e obrigatorio para PagSeguro' }, { status: 400 })
      }
      redirectUrl = await criarOrdemPagSeguro(
        { nome: plano.nome, precoMensal: plano.precoMensal },
        pagamento.id,
        cpf
      )
    }

    return NextResponse.json({ url: redirectUrl })
  } catch (error) {
    console.error('[CHECKOUT]', error)
    return NextResponse.json({ error: 'Erro ao processar pagamento' }, { status: 500 })
  }
}
