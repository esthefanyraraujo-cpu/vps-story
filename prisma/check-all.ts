import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const [users, planos, vps, pagamentos, tickets] = await Promise.all([
    prisma.user.count(),
    prisma.plano.count(),
    prisma.vPS.count(),
    prisma.pagamento.count(),
    prisma.ticket.count()
  ])
  
  console.log('--- Database Summary ---')
  console.log('Users:', users)
  console.log('Planos:', planos)
  console.log('VPS:', vps)
  console.log('Pagamentos:', pagamentos)
  console.log('Tickets:', tickets)
}

main().finally(() => prisma.$disconnect())
