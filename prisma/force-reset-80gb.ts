import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido')
    return
  }

  const serverId = '126084302' // Mestre-Windows-Novo-Nuremberg (80GB)

  console.log(`Desligando servidor ${serverId} (Power Off)...`)
  await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}/actions/poweroff`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  })

  console.log('Aguardando 5 segundos...')
  await new Promise(resolve => setTimeout(resolve, 5000))

  console.log('Ligando servidor (Power On)...')
  await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}/actions/poweron`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  })

  console.log('\n--- ATENÇÃO ---')
  console.log('O servidor foi reiniciado. ABRA O CONSOLE AGORA e fique apertando qualquer tecla')
  console.log('repetidamente até aparecer "Press any key to boot from CD or DVD...".')
}

main()
