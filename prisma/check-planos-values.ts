import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const planos = await prisma.plano.findMany()
  console.log(JSON.stringify(planos, null, 2))
}

main().finally(() => prisma.$disconnect())
