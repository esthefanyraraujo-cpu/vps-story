import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando limpeza TOTAL do banco de dados para zerar painel...')

  // 1. Desvincular todos os pagamentos de VPS
  await prisma.pagamento.updateMany({
    data: { vpsId: null }
  })

  // 2. Excluir todas as VPS
  const deleteVps = await prisma.vPS.deleteMany({})
  console.log(`${deleteVps.count} VPS excluídas.`)

  // 3. Excluir todos os Pagamentos
  const deletePagamentos = await prisma.pagamento.deleteMany({})
  console.log(`${deletePagamentos.count} Pagamentos excluídos.`)

  // 4. Excluir todos os Tickets e Mensagens
  await prisma.ticketMensagem.deleteMany({})
  const deleteTickets = await prisma.ticket.deleteMany({})
  console.log(`${deleteTickets.count} Tickets excluídos.`)

  // 5. Excluir tokens de reset de senha
  await prisma.passwordResetToken.deleteMany({})

  console.log('Banco de dados limpo! Painel, Receita e Tickets zerados.')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
