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

  // Script Cloud-Init para instalar Windows automaticamente (exemplo funcional para Hetzner)
  // Este script baixa e instala uma imagem Windows via DD em uma instancia Linux
  const windowsUserData = isWindows ? `#cloud-config
runcmd:
  - curl -L -o /tmp/win.gz https://github.com/bin456789/reinstall/releases/download/v1.0/reinstall.sh
  - bash /tmp/win.gz windows --image-name 'Windows Server 2022' --lang 'pt-br'
` : undefined

  // Criar servidor na Hetzner - capturar root_password IMEDIATAMENTE
  const { server, rootPassword } = await criarServidor(
    nomeServidor,
    pagamento.plano.hetznerTipo,
    'ubuntu-22.04', // Imagem base Linux para rodar o script de instalacao
    windowsUserData
  )

  const ip = server.public_net.ipv4?.ip || ''
  const senhaEncriptada = encrypt(rootPassword)

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
    rootPassword, // enviamos a senha original, nao encriptada
    nomeServidor
  )
}
