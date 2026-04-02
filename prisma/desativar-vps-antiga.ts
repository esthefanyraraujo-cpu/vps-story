import { PrismaClient } from '@prisma/client'
import { deletarServidor } from '../lib/hetzner'

const prisma = new PrismaClient()

async function main() {
  const vpsId = 'cmnglsnkx0004lhwldklp1fa7'
  const hetznerServerId = 125617621

  console.log(`--- Desativando VPS Antiga ---`)
  console.log(`ID: ${vpsId}`)
  console.log(`Hetzner ID: ${hetznerServerId}`)

  try {
    // 1. Deletar na Hetzner
    console.log('Deletando servidor na Hetzner...')
    await deletarServidor(hetznerServerId)
    console.log('Servidor deletado na Hetzner com sucesso.')

    // 2. Atualizar status no banco de dados para CANCELADO (ou deletar se preferir)
    console.log('Atualizando status no banco de dados...')
    await prisma.vPS.update({
      where: { id: vpsId },
      data: { status: 'CANCELADO' }
    })
    console.log('Status atualizado para CANCELADO.')

    console.log('--- SUCESSO ---')
  } catch (error) {
    console.error('Erro ao desativar VPS:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
