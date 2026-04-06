import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido')
    return
  }

  const serverId = '125963919' // Master-Windows-80GB
  const isoId = '8637' // Windows Server 2022 English

  console.log(`Atrelando ISO ${isoId} ao servidor ${serverId}...`)
  const res = await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}/actions/attach_iso`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      iso: isoId
    })
  })

  if (!res.ok) {
    const err = await res.json()
    console.error('Erro ao atrelar ISO:', JSON.stringify(err, null, 2))
    return
  }

  console.log('ISO atrelada com sucesso!')

  console.log('Reiniciando servidor para bootar pela ISO...')
  const rebootRes = await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}/actions/reboot`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!rebootRes.ok) {
    console.error('Erro ao reiniciar servidor:', await rebootRes.text())
    return
  }

  console.log('Servidor reiniciado com sucesso!')
}

main()
