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

    const plano = await prisma.plano.findUnique({ where: { id: planoId } })
    if (!plano) {
      return NextResponse.json({ error: 'Plano nao encontrado' }, { status: 404 })
    }

    // Se o plano nao estiver ativo, so permite se for o plano de teste e o usuario for admin
    if (!plano.ativo && !(plano.nome === 'VPS Teste Admin' && session.user.role === 'ADMIN')) {
      return NextResponse.json({ error: 'Plano nao disponivel' }, { status: 403 })
    }

    // Aplicar desconto de 99% para administradores em QUALQUER plano
    let valorFinal = Number(plano.precoMensal)
    const isAdmin = session.user.role === 'ADMIN'
    
    if (isAdmin) {
      valorFinal = valorFinal * 0.01 // 99% de desconto em qualquer plano para o admin
      console.log(`[CHECKOUT] Aplicando desconto de Admin: R$ ${valorFinal} no plano ${plano.nome}`)
    }

    // Criar registro de pagamento pendente
    const pagamento = await prisma.pagamento.create({
      data: {
        userId: session.user.id,
        planoId,
        valor: valorFinal,
        gateway,
        status: 'PENDENTE',
      },
    })

    let redirectUrl = ''

    if (gateway === 'MP') {
      redirectUrl = await criarPreferencia(
        { 
          nome: isAdmin ? `${plano.nome} (Admin Teste)` : plano.nome, 
          precoMensal: valorFinal 
        },
        pagamento.id
      )
    } else if (gateway === 'STRIPE') {
      redirectUrl = await criarCheckoutSession(
        { 
          nome: isAdmin ? `${plano.nome} (Admin Teste)` : plano.nome, 
          precoMensal: valorFinal 
        },
        pagamento.id
      )
    } else if (gateway === 'PAGSEGURO') {
      if (!cpf) {
        return NextResponse.json({ error: 'CPF e obrigatorio para PagSeguro' }, { status: 400 })
      }
      redirectUrl = await criarOrdemPagSeguro(
        { 
          nome: isAdmin ? `${plano.nome} (Admin Teste)` : plano.nome, 
          precoMensal: valorFinal 
        },
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
