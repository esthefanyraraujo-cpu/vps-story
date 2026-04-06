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

  // IDs dos Snapshots conforme o tamanho do disco (Hetzner exige isso)
  // O Snapshot 320 (seu novo ID) so funciona no plano Ultra de 320GB
  const SNAPSHOTS_WINDOWS = {
    '80': '373331653', // Snapshot antigo ou um novo de 80GB
    '160': '373331653', // Snapshot de 160GB
    '320': '373866889'  // Seu novo ID de 320GB
  }

  // Selecionar o ID correto conforme o SSD do plano
  const ssdPlano = pagamento.plano.ssd.toString()
  const WINDOWS_SNAPSHOT_ID = SNAPSHOTS_WINDOWS[ssdPlano as keyof typeof SNAPSHOTS_WINDOWS] || SNAPSHOTS_WINDOWS['80']

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
