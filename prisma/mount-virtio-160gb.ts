import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido')
    return
  }

  const serverId = '125969936' // Master-Windows-160GB-Clean
  const virtioIsoId = '116716' // VirtIO Windows Drivers 0.1.266

  console.log(`Trocando a ISO do servidor ${serverId} (160GB) para os Drivers VirtIO...`)
  
  // Desmontar atual
  await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}/actions/detach_iso`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  })

  // Montar drivers
  const res = await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}/actions/attach_iso`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ iso: virtioIsoId })
  })

  if (!res.ok) {
    console.error('Erro ao atrelar ISO de drivers:', await res.text())
    return
  }

  console.log('ISO de Drivers VirtIO montada com sucesso!')
  console.log('\n--- PRÓXIMOS PASSOS NO CONSOLE (160GB) ---')
  console.log('1. Clique em "Load driver" -> "Browse".')
  console.log('2. Vá na unidade VirtIO-Win > vioscsi > 2k22 > amd64.')
  console.log('3. Selecione o driver e clique em Next.')
  console.log('4. O disco de 160GB aparecerá!')
}

main()
