import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido no .env')
    return
  }

  console.log('Buscando Snapshots e Imagens na Hetzner...')
  const res = await fetch('https://api.hetzner.cloud/v1/images?type=snapshot', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    console.error('Erro ao buscar imagens na Hetzner:', await res.text())
    return
  }

  const data = await res.json()
  const images = data.images

  console.log(`Encontrados ${images.length} Snapshots/Imagens na Hetzner.`)

  for (const img of images) {
    console.log(`ID: ${img.id}`)
    console.log(`Descrição: ${img.description}`)
    console.log(`Tamanho Mínimo: ${img.disk_size} GB`)
    console.log(`Status: ${img.status}`)
    console.log(`Criado em: ${img.created}`)
    console.log(`Location: ${img.bound_to || 'Global'}`)
    console.log('-----------------------------------')
  }
}

main()
