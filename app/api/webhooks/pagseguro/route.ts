import { provisionarVPS } from '@/lib/vps-provisioner'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const status = body?.charges?.[0]?.status || body?.status
    const referenceId = body?.reference_id || body?.charges?.[0]?.reference_id

    if (status === 'PAID' && referenceId) {
      await provisionarVPS(referenceId)
    }

    return NextResponse.json({ message: 'OK' })
  } catch (error) {
    console.error('[WEBHOOK_PAGSEGURO]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
