import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const vps = await prisma.vPS.findMany({
    include: { plano: true }
  })
  console.log(JSON.stringify(vps, null, 2))
}

main().finally(() => prisma.$disconnect())
