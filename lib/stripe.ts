import Stripe from 'stripe'

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY nao definido')
  return new Stripe(key, { apiVersion: '2025-02-24.acacia' as any })
}

interface PlanoInfo {
  nome: string
  precoMensal: number | string | any
}

export async function criarCheckoutSession(
  plano: PlanoInfo,
  pagamentoId: string
): Promise<string> {
  const stripe = getStripe()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'brl',
          product_data: { name: `VPS - ${plano.nome}` },
          unit_amount: Math.round(Number(plano.precoMensal) * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: { pagamentoId },
    success_url: `${appUrl}/dashboard?pagamento=sucesso`,
    cancel_url: `${appUrl}/checkout/${pagamentoId}?pagamento=cancelado`,
  })

  return session.url!
}
