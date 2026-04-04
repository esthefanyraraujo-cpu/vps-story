import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando exclusão definitiva das VPS...')

  // 1. Desvincular pagamentos das VPS para evitar erro de chave estrangeira
  const updatePagamentos = await prisma.pagamento.updateMany({
    where: {
      vpsId: {
        in: ['cmngyvxm50004zrmzwwu4qnfo', 'cmni5vown00047tyfs09s4nmp']
      }
    },
    data: {
      vpsId: null
    }
  })
  console.log(`${updatePagamentos.count} pagamentos desvinculados.`)

  // 2. Excluir as VPS
  const deleteVps = await prisma.vPS.deleteMany({
    where: {
      id: {
        in: ['cmngyvxm50004zrmzwwu4qnfo', 'cmni5vown00047tyfs09s4nmp']
      }
    }
  })
  console.log(`${deleteVps.count} VPS excluídas com sucesso.`)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
