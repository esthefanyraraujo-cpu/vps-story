import 'dotenv/config'
import { Resend } from 'resend'

async function main() {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey || resendKey.includes('re_...')) {
    console.error('ERRO: RESEND_API_KEY não configurada corretamente no .env')
    return
  }

  const resend = new Resend(resendKey)

  console.log('Enviando e-mail de teste via Resend...')

  const { data, error } = await resend.emails.send({
    from: 'VPS Store <onboarding@resend.dev>',
    to: ['esthefanyraraujo@gmail.com'], // E-mail verificado na conta do Resend
    subject: 'Teste de Automação - VPS Store',
    html: `
      <h1>Teste de E-mail Concluído!</h1>
      <p>Olá! Este é um e-mail de teste da sua loja de VPS.</p>
      <p><b>Status:</b> Automação de e-mail configurada com sucesso.</p>
      <br>
      <p>Quando um cliente comprar, ele receberá algo assim:</p>
      <hr>
      <h3>Dados da sua nova VPS</h3>
      <p><b>IP:</b> 46.225.173.208</p>
      <p><b>Usuário:</b> Administrator</p>
      <p><b>Senha:</b> SenhaAleatoria123</p>
      <hr>
    `
  })

  if (error) {
    console.error('Erro ao enviar e-mail:', JSON.stringify(error, null, 2))
    return
  }

  console.log('E-mail enviado com sucesso! ID:', data?.id)
  console.log('Verifique a caixa de entrada (e o spam) do e-mail de destino.')
}

main()
