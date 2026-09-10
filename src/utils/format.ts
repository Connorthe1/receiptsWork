import type { Address, PaymentCard } from '@/types'

const MAX_MASK_LENGTH = 14

export function maskSecret(value: string): string {
  return '•'.repeat(Math.min(value.length || 8, MAX_MASK_LENGTH))
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

export function formatCardNumber(value: string): string {
  const digits = digitsOnly(value)
  return digits.replace(/(.{4})/g, '$1 ').trim() || value
}

export function maskCardNumber(value: string): string {
  const digits = digitsOnly(value)

  if (digits.length < 4) {
    return '•••• •••• •••• ••••'
  }

  return `•••• •••• •••• ${digits.slice(-4)}`
}

export function formatExpiry(card: Pick<PaymentCard, 'expiryMonth' | 'expiryYear'>): string {
  if (!card.expiryMonth && !card.expiryYear) return '—'

  const month = card.expiryMonth.padStart(2, '0')
  const year = card.expiryYear.length === 4 ? card.expiryYear.slice(-2) : card.expiryYear

  return `${month}/${year}`
}

/** Plain-text address in the layout most forms expect. */
export function formatAddress(address: Address): string {
  const name = [address.firstName, address.lastName].filter(Boolean).join(' ')
  const region = [address.city, address.state, address.postalCode].filter(Boolean).join(', ')

  return [name, address.address1, address.address2, region].filter(Boolean).join('\n')
}

export function addressSummary(address: Address): string {
  return [address.address1, address.city, address.state, address.postalCode]
    .filter(Boolean)
    .join(', ')
}

/** Users usually paste bare domains; keep links clickable without rewriting stored data. */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''

  return /^[a-z][\w+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export function hostname(url: string): string {
  try {
    return new URL(normalizeUrl(url)).hostname
  } catch {
    return url
  }
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
