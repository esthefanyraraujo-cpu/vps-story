import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando limpeza de planos duplicados...')

  // Pegar todos os planos
  const todosPlanos = await prisma.plano.findMany()
  
  // Agrupar por nome
  const nomesUnicos = Array.from(new Set(todosPlanos.map(p => p.nome)))
  
  for (const nome of nomesUnicos) {
    const duplicados = await prisma.plano.findMany({
      where: { nome },
      orderBy: { id: 'asc' }
    })

    if (duplicados.length > 1) {
      console.log(`Encontrados ${duplicados.length} planos com o nome: ${nome}`)
      
      // Manter o primeiro (mais antigo) e deletar o resto
      const idsParaDeletar = duplicados.slice(1).map(p => p.id)
      
      await prisma.plano.deleteMany({
        where: {
          id: { in: idsParaDeletar }
        }
      })
      
      console.log(`Deletados ${idsParaDeletar.length} duplicatas de ${nome}`)
    }
  }

  console.log('Limpeza concluida!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
