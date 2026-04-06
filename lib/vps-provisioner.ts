import { decrypt, encrypt } from '@/lib/crypto'
import { enviarCredenciaisVPS } from '@/lib/email'
import { criarServidor } from '@/lib/hetzner'
import { prisma } from '@/lib/prisma'
import { addDays } from 'date-fns'

export async function provisionarVPS(pagamentoId: string): Promise<void> {
  // Buscar pagamento
  const pagamento = await prisma.pagamento.findUnique({
    where: { id: pagamentoId },
    include: { user: true, plano: true },
  })

  if (!pagamento) throw new Error(`Pagamento ${pagamentoId} nao encontrado`)

  // Idempotencia: ja processado
  if (pagamento.status === 'PAGO') {
    console.log(`Pagamento ${pagamentoId} ja processado, ignorando`)
    return
  }

  const nomeServidor = `vps-${pagamento.userId.slice(-6)}-${Date.now()}`
  const isWindows = pagamento.plano.nome.toLowerCase().includes('windows')

  // Gerar uma senha forte aleatoria para cada cliente
  const novaSenhaAleatoria = Math.random().toString(36).slice(-4) + 
                             Math.random().toString(36).toUpperCase().slice(-4) + 
                             "@" + Math.floor(100 + Math.random() * 900);

  // ID do Snapshot da Imagem Mestra
  const WINDOWS_SNAPSHOT_ID = '373866889'

  // Script para trocar a senha do Windows no primeiro boot (Cloud-Init / Cloudbase-Init)
  // Usando formato PowerShell (#ps1_sysnative) que e mais nativo para Windows
  const windowsUserData = isWindows ? `#ps1_sysnative
net user Administrator "${novaSenhaAleatoria}"
` : undefined

  const imagemBase = isWindows ? WINDOWS_SNAPSHOT_ID : 'ubuntu-22.04'

  // Criar servidor na Hetzner
  const { server, rootPassword } = await criarServidor(
    nomeServidor,
    pagamento.plano.hetznerTipo,
    imagemBase,
    windowsUserData // O Windows vai usar esse script para trocar a senha fixa pela aleatoria
  )

  const ip = server.public_net.ipv4?.ip || ''
  
  // A senha final sera a aleatoria para Windows ou a da Hetzner para Linux
  const senhaFinal = isWindows ? novaSenhaAleatoria : rootPassword 
  const senhaEncriptada = encrypt(senhaFinal)

  // Transacao atomica: atualizar pagamento + criar VPS
  await prisma.$transaction(async (tx) => {
    const vps = await tx.vPS.create({
      data: {
        userId: pagamento.userId,
        planoId: pagamento.planoId,
        hetznerServerId: server.id,
        nome: nomeServidor,
        ip,
        rootPasswordEncrypted: senhaEncriptada,
        status: 'ATIVO',
        dataExpiracao: addDays(new Date(), 30),
      },
    })

    await tx.pagamento.update({
      where: { id: pagamentoId },
      data: {
        status: 'PAGO',
        vpsId: vps.id,
      },
    })
  })

  // Enviar email com credenciais
  await enviarCredenciaisVPS(
    pagamento.user.email,
    pagamento.user.nome,
    ip,
    senhaFinal,
    nomeServidor
  )
}
