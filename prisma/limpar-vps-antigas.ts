import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando limpeza das VPS antigas para novo teste com InstallNET...')

  const vpsIds = [
    'cmnkpdfm900041430gpaqesks',
    'cmnkqc5yn000410b8tf02vnc6'
  ]

  // 1. Desvincular pagamentos
  await prisma.pagamento.updateMany({
    where: { vpsId: { in: vpsIds } },
    data: { vpsId: null }
  })

  // 2. Excluir as VPS
  const deleted = await prisma.vPS.deleteMany({
    where: { id: { in: vpsIds } }
  })

  console.log(`${deleted.count} VPS antigas excluídas com sucesso.`)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
