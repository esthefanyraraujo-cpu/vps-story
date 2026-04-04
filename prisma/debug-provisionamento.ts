import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido')
    return
  }

  console.log('Buscando TODOS os servidores na Hetzner para encontrar o IP 157.180.78.76...')
  const res = await fetch('https://api.hetzner.cloud/v1/servers', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    console.error('Erro ao buscar servidores:', await res.text())
    return
  }

  const data = await res.json()
  const servers = data.servers
  const targetServer = servers.find((s: any) => s.public_net.ipv4?.ip === '157.180.78.76')

  if (targetServer) {
    console.log('SERVIDOR ENCONTRADO:')
    console.log(JSON.stringify(targetServer, null, 2))
  } else {
    console.log('Nenhum servidor com o IP 157.180.78.76 encontrado na conta Hetzner.')
    console.log('Servidores encontrados na conta:', servers.map((s: any) => `${s.name} (${s.public_net.ipv4?.ip})`).join(', '))
  }

  console.log('\nVerificando se o Snapshot 373331653 existe e está disponível...')
  const imgRes = await fetch('https://api.hetzner.cloud/v1/images/373331653', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (imgRes.ok) {
    const imgData = await imgRes.json()
    console.log('SNAPSHOT ENCONTRADO:')
    console.log(JSON.stringify(imgData.image, null, 2))
  } else {
    console.error('ERRO: Snapshot 373331653 não encontrado ou inacessível!')
  }
}

main()
