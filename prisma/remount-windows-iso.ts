import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido')
    return
  }

  const serverId = '125965315' // Master-Windows-80GB-Clean
  const windowsIsoId = '8637' // Windows Server 2022 English

  console.log(`Remontando a ISO do Windows Server 2022 no servidor ${serverId}...`)
  
  // Primeiro desmuntar a de drivers
  await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}/actions/detach_iso`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  })

  // Montar a do Windows novamente
  const res = await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}/actions/attach_iso`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ iso: windowsIsoId })
  })

  if (!res.ok) {
    console.error('Erro ao atrelar ISO do Windows:', await res.text())
    return
  }

  console.log('ISO do Windows Server 2022 remontada com sucesso!')
  console.log('Agora você pode clicar em "Next" no console para iniciar a instalação.')
}

main()
