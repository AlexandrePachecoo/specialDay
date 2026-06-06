import { NextResponse } from 'next/server'
import { getLetterBySlug, markAsPaid } from '@/services/letters'
import { getPixCharge, isAbacatePayConfigured } from '@/services/abacatePay'
import { getClientIp, rateLimit, tickGC } from '@/lib/ratelimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Reconciliação ativa de pagamento. O front faz polling aqui enquanto a carta
// está em awaiting_payment. Em vez de depender só do webhook do AbacatePay
// (que pode não chegar em dev/local ou com painel mal configurado), perguntamos
// direto ao gateway se o PIX já caiu e marcamos como paga. O webhook segue como
// caminho rápido.
export async function GET(req, { params }) {
  tickGC()
  const { slug } = await params
  const ip = getClientIp(req)

  // Polling de 5s = 12/min. 30/min dá folga e ainda evita abuso.
  const rl = rateLimit({ ip, scope: `status:${slug}`, max: 30, windowMs: 60_000 })
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Muitas verificações. Espere um instante.' },
      { status: 429 }
    )
  }

  const row = await getLetterBySlug(slug).catch(() => null)
  if (!row) {
    return NextResponse.json({ error: 'Carta não encontrada.' }, { status: 404 })
  }

  // Estados finais: devolve direto sem consultar o gateway.
  if (row.payment_status !== 'awaiting_payment') {
    return NextResponse.json({ status: row.payment_status })
  }

  // Cobrança vencida pela data — a expiração de fato continua via expireOldLetters.
  const expired =
    row.payment_expires_at &&
    new Date(row.payment_expires_at).getTime() <= Date.now()
  if (expired) {
    return NextResponse.json({ status: 'awaiting_payment', expired: true })
  }

  // Consulta ativa ao AbacatePay. Falha no gateway nunca derruba a resposta:
  // devolvemos o status atual do banco.
  if (isAbacatePayConfigured() && row.payment_id) {
    try {
      const res = await getPixCharge(row.payment_id)
      if (res.ok && /paid|approved|completed/i.test(res.status || '')) {
        await markAsPaid({ paymentId: row.payment_id })
        return NextResponse.json({ status: 'paid' })
      }
    } catch {
      // ignora — devolve awaiting_payment abaixo
    }
  }

  return NextResponse.json({ status: 'awaiting_payment' })
}
