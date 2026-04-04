import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const vps = await prisma.vPS.findMany({
    where: {
      OR: [
        { ip: '77.42.43.224' },
        { id: 'cmnkvyr2z0004ezock97sicqp' }
      ]
    }
  })
  
  if (vps.length > 0) {
    console.log('VPS ENCONTRADA NO BANCO:')
    console.log(JSON.stringify(vps, null, 2))
  } else {
    console.log('NENHUMA VPS COM IP 77.42.43.224 OU ID cmnkvyr2z0004ezock97sicqp ENCONTRADA NO BANCO.')
  }
}

main().finally(() => prisma.$disconnect())
