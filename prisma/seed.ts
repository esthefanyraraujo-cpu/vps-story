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

  // Criar planos Linux e Windows
  const planos: any[] = [
    // Planos Linux
    {
      nome: 'Linux Starter',
      descricao: 'Ideal para sites leves, bots de Discord e aprendizado.',
      ram: 2,
      cpu: 2,
      ssd: 40,
      banda: 20,
      precoMensal: 29.90,
      hetznerTipo: 'cx23',
      ativo: true,
    },
    {
      nome: 'Linux Pro',
      descricao: 'Para aplicacoes em producao, empresas e bancos de dados pequenos.',
      ram: 4,
      cpu: 2,
      ssd: 80,
      banda: 20,
      precoMensal: 59.90,
      hetznerTipo: 'cpx22',
      ativo: true,
    },
    {
      nome: 'Linux Gamer',
      descricao: 'Servidores de jogos e alta performance para multitarefas pesadas.',
      ram: 8,
      cpu: 4,
      ssd: 160,
      banda: 20,
      precoMensal: 99.90,
      hetznerTipo: 'cpx32',
      ativo: true,
    },
    // Planos Windows
    {
      nome: 'Windows Starter',
      descricao: 'Desktop remoto basico para navegacao, estudos e bots leves.',
      ram: 4,
      cpu: 2,
      ssd: 80,
      banda: 20,
      precoMensal: 64.90,
      hetznerTipo: 'cpx22',
      ativo: true,
    },
    {
      nome: 'Windows Pro',
      descricao: 'Multitarefa fluida para trabalho remoto e hospedar sistemas intermediarios.',
      ram: 8,
      cpu: 4,
      ssd: 160,
      banda: 20,
      precoMensal: 94.90,
      hetznerTipo: 'cpx32',
      ativo: true,
    },
    {
      nome: 'Windows Ultra (FiveM)',
      descricao: 'Alta performance focada em Servidores de FiveM e games pesados.',
      ram: 16,
      cpu: 8,
      ssd: 320,
      banda: 20,
      precoMensal: 179.90,
      hetznerTipo: 'cpx42',
      ativo: true,
    },
    {
      nome: 'VPS Teste Admin',
      descricao: 'Plano exclusivo para testes do administrador',
      ram: 4,
      cpu: 2,
      ssd: 80,
      banda: 20,
      precoMensal: 1.00,
      hetznerTipo: 'cpx22',
      ativo: false, // Desativado por padrao para nao aparecer para clientes
    },
  ]

  for (const plano of planos) {
    await (prisma.plano as any).upsert({
      where: { nome: plano.nome },
      update: plano,
      create: plano,
    })
    console.log('Plano processado:', plano.nome)
  }

  console.log('Seed concluido!')
  console.log('Admin: admin@vpsstore.com.br / Admin@123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
