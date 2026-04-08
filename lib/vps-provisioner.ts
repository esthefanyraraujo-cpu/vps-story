import { decrypt, encrypt } from '@/lib/crypto'
import { enviarCredenciaisVPS } from '@/lib/email'
import { criarServidor } from '@/lib/hetzner'
import { prisma } from '@/lib/prisma'
import { addDays } from 'date-fns'

export async function provisionarVPS(pagamentoId: string): Promise<void> {
  try {
    console.log(`[PROVISIONER] Iniciando provisionamento para Pagamento: ${pagamentoId}`)
  // Buscar pagamento
  const pagamento = await prisma.pagamento.findUnique({
    where: { id: pagamentoId },
    include: { user: true, plano: true },
  })

  if (!pagamento) {
    console.error(`[PROVISIONER] Erro: Pagamento ${pagamentoId} nao encontrado no banco`)
    throw new Error(`Pagamento ${pagamentoId} nao encontrado`)
  }

  console.log(`[PROVISIONER] Plano: ${pagamento.plano.nome} | SSD: ${pagamento.plano.ssd}GB | Usuario: ${pagamento.user.email}`)

  // Idempotencia: ja processado
  if (pagamento.status === 'PAGO') {
    console.log(`[PROVISIONER] Pagamento ${pagamentoId} ja processado, ignorando`)
    return
  }

  const nomePlano = pagamento.plano.nome.toLowerCase()
  const isWindows = nomePlano.includes('windows')
  const ssdPlano = pagamento.plano.ssd
  const nomeServidor = `vps-${pagamento.userId.slice(-6)}-${Date.now()}`

  // Senha fixa padrao para Windows conforme solicitado pelo cliente
  // Para Linux, a Hetzner continuara gerando uma senha root aleatoria
  const SENHA_FIXA_WINDOWS = "psstory@12345"

  // IDs dos Snapshots conforme o tamanho do disco (Hetzner exige isso)
  // O Snapshot 374659244 e de 80GB (Starter V2)
  // O Snapshot 374663994 e de 160GB (Pro V2)
  // O Snapshot 374629373 e de 320GB (Ultra V2 - FiveM)
  const SNAPSHOTS_WINDOWS = {
    '80': '374659244',
    '160': '374663994',
    '320': '374629373'
  }

  let WINDOWS_SNAPSHOT_ID = ''

  // 1. Tentar mapear pelo nome do plano (Mais seguro)
  if (nomePlano.includes('starter')) WINDOWS_SNAPSHOT_ID = SNAPSHOTS_WINDOWS['80']
  else if (nomePlano.includes('pro')) WINDOWS_SNAPSHOT_ID = SNAPSHOTS_WINDOWS['160']
  else if (nomePlano.includes('ultra') || nomePlano.includes('fivem')) WINDOWS_SNAPSHOT_ID = SNAPSHOTS_WINDOWS['320']
  else if (nomePlano.includes('teste')) WINDOWS_SNAPSHOT_ID = SNAPSHOTS_WINDOWS['80']

  // 2. Se nao encontrar pelo nome, tenta pelo SSD exato (Reforço)
  if (!WINDOWS_SNAPSHOT_ID) {
    const ssdStr = ssdPlano.toString()
    WINDOWS_SNAPSHOT_ID = SNAPSHOTS_WINDOWS[ssdStr as keyof typeof SNAPSHOTS_WINDOWS]
    console.log(`[PROVISIONER] Mapeamento por SSD: ${ssdStr}GB -> Snapshot: ${WINDOWS_SNAPSHOT_ID}`)
  }

  // 3. Fallback final para 80GB se for Windows e ainda nao tiver ID
  if (isWindows && !WINDOWS_SNAPSHOT_ID) {
    console.warn(`[PROVISIONER] Nao foi possivel mapear snapshot para o plano ${pagamento.plano.nome}. Usando fallback 80GB.`)
    WINDOWS_SNAPSHOT_ID = SNAPSHOTS_WINDOWS['80']
  }

  // Verificacao de seguranca final para Windows
  if (isWindows) {
    if (!WINDOWS_SNAPSHOT_ID) {
      throw new Error(`Nao foi encontrado um Snapshot Windows compativel com o plano ${pagamento.plano.nome} (${ssdPlano}GB).`)
    }
    if (ssdPlano < 80) {
      throw new Error(`O plano ${pagamento.plano.nome} tem apenas ${ssdPlano}GB de SSD. O Windows exige no minimo 80GB (cx33).`)
    }
  }

  // Nao enviamos UserData para Windows pois usaremos a senha fixa do snapshot
  const windowsUserData = undefined

  const imagemBase = isWindows ? WINDOWS_SNAPSHOT_ID : 'ubuntu-22.04'

  console.log(`[PROVISIONER] Criando servidor na Hetzner: ${nomeServidor} | Tipo: ${pagamento.plano.hetznerTipo} | Imagem: ${imagemBase}`)

  // Criar servidor na Hetzner
  const { server, rootPassword } = await criarServidor(
    nomeServidor,
    pagamento.plano.hetznerTipo,
    imagemBase,
    windowsUserData // O Windows vai usar esse script para trocar a senha fixa pela aleatoria
  )

  console.log(`[PROVISIONER] Servidor criado na Hetzner com sucesso! ID: ${server.id} | IP: ${server.public_net.ipv4?.ip}`)

  const ip = server.public_net.ipv4?.ip || ''
  
  // A senha final sera a fixa para Windows ou a da Hetzner para Linux
  const senhaFinal = isWindows ? SENHA_FIXA_WINDOWS : rootPassword 
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
    try {
      await enviarCredenciaisVPS(
        pagamento.user.email,
        pagamento.user.nome,
        ip,
        senhaFinal,
        nomeServidor
      )
    } catch (e) {
      console.error(`[PROVISIONER_EMAIL_ERROR] Falha ao enviar email:`, e)
      // Nao relanca o erro para nao travar o provisionamento que ja foi concluido no banco
    }
  } catch (error: any) {
    console.error(`[PROVISIONER_FATAL_ERROR] Falha ao provisionar VPS para Pagamento ${pagamentoId}:`, error)
    // Se o erro tiver resposta da Hetzner, loga ela tambem
    if (error.message?.includes('Hetzner')) {
      console.error(`[PROVISIONER_HETZNER_ERROR] Detalhes da API:`, error.message)
    }
    throw error
  }
}
