import { getStripe } from '@/lib/stripe'
import { provisionarVPS } from '@/lib/vps-provisioner'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe()
    const sig = req.headers.get('stripe-signature')
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!sig || !webhookSecret) {
      return NextResponse.json({ error: 'Configuracao invalida' }, { status: 400 })
    }

    const rawBody = await req.text()
    let event

    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
    } catch (err) {
      console.error('[STRIPE_WEBHOOK] Assinatura invalida:', err)
      return NextResponse.json({ error: 'Assinatura invalida' }, { status: 401 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as { metadata?: { pagamentoId?: string }; payment_status: string }
      if (session.payment_status === 'paid' && session.metadata?.pagamentoId) {
        await provisionarVPS(session.metadata.pagamentoId)
      }
    }

    return NextResponse.json({ message: 'OK' })
  } catch (error) {
    console.error('[WEBHOOK_STRIPE]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
