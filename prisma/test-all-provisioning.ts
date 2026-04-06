import 'dotenv/config'

async function testar(tipo: string, snapshot: string) {
  const token = process.env.HETZNER_API_TOKEN
  console.log(`\n--- Testando: ${tipo} com Snapshot ${snapshot} ---`)
  
  const res = await fetch('https://api.hetzner.cloud/v1/servers', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: `teste-debug-${tipo}-${Date.now()}`,
      server_type: tipo,
      image: snapshot,
      location: 'nbg1',
      start_after_create: false
    })
  })

  const data = await res.json()
  if (!res.ok) {
    console.error(`ERRO [${tipo}]:`, JSON.stringify(data, null, 2))
  } else {
    console.log(`SUCESSO [${tipo}]: Servidor criado ID ${data.server.id}`)
    // Deletar imediato
    await fetch(`https://api.hetzner.cloud/v1/servers/${data.server.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log(`Servidor de teste ${tipo} deletado.`)
  }
}

async function main() {
  // Snapshot IDs do provisioner
  const tests = [
    { tipo: 'cx33', snapshot: '373919623' }, // Windows Starter (80GB)
    { tipo: 'cx43', snapshot: '373919887' }, // Windows Pro (160GB)
    { tipo: 'cx53', snapshot: '373866889' }  // Windows Ultra (320GB)
  ]

  for (const t of tests) {
    await testar(t.tipo, t.snapshot)
  }
}

main()
