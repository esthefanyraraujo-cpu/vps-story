import { Resend } from 'resend'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY nao definido')
  return new Resend(key)
}

const FROM = process.env.RESEND_FROM_EMAIL || 'noreply@vpsstore.com.br'

export async function enviarCredenciaisVPS(
  email: string,
  nome: string,
  ip: string,
  senha: string,
  nomeVPS: string
): Promise<void> {
  const resend = getResend()
  const isWindows = nomeVPS.toLowerCase().includes('windows') || email.includes('windows') // Heuristica simples

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Sua VPS ${nomeVPS} esta pronta! - VPS Store`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Sua VPS esta pronta!</h1>
        <p>Ola, ${nome}!</p>
        <p>Sua VPS foi criada com sucesso. Aqui estao suas credenciais de acesso:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Nome do servidor:</strong> ${nomeVPS}</p>
          <p><strong>IP:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${ip}</code></p>
          <p><strong>Usuario:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${isWindows ? 'Administrator' : 'root'}</code></p>
          <p><strong>Senha:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${senha}</code></p>
        </div>
        ${isWindows ? `
          <p><strong>Como conectar (Area de Trabalho Remota):</strong></p>
          <p>1. Abra o programa "Conexao de Area de Trabalho Remota" no seu Windows.</p>
          <p>2. Digite o IP: <strong>${ip}</strong></p>
          <p>3. Use o usuario: <strong>Administrator</strong></p>
        ` : `
          <p><strong>Como conectar (SSH):</strong></p>
          <code style="background: #1f2937; color: #10b981; padding: 10px; display: block; border-radius: 4px;">
            ssh root@${ip}
          </code>
        `}
        <p style="color: #ef4444; margin-top: 20px;">Por seguranca, altere sua senha apos o primeiro acesso!</p>
        <p>Acesse seu painel em: <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Meu Painel</a></p>
      </div>
    `,
  })
}

export async function enviarRecuperacaoSenha(
  email: string,
  nome: string,
  token: string
): Promise<void> {
  const resend = getResend()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vps-story.vercel.app'
  const link = `${appUrl}/redefinir-senha/${token}`

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Redefinicao de senha - VPS Store',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Redefinir senha</h1>
        <p>Ola, ${nome}!</p>
        <p>Recebemos uma solicitacao para redefinir sua senha. Clique no link abaixo:</p>
        <a href="${link}" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Redefinir Senha
        </a>
        <p>O link expira em 1 hora.</p>
        <p>Se voce nao solicitou isso, ignore este email.</p>
      </div>
    `,
  })
}

export async function enviarNotificacaoTicket(
  email: string,
  nome: string,
  tituloTicket: string
): Promise<void> {
  const resend = getResend()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vps-story.vercel.app'

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Resposta no ticket: ${tituloTicket} - VPS Store`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Nova resposta no seu ticket</h1>
        <p>Ola, ${nome}!</p>
        <p>Seu ticket "<strong>${tituloTicket}</strong>" recebeu uma nova resposta.</p>
        <a href="${appUrl}/dashboard/tickets" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Ver Ticket
        </a>
      </div>
    `,
  })
}
