import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido')
    return
  }

  const serverId = '125963919' // Master-Windows-80GB

  console.log(`Buscando detalhes do servidor ${serverId}...`)
  const res = await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    console.error('Erro ao buscar servidor:', await res.text())
    return
  }

  const data = await res.json()
  const server = data.server

  console.log(`\n--- Detalhes do Servidor ${server.name} ---`)
  console.log(`ISO Atrelada: ${server.iso ? server.iso.description : 'Nenhuma'}`)
  console.log(`Status: ${server.status}`)
  
  console.log('\nBuscando ISOs de Windows disponíveis...')
  const isoRes = await fetch('https://api.hetzner.cloud/v1/isos', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const isoData = await isoRes.json()
  const isos = isoData.isos

  for (const iso of isos) {
    if (iso.description.toLowerCase().includes('windows')) {
      console.log(`ID: ${iso.id} | Descrição: ${iso.description} | Nome: ${iso.name}`)
    }
  }
}

main()
