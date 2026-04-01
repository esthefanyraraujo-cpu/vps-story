import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed...')

  // Criar admin
  const senhaHash = await bcrypt.hash('Admin@123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vpsstore.com.br' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@vpsstore.com.br',
      senha: senhaHash,
      role: 'ADMIN',
    },
  })
  console.log('Admin criado:', admin.email)

  // Criar planos
  const planos = [
    {
      nome: 'VPS Starter',
      descricao: 'Ideal para projetos pequenos e aprendizado',
      ram: 2,
      cpu: 2,
      ssd: 40,
      banda: 20,
      precoMensal: 29.90,
      hetznerTipo: 'cx23',
      ativo: true,
    },
    {
      nome: 'VPS Pro',
      descricao: 'Para aplicações em produção e pequenas empresas',
      ram: 4,
      cpu: 2,
      ssd: 80,
      banda: 20,
      precoMensal: 59.90,
      hetznerTipo: 'cx33',
      ativo: true,
    },
    {
      nome: 'VPS Gamer',
      descricao: 'Servidores de jogos e aplicações de alto desempenho',
      ram: 8,
      cpu: 4,
      ssd: 160,
      banda: 20,
      precoMensal: 99.90,
      hetznerTipo: 'cx43',
      ativo: true,
    },
  ]

  for (const plano of planos) {
    const criado = await prisma.plano.create({ data: plano })
    console.log('Plano criado:', criado.nome)
  }

  console.log('Seed concluido!')
  console.log('Admin: admin@vpsstore.com.br / Admin@123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
