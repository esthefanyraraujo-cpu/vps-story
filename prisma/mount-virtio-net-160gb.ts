import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido')
    return
  }

  const serverId = '125969936' // Master-Windows-160GB-Clean
  const virtioIsoId = '116716' // VirtIO Windows Drivers 0.1.266

  console.log(`Montando a ISO de Drivers VirtIO no servidor de 160GB (${serverId}) para instalar a rede...`)
  
  // Primeiro desmuntar a atual
  await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}/actions/detach_iso`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  })

  // Montar a de drivers
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
  console.log('1. No Windows, clique em "Browse my computer for drivers".')
  console.log('2. Selecione a unidade de CD (VirtIO-Win).')
  console.log('3. Clique em Next e ele vai instalar o Red Hat VirtIO Ethernet Adapter.')
}

main()
