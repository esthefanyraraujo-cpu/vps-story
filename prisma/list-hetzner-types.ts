import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN nao definido no .env')
    return
  }

  console.log('Buscando tipos de servidores disponiveis na Hetzner...')
  const res = await fetch('https://api.hetzner.cloud/v1/server_types', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  const data = await res.json()
  if (data.error) {
    console.error('Erro na API:', data.error)
    return
  }

  console.log('Tipos disponiveis:')
  data.server_types.forEach((t: any) => {
    if (!t.deprecation) {
      console.log(`- ${t.name} (ID: ${t.id})`)
    }
  })
}

main()
