import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido')
    return
  }

  console.log('Buscando TODAS as imagens/snapshots na conta Hetzner...')
  const res = await fetch('https://api.hetzner.cloud/v1/images', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    console.error('Erro ao buscar imagens:', await res.text())
    return
  }

  const data = await res.json()
  const images = data.images

  console.log('\n--- Imagens/Snapshots Disponíveis ---')
  for (const img of images) {
    console.log(`ID: ${img.id}`)
    console.log(`Descrição: ${img.description}`)
    console.log(`Tamanho Mínimo de Disco (SSD): ${img.disk_size} GB`)
    console.log(`Status: ${img.status}`)
    console.log(`Tipo: ${img.type}`)
    console.log(`Sabor OS: ${img.os_flavor}`)
    console.log('-----------------------------------')
  }

  // Tentar simular a criação de uma VPS de 80GB com a imagem 373331653
  console.log('\nTestando criação de servidor CX33 (80GB) com a imagem 373331653...')
  const testRes = await fetch('https://api.hetzner.cloud/v1/servers', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'teste-debug-80gb',
      server_type: 'cx33', // 80GB SSD
      image: '373331653',
      start_after_create: false
    })
  })

  if (!testRes.ok) {
    const err = await testRes.json()
    console.error('ERRO DA HETZNER AO TENTAR CRIAR 80GB:')
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
