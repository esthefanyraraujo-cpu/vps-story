import crypto from 'crypto'
import { MercadoPagoConfig, Preference } from 'mercadopago'

function getClient() {
  const token = process.env.MP_ACCESS_TOKEN
  if (!token) throw new Error('MP_ACCESS_TOKEN nao definido')
  return new MercadoPagoConfig({ accessToken: token })
}

interface PlanoInfo {
  nome: string
  precoMensal: number | string | any
}

export async function criarPreferencia(
  plano: PlanoInfo,
  pagamentoId: string
): Promise<string> {
  const client = getClient()
  const preference = new Preference(client)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const result = await preference.create({
    body: {
      items: [
        {
          id: pagamentoId,
          title: `VPS - ${plano.nome}`,
          quantity: 1,
          unit_price: Number(plano.precoMensal),
          currency_id: 'BRL',
        },
      ],
      external_reference: pagamentoId,
      back_urls: {
        success: `${appUrl}/dashboard?pagamento=sucesso`,
        failure: `${appUrl}/checkout?pagamento=falhou`,
        pending: `${appUrl}/dashboard?pagamento=pendente`,
      },
      auto_return: 'approved',
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
    },
  })

  return result.init_point!
}

export function validarWebhookMP(
  xSignature: string,
  xRequestId: string,
  dataId: string
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return false

  const ts = xSignature.split(',').find((p) => p.startsWith('ts='))?.split('=')[1]
  const v1 = xSignature.split(',').find((p) => p.startsWith('v1='))?.split('=')[1]

  if (!ts || !v1) return false

  const message = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const hmac = crypto.createHmac('sha256', secret).update(message).digest('hex')

  return hmac === v1
}
