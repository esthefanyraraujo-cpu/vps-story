import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Atualizando planos para tipos CPX (AMD) devido a falta de estoque em nbg1...')
  
  await prisma.plano.updateMany({
    where: { hetznerTipo: 'cx33' },
    data: { hetznerTipo: 'cpx22' }
  })

  await prisma.plano.updateMany({
    where: { hetznerTipo: 'cx43' },
    data: { hetznerTipo: 'cpx32' }
  })

  await prisma.plano.updateMany({
    where: { hetznerTipo: 'cx53' },
    data: { hetznerTipo: 'cpx42' }
  })

  console.log(`Sucesso! Planos atualizados para a nova infraestrutura.`)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
