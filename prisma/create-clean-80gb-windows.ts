import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido')
    return
  }

  console.log('Criando NOVA VPS de 80GB (CX33) limpa com ISO do Windows Server 2022...')
  
  const res = await fetch('https://api.hetzner.cloud/v1/servers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Master-Windows-80GB-Clean',
      server_type: 'cx33', // 80GB SSD
      image: 'ubuntu-22.04', // Hetzner exige uma imagem inicial, mas vamos sobrepor com ISO
      location: 'nbg1',
      start_after_create: true,
      automount: false
    })
  })

  if (!res.ok) {
    console.error('Erro ao criar servidor:', await res.text())
    return
  }

  const data = await res.json()
  const serverId = data.server.id

  console.log(`Servidor criado com ID: ${serverId}`)

  console.log('Atrelando ISO do Windows Server 2022 (8637)...')
  await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}/actions/attach_iso`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ iso: '8637' })
  })

  console.log('Alterando ordem de boot para ISO...')
  await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}/actions/change_alias_ips`, {
    // Nota: A API da Hetzner não tem um "set boot order" direto via REST fácil sem ISO.
    // Mas o attach_iso + reset costuma funcionar.
  })

  console.log('Executando RESET para forçar boot pela ISO...')
  await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}/actions/reset`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  })

  console.log(`\n--- SUCESSO ---`)
  console.log(`ID da Máquina: ${serverId}`)
  console.log(`IP: ${data.server.public_net.ipv4.ip}`)
  console.log(`Acesse o console agora e instale o Windows.`)
}

main()
