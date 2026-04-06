import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido')
    return
  }

  console.log('Buscando servidores na Hetzner para identificar a nova VPS de 80GB...')
  const res = await fetch('https://api.hetzner.cloud/v1/servers', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    console.error('Erro ao buscar servidores:', await res.text())
    return
  }

  const data = await res.json()
  const servers = data.servers

  console.log('\n--- Servidores Ativos ---')
  for (const s of servers) {
    console.log(`ID: ${s.id} | Nome: ${s.name} | IP: ${s.public_net.ipv4?.ip} | Plano: ${s.server_type.name} (${s.server_type.disk} GB SSD) | Status: ${s.status}`)
  }
}

main()
