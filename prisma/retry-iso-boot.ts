import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido')
    return
  }

  const serverId = '125963919' // Master-Windows-80GB

  console.log(`Verificando status atual do servidor ${serverId}...`)
  const res = await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const data = await res.json()
  const server = data.server

  console.log(`Status: ${server.status}`)
  console.log(`ISO Atrelada: ${server.iso ? server.iso.description : 'Nenhuma'}`)

  if (!server.iso) {
    console.log('ISO não está atrelada! Tentando atrelar novamente...')
    // Atrelando novamente por segurança
    await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}/actions/attach_iso`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ iso: '8637' }) // Windows Server 2022 English
    })
  }

  console.log('Desligando servidor (Power Off)...')
  await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}/actions/poweroff`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  })

  // Esperar um pouco para garantir que desligou
  console.log('Aguardando 5 segundos...')
  await new Promise(resolve => setTimeout(resolve, 5000))

  console.log('Ligando servidor (Power On)...')
  await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}/actions/poweron`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  })

  console.log('Comando enviado! Fique pronto no console para apertar qualquer tecla.')
}

main()
