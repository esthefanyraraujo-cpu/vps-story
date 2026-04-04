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

  // Gerar uma senha forte para o Windows (mínimo 12 caracteres, letras, números e símbolos)
  const windowsPassword = Math.random().toString(36).slice(-4) + 
                          Math.random().toString(36).toUpperCase().slice(-4) + 
                          "@" + Math.floor(100 + Math.random() * 900);

  // Script Cloud-Init para instalar Windows automaticamente (usando o método mais robusto e garantido do InstallNET.sh)
  // Este script detecta automaticamente a rede da Hetzner e instala o Windows Server 2022 com a senha definida.
  const windowsUserData = isWindows ? `#cloud-config
runcmd:
  - apt-get update
  - apt-get install -y wget
  - wget --no-check-certificate -qO /tmp/InstallNET.sh 'https://raw.githubusercontent.com/leitbogioro/Tools/master/Network-Reinstall/Network-Reinstall-OS.sh'
  - chmod a+x /tmp/InstallNET.sh
  - bash /tmp/InstallNET.sh -windows 2022 -lang "pt-br" -pwd "${windowsPassword}"
` : undefined

  // Criar servidor na Hetzner
  const { server, rootPassword } = await criarServidor(
    nomeServidor,
    pagamento.plano.hetznerTipo,
    'ubuntu-22.04',
    windowsUserData
  )

  const ip = server.public_net.ipv4?.ip || ''
  // Se for Windows, usamos a senha que geramos para o script. Se for Linux, usamos a da Hetzner.
  const senhaFinal = isWindows ? windowsPassword : rootPassword
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
