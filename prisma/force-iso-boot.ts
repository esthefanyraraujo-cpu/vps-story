import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido')
    return
  }

  const serverId = '125963919' // Master-Windows-80GB

  console.log(`Executando HARD RESET no servidor ${serverId} para forçar o boot pela ISO...`)
  const res = await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}/actions/reset`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    console.error('Erro ao executar reset:', await res.text())
    return
  }

  console.log('Hard Reset disparado com sucesso! Verifique o console agora.')
}

main()
