interface PlanoInfo {
  nome: string
  precoMensal: number | string | any
}

export async function criarOrdemPagSeguro(
  plano: PlanoInfo,
  pagamentoId: string,
  cpf: string
): Promise<string> {
  const token = process.env.PAGSEGURO_TOKEN
  const baseUrl = process.env.PAGSEGURO_BASE_URL || 'https://sandbox.api.pagseguro.com'

  if (!token) throw new Error('PAGSEGURO_TOKEN nao definido')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const res = await fetch(`${baseUrl}/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reference_id: pagamentoId,
      customer: {
        tax_id: cpf.replace(/\D/g, ''),
      },
      items: [
        {
          reference_id: pagamentoId,
          name: `VPS - ${plano.nome}`,
          quantity: 1,
          unit_amount: Math.round(Number(plano.precoMensal) * 100),
        },
      ],
      notification_urls: [`${appUrl}/api/webhooks/pagseguro`],
      redirect_url: `${appUrl}/dashboard?pagamento=sucesso`,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Erro PagSeguro: ${JSON.stringify(err)}`)
  }

  const data = await res.json()
  const link = data.links?.find((l: { rel: string; href: string }) => l.rel === 'PAY')
  return link?.href || `${appUrl}/dashboard`
}
