import { prisma } from '../lib/prisma'
import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido no .env')
    return
  }

  console.log('Buscando servidores na Hetzner...')
  const res = await fetch('https://api.hetzner.cloud/v1/servers', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    console.error('Erro ao buscar servidores na Hetzner:', await res.text())
    return
  }

  const data = await res.json()
  const servers = data.servers

  console.log(`Encontrados ${servers.length} servidores na Hetzner.`)

  const vpsNoBanco = await prisma.vPS.findMany()
  const idsNoBanco = new Set(vpsNoBanco.map(v => v.hetznerServerId))

  console.log(`Encontradas ${vpsNoBanco.length} VPS no banco de dados.`)

  for (const server of servers) {
    if (!idsNoBanco.has(server.id)) {
      console.log(`[ORPHAN] Servidor Hetzner ID ${server.id} (${server.name}) não está no banco de dados!`)
      // console.log(`Para deletar: curl -X DELETE -H "Authorization: Bearer ${token}" https://api.hetzner.cloud/v1/servers/${server.id}`)
    } else {
      console.log(`[OK] Servidor Hetzner ID ${server.id} (${server.name}) está vinculado no banco de dados.`)
    }
  }

  if (servers.length === 0) {
    console.log('Nenhum servidor encontrado na Hetzner.')
  }
}

main().finally(() => prisma.$disconnect())
