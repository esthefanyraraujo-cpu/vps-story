import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido no .env')
    return
  }

  const serverId = 125861562
  console.log(`Buscando detalhes do servidor ${serverId} na Hetzner...`)
  
  const res = await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    const text = await res.text()
    console.log(`STATUS: ${res.status}`)
    console.log(`RESPOSTA: ${text}`)
    return
  }

  const data = await res.json()
  console.log('SERVIDOR ENCONTRADO NA HETZNER:')
  console.log(JSON.stringify(data.server, null, 2))
}

main()
