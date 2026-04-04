import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando exclusão definitiva da VPS com problema de senha...')

  const vpsId = 'cmnkodh2b00041rhjz981pedc'

  // 1. Desvincular pagamentos
  await prisma.pagamento.updateMany({
    where: { vpsId },
    data: { vpsId: null }
  })

  // 2. Excluir a VPS
  const deleted = await prisma.vPS.delete({
    where: { id: vpsId }
  })

  console.log(`VPS ${deleted.nome} excluída com sucesso.`)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
