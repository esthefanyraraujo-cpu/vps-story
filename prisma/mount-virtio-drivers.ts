import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido')
    return
  }

  const serverId = '125965315' // Master-Windows-80GB-Clean
  const virtioIsoId = '116716' // VirtIO Windows Drivers 0.1.266

  console.log(`Trocando a ISO do servidor ${serverId} para os Drivers VirtIO...`)
  
  // Primeiro desmuntar a atual (por segurança)
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
  console.log('\n--- PRÓXIMOS PASSOS NO CONSOLE ---')
  console.log('1. No Windows, clique em "Load driver".')
  console.log('2. Clique em "Browse".')
  console.log('3. Vá na unidade de CD (VirtIO-Win) > amd64 > 2k22 (ou w10/w11 se não tiver 2k22).')
  console.log('4. O Windows vai encontrar o driver "Red Hat VirtIO SCSI controller".')
  console.log('5. Clique em Next e o disco de 80GB aparecerá!')
}

main()
