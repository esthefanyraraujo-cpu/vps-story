import { validarWebhookMP } from '@/lib/mercadopago'
import { provisionarVPS } from '@/lib/vps-provisioner'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const xSignature = req.headers.get('x-signature') || ''
    const xRequestId = req.headers.get('x-request-id') || ''

    const body = await req.json()
    const dataId = body?.data?.id?.toString() || ''

    // Validar assinatura do webhook
    if (xSignature && !validarWebhookMP(xSignature, xRequestId, dataId)) {
      return NextResponse.json({ error: 'Assinatura invalida' }, { status: 401 })
    }

    const tipo = body?.type
    if (tipo !== 'payment') {
      return NextResponse.json({ message: 'Evento ignorado' })
    }

    // Buscar detalhes do pagamento na API do MP
    const token = process.env.MP_ACCESS_TOKEN
    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const payment = await paymentRes.json()

    if (payment.status === 'approved') {
      const pagamentoId = payment.external_reference
      if (pagamentoId) {
        await provisionarVPS(pagamentoId)
      }
    }

    return NextResponse.json({ message: 'OK' })
  } catch (error) {
    console.error('[WEBHOOK_MP]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
