import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido')
    return
  }

  const serverId = 125861562 // vps-liiso6-1775340614929
  const vpsId = 'cmnkvyr2z0004ezock97sicqp'

  console.log(`DELETANDO SERVIDOR ${serverId} NA HETZNER...`)
  const res = await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (res.ok) {
    console.log('SERVIDOR DELETADO COM SUCESSO NA HETZNER.')
  } else {
    console.log('ERRO AO DELETAR NA HETZNER OU JÁ FOI DELETADO:', await res.text())
  }

  console.log(`LIMPANDO REGISTROS NO BANCO DE DADOS...`)
  
  // 1. Desvincular pagamentos
  await prisma.pagamento.updateMany({
    where: { vpsId: vpsId },
    data: { vpsId: null }
  })

  // 2. Excluir VPS
  await prisma.vPS.deleteMany({
    where: { id: vpsId }
  })

  // 3. Excluir TODOS os pagamentos para garantir receita zero
  const delPag = await prisma.pagamento.deleteMany({})
  console.log(`${delPag.count} pagamentos removidos.`)

  console.log('BANCO DE DADOS LIMPADO COM SUCESSO.')
}

main().finally(() => prisma.$disconnect())
