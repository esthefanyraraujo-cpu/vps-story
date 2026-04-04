import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando limpeza de pagamentos de teste para zerar a receita...')

  // 1. Listar pagamentos atuais para confirmação no log
  const pagamentos = await prisma.pagamento.findMany()
  console.log(`Encontrados ${pagamentos.length} registros de pagamento.`)

  // 2. Excluir TODOS os registros de pagamento
  // Como o usuário quer zerar a receita do mês e não há VPS reais, vamos limpar tudo.
  const deletePagamentos = await prisma.pagamento.deleteMany({})
  
  console.log(`${deletePagamentos.count} registros de pagamento excluídos com sucesso.`)
  console.log('Receita do mês zerada no painel administrativo.')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
