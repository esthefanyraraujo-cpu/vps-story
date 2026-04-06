import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido')
    return
  }

  const res = await fetch('https://api.hetzner.cloud/v1/images?type=snapshot&sort=created:desc', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    console.error('Erro ao buscar snapshots:', await res.text())
    return
  }

  const data = await res.json()
  const images = data.images

  console.log('\n--- Últimos Snapshots Criados ---')
  for (const img of images) {
    console.log(`ID: ${img.id} | Descrição: ${img.description} | Tamanho Mín: ${img.disk_size} GB | Criado em: ${img.created}`)
  }
}

main()
