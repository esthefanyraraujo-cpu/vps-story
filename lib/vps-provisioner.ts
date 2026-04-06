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
  // IMPORTANTE: O tamanho do snapshot DEVE ser menor ou igual ao disco do plano (cx33=80GB, cx43=160GB, etc)
  const SNAPSHOTS_WINDOWS = {
    '40': '373919623',  // VPS Teste Admin (40GB) - ATENCAO: Se o snapshot for 80GB e o plano 40GB, vai falhar.
    '80': '373919623',  // Windows Starter (80GB) - NOVO SNAPSHOT MESTRE (80GB)
    '160': '373919887', // Windows Pro (160GB) - NOVO SNAPSHOT MESTRE (160GB)
    '320': '373866889'  // Windows Ultra (320GB) - SNAPSHOT (320GB)
  }

  // Selecionar o ID correto conforme o SSD do plano
  const ssdPlano = pagamento.plano.ssd
  let WINDOWS_SNAPSHOT_ID = SNAPSHOTS_WINDOWS[ssdPlano.toString() as keyof typeof SNAPSHOTS_WINDOWS]

  // Se nao encontrar snapshot exato para o tamanho, tenta o de 80GB que e o mais compativel
  if (!WINDOWS_SNAPSHOT_ID) {
    console.warn(`[PROVISIONER] Nenhum snapshot mapeado para SSD de ${ssdPlano}GB. Usando fallback de 80GB.`)
    WINDOWS_SNAPSHOT_ID = SNAPSHOTS_WINDOWS['80']
  }

  // Verificacao de seguranca: Hetzner nao permite snapshot maior que o disco
  // Snapshot 373919623 tem 80GB. Se o plano for 40GB, vai dar erro.
  if (isWindows && ssdPlano < 80 && WINDOWS_SNAPSHOT_ID === '373919623') {
    throw new Error(`Erro: O plano ${pagamento.plano.nome} possui apenas ${ssdPlano}GB, mas o snapshot do Windows exige no minimo 80GB.`)
  }

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

    // Criar ticket de boas-vindas (Notificação no Painel)
    await tx.ticket.create({
      data: {
        userId: pagamento.userId,
        titulo: `Bem-vindo à sua nova VPS: ${nomeServidor}`,
        prioridade: 'MEDIA',
        status: 'RESPONDIDO',
        mensagens: {
          create: {
            autorId: (await tx.user.findFirst({ where: { role: 'ADMIN' } }))?.id || pagamento.userId,
            mensagem: `Olá ${pagamento.user.nome}! Sua VPS foi provisionada com sucesso.\n\nIP: ${ip}\nSenha: ${senhaFinal}\n\nJá enviamos esses dados para o seu e-mail também. Aproveite!`
          }
        }
      }
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
