import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando exclusão da VPS de teste com erro...')

  const vpsId = 'cmnknbasc0004n873c8is1xee'

  // 1. Desvincular pagamentos
  await prisma.pagamento.updateMany({
    where: { vpsId },
    data: { vpsId: null }
  })

  // 2. Excluir a VPS
  const deleted = await prisma.vPS.delete({
    where: { id: vpsId }
  })

  console.log(`VPS ${deleted.nome} excluída do banco de dados com sucesso.`)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
