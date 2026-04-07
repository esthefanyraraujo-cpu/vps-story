const HETZNER_BASE = 'https://api.hetzner.cloud/v1'
const DEFAULT_LOCATION = 'nbg1'
const DEFAULT_IMAGE = 'ubuntu-22.04'

function getHeaders() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) throw new Error('HETZNER_API_TOKEN nao definido')
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export interface HetznerServer {
  id: number
  name: string
  status: string
  public_net: {
    ipv4: { ip: string } | null
  }
  root_password?: string
}

export async function criarServidor(
  nome: string,
  tipo: string,
  imagem: string = DEFAULT_IMAGE,
  userData?: string
): Promise<{ server: HetznerServer; rootPassword: string }> {
  const body: any = {
    name: nome,
    server_type: tipo,
    image: imagem,
    location: DEFAULT_LOCATION,
    start_after_create: true,
  }
  if (userData) {
    body.user_data = userData
  }
  console.log(`[HETZNER] Request Body:`, JSON.stringify(body))
  const res = await fetch(`${HETZNER_BASE}/servers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json()
    const errorMsg = err?.error?.message || JSON.stringify(err)
    console.error(`[HETZNER_API_ERROR] Status: ${res.status} | Erro: ${errorMsg}`)
    throw new Error(`Hetzner: ${errorMsg}`)
  }

  const data = await res.json()
  // root_password SOMENTE disponivel na criacao - capturar imediatamente
  return {
    server: data.server,
    rootPassword: data.root_password,
  }
}

export async function ligarServidor(id: number): Promise<void> {
  await fetch(`${HETZNER_BASE}/servers/${id}/actions/poweron`, {
    method: 'POST',
    headers: getHeaders(),
  })
}

export async function desligarServidor(id: number): Promise<void> {
  await fetch(`${HETZNER_BASE}/servers/${id}/actions/poweroff`, {
    method: 'POST',
    headers: getHeaders(),
  })
}

export async function reiniciarServidor(id: number): Promise<void> {
  await fetch(`${HETZNER_BASE}/servers/${id}/actions/reboot`, {
    method: 'POST',
    headers: getHeaders(),
  })
}

export async function deletarServidor(id: number): Promise<void> {
  await fetch(`${HETZNER_BASE}/servers/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
}

export async function obterServidor(id: number): Promise<HetznerServer> {
  const res = await fetch(`${HETZNER_BASE}/servers/${id}`, {
    headers: getHeaders(),
  })
  const data = await res.json()
  return data.server
}
