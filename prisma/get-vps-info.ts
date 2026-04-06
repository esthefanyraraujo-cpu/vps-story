import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido')
    return
  }

  const serverId = '125965315' // Master-Windows-80GB-Clean

  console.log(`Buscando informações detalhadas da VPS ${serverId}...`)
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
  const s = data.server

  console.log('\n--- INFORMAÇÕES DA NOVA VPS ---')
  console.log(`ID: ${s.id}`)
  console.log(`Nome: ${s.name}`)
  console.log(`Status: ${s.status}`)
  console.log(`IP Público (IPv4): ${s.public_net.ipv4?.ip || 'Não atribuído'}`)
  console.log(`Datacenter: ${s.datacenter.name} (${s.datacenter.location.city})`)
  console.log(`Tipo de Servidor: ${s.server_type.name} (${s.server_type.cores} vCPU, ${s.server_type.memory} GB RAM, ${s.server_type.disk} GB SSD)`)
  console.log(`ISO Atualmente Montada: ${s.iso ? s.iso.description : 'Nenhuma'}`)
  console.log('-------------------------------\n')
  
  console.log('Use o IP acima para acessar via RDP após configurar o Windows e a internet.')
}

main()
