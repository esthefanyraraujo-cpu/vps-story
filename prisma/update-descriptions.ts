import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const updates = [
    { nome: 'Linux Starter', descricao: 'Ideal para sites leves, bots de Discord e aprendizado.' },
    { nome: 'Linux Pro', descricao: 'Para aplicacoes em producao, empresas e bancos de dados pequenos.' },
    { nome: 'Linux Gamer', descricao: 'Servidores de jogos e alta performance para multitarefas pesadas.' },
    { nome: 'Windows Starter', descricao: 'Desktop remoto basico para navegacao, estudos e bots leves.' },
    { nome: 'Windows Pro', descricao: 'Multitarefa fluida para trabalho remoto e hospedar sistemas intermediarios.' },
    { nome: 'Windows Ultra (FiveM)', descricao: 'Alta performance focada em Servidores de FiveM e games pesados.' }
  ]

  console.log('Atualizando descricoes dos planos no banco de dados...')

  for (const u of updates) {
    await prisma.plano.updateMany({
      where: { nome: u.nome },
      data: { descricao: u.descricao }
    })
  }

  console.log('Descricoes atualizadas com sucesso!')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
