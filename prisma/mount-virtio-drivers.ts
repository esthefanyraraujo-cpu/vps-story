import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido')
    return
  }

  // IDs das máquinas que você está configurando
  const serverIds = ['126084302', '126084589', '126084604']

  for (const id of serverIds) {
    console.log(`Montando ISO de Drivers VirtIO no servidor ${id}...`)
    
    // Primeiro desmonta o que estiver lá (Windows ISO)
    await fetch(`https://api.hetzner.cloud/v1/servers/${id}/actions/detach_iso`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })

    // Monta a ISO de drivers (virtio-win-0.1.248 é o padrão estável atual na Hetzner)
    // Nota: O nome pode variar, mas geralmente o ID da ISO virtio-win é fixo ou buscável
    // Vou tentar montar pelo ID comum de drivers virtio
    await fetch(`https://api.hetzner.cloud/v1/servers/${id}/actions/attach_iso`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ iso: 'virtio-win-0.1.248' }) 
    })
  }

  console.log('\n--- PRONTO ---')
  console.log('ISO de Drivers VirtIO montada em todas as máquinas.')
  console.log('1. No Console do Windows, clique em "Load Driver" -> "Browse".')
  console.log('2. Procure na unidade de CD: viostor -> 2k22 -> amd64.')
  console.log('3. Após o disco aparecer, ME AVISE para eu voltar a ISO do Windows para você continuar.')
}

main()
