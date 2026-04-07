import { PrismaClient } from '@prisma/client'
import { provisionarVPS } from '../lib/vps-provisioner'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  const emailAdmin = 'admin@vpsstore.com.br' // Seu email de admin
  
  console.log('--- Testando Criacao de Windows Starter (80GB) ---')
  
  // 1. Buscar o usuario admin
  const user = await prisma.user.findUnique({
    where: { email: emailAdmin }
  })

  if (!user) {
    console.error('Erro: Usuario admin nao encontrado. Rode o seed primeiro.')
    return
  }

  // 2. Buscar o plano Windows Starter
  const plano = await prisma.plano.findFirst({
    where: { nome: 'Windows Starter' }
  })
  if (!plano) {
    console.error('Erro: Plano Windows Starter nao encontrado no banco.')
    return
  }

  console.log(`Usando plano: ${plano.nome}`)

  // 3. Criar um registro de "Pagamento Ficticio" para disparar o provisionamento
  const pagamento = await prisma.pagamento.create({
    data: {
      userId: user.id,
      planoId: plano.id,
      valor: plano.precoMensal,
      gateway: 'MP',
      status: 'PENDENTE',
      transacaoId: `test_starter_${Date.now()}`
    }
  })

  console.log('Pagamento ficticio criado. Iniciando criacao na Hetzner...')

  try {
    // 4. Chamar a funcao que cria a VPS na Hetzner de verdade
    await provisionarVPS(pagamento.id)
    console.log('--- SUCESSO! ---')
    console.log('A VPS foi criada na Hetzner e vinculada a sua conta.')
  } catch (error: any) {
    console.error('Erro ao criar na Hetzner:', error)
    if (error.message) console.error('Detalhes do Erro:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
