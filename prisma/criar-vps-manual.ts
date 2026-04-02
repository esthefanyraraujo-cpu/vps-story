import { PrismaClient } from '@prisma/client'
import { provisionarVPS } from '../lib/vps-provisioner'

const prisma = new PrismaClient()

async function main() {
  const emailAdmin = 'admin@vpsstore.com.br' // Seu email de admin
  
  console.log('--- Criando VPS Manual (Sem Pagamento) ---')
  
  // 1. Buscar o usuario admin
  const user = await prisma.user.findUnique({
    where: { email: emailAdmin }
  })

  if (!user) {
    console.error('Erro: Usuario admin nao encontrado. Rode o seed primeiro.')
    return
  }

  // 2. Buscar o plano VPS Gamer
  const plano = await prisma.plano.findFirst({
    where: { nome: 'VPS Gamer' }
  })
  if (!plano) {
    console.error('Erro: Plano VPS Gamer nao encontrado no banco.')
    return
  }

  console.log(`Usando plano: ${plano.nome}`)

  // 3. Criar um registro de "Pagamento Ficticio" para disparar o provisionamento
  const pagamento = await prisma.pagamento.create({
    data: {
      userId: user.id,
      planoId: plano.id,
      valor: plano.precoMensal,
      gateway: 'MP', // Valor obrigatorio adicionado
      status: 'PENDENTE',
      transacaoId: `manual_${Date.now()}` // Usando transacaoId em vez de externalId
    }
  })

  console.log('Pagamento ficticio criado. Iniciando criacao na Hetzner...')

  try {
    // 4. Chamar a funcao que cria a VPS na Hetzner de verdade
    await provisionarVPS(pagamento.id)
    console.log('--- SUCESSO! ---')
    console.log('A VPS foi criada na Hetzner e vinculada a sua conta.')
    console.log('Verifique o seu e-mail ou o Dashboard do site.')
  } catch (error) {
    console.error('Erro ao criar na Hetzner:', error)
    console.log('\nAVISO: Verifique se o seu HETZNER_API_TOKEN no .env esta correto!')
  } finally {
    await prisma.$disconnect()
  }
}

main()
