import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido')
    return
  }

  const snapshotId = '373919623' // Master-Windows-80GB
  const serverType = 'cx33' // 80GB SSD

  console.log(`\nTestando criação de servidor ${serverType} (80GB) com a imagem ${snapshotId} (80GB)...`)
  const testRes = await fetch('https://api.hetzner.cloud/v1/servers', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'teste-debug-80gb-real',
      server_type: serverType,
      image: snapshotId,
      location: 'nbg1',
      user_data: `#ps1_sysnative\nnet user Administrator "MinhaSenha123@"` ,
      start_after_create: true
    })
  })

  if (!testRes.ok) {
    const err = await testRes.json()
    console.error('ERRO DA HETZNER:')
    console.error(JSON.stringify(err, null, 2))
  } else {
    const data = await testRes.json()
    console.log('Sucesso no teste de criação (servidor criado ID:', data.server.id, ')')
    // Deletar o servidor de teste imediatamente
    await fetch(`https://api.hetzner.cloud/v1/servers/${data.server.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log('Servidor de teste deletado.')
  }
}

main()
