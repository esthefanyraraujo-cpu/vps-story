import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido')
    return
  }

  const servers = [
    { id: '126084589', name: '160GB' },
    { id: '126084604', name: '320GB' }
  ]

  for (const s of servers) {
    console.log(`Desligando servidor ${s.name} (${s.id}) (Power Off)...`)
    await fetch(`https://api.hetzner.cloud/v1/servers/${s.id}/actions/poweroff`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
  }

  console.log('Aguardando 5 segundos...')
  await new Promise(resolve => setTimeout(resolve, 5000))

  for (const s of servers) {
    console.log(`Ligando servidor ${s.name} (${s.id}) (Power On)...`)
    await fetch(`https://api.hetzner.cloud/v1/servers/${s.id}/actions/poweron`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
  }

  console.log('\n--- ATENÇÃO ---')
  console.log('Os servidores de 160GB e 320GB foram reiniciados.')
  console.log('ABRA OS CONSOLES e fique apertando qualquer tecla para bootar pela ISO.')
}

main()
