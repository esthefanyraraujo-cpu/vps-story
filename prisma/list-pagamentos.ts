import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const pagamentos = await prisma.pagamento.findMany()
  console.log(JSON.stringify(pagamentos, null, 2))
}

main().finally(() => prisma.$disconnect())
