import 'dotenv/config'

async function main() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    console.error('HETZNER_API_TOKEN não definido')
    return
  }

  const serverId = '125965315' // Master-Windows-80GB-Clean
  const virtioIsoId = '116716' // VirtIO Windows Drivers 0.1.266

  console.log(`Remontando a ISO de Drivers VirtIO no servidor ${serverId} para instalar a internet...`)
  
  // Primeiro desmuntar a atual
  await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}/actions/detach_iso`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  })

  // Montar a de drivers novamente
  const res = await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}/actions/attach_iso`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ iso: virtioIsoId })
  })

  if (!res.ok) {
    console.error('Erro ao atrelar ISO de drivers:', await res.text())
    return
  }

  console.log('ISO de Drivers VirtIO remontada com sucesso!')
  console.log('\n--- COMO INSTALAR A INTERNET NO WINDOWS ---')
  console.log('1. Dentro do Windows, clique com o botão direito no menu Iniciar e vá em "Device Manager" (Gerenciador de Dispositivos).')
  console.log('2. Procure por "Ethernet Controller" (estará com um ícone amarelo de exclamação).')
  console.log('3. Clique com o botão direito nele e selecione "Update driver".')
  console.log('4. Escolha "Browse my computer for drivers".')
  console.log('5. Clique em "Browse" e selecione a unidade de CD (VirtIO-Win).')
  console.log('6. Certifique-se de que "Include subfolders" está marcado e clique em Next.')
  console.log('7. O Windows vai instalar o driver "Red Hat VirtIO Ethernet Adapter" e a internet vai funcionar na hora!')
}

main()
