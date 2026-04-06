import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido')
    return
  }

  console.log('Buscando servidores ativos na Hetzner para deletar...')
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

  if (servers.length === 0) {
    console.log('Nenhum servidor encontrado para deletar.')
    return
  }

  console.log(`Encontrados ${servers.length} servidores. Iniciando deleção...`)

  for (const s of servers) {
    console.log(`Deletando servidor: ${s.name} (ID: ${s.id})...`)
    const delRes = await fetch(`https://api.hetzner.cloud/v1/servers/${s.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (delRes.ok) {
      console.log(`Servidor ${s.name} deletado com sucesso!`)
    } else {
      console.error(`Erro ao deletar servidor ${s.name}:`, await delRes.text())
    }
  }

  console.log('\n--- LIMPEZA CONCLUÍDA ---')
}

main()
