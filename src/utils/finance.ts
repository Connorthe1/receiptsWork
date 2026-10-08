import type { Currency, FinanceOperation } from '@/types'

export const currencySymbols: Record<Currency, string> = { RUB: '₽', USD: '$' }

/** `usdRate` is rubles per dollar, the way the rate is usually quoted. */
export function convert(amount: number, from: Currency, to: Currency, usdRate: number): number {
  if (from === to) return amount

  return from === 'USD' ? amount * usdRate : amount / usdRate
}

/** Accepts what people type: spaces between thousands and a comma as the decimal point. */
export function parseAmount(raw: string): number | null {
  const normalized = raw.replace(/\s/g, '').replace(',', '.')
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null

  const value = Number(normalized)
  return value > 0 ? value : null
}

/** Whole sums stay whole; kopecks and cents only show up when they are there. */
export function formatMoney(amount: number, currency: Currency, signed = false): string {
  const hasFraction = Math.round(Math.abs(amount) * 100) % 100 !== 0

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
    signDisplay: signed ? 'exceptZero' : 'auto',
  }).format(amount)
}

export function formatPercent(ratio: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'percent',
    maximumFractionDigits: 1,
    signDisplay: 'exceptZero',
  }).format(ratio)
}

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${date.getFullYear()}-${month}-${day}`
}

/** Today in the local time zone: `toISOString` would give the UTC day instead. */
export function todayIso(): string {
  return toIsoDate(new Date())
}

export function formatIsoDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}.${month}.${year}`
}

/** Tag filter values besides a tag id; ids are UUIDs, so these never collide with one. */
export const ALL_TAGS = 'all'
export const UNTAGGED = 'none'

export type FinancePeriod = 'all' | 'month' | 'prevMonth' | 'year' | 'custom'

/** Inclusive bounds as `YYYY-MM-DD`; an empty bound leaves that side open. */
export interface DateRange {
  from: string
  to: string
}

export const financePeriods: { value: FinancePeriod; label: string }[] = [
  { value: 'all', label: 'Всё время' },
  { value: 'month', label: 'Этот месяц' },
  { value: 'prevMonth', label: 'Прошлый месяц' },
  { value: 'year', label: 'Этот год' },
  { value: 'custom', label: 'Свой период' },
]

export function periodRange(period: FinancePeriod, custom: DateRange): DateRange {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  switch (period) {
    case 'month':
      return {
        from: toIsoDate(new Date(year, month, 1)),
        to: toIsoDate(new Date(year, month + 1, 0)),
      }
    case 'prevMonth':
      return {
        from: toIsoDate(new Date(year, month - 1, 1)),
        to: toIsoDate(new Date(year, month, 0)),
      }
    case 'year':
      return { from: `${year}-01-01`, to: `${year}-12-31` }
    case 'custom':
      return custom
    default:
      return { from: '', to: '' }
  }
}

/** ISO dates compare correctly as plain strings. */
export function inRange(date: string, range: DateRange): boolean {
  return (!range.from || date >= range.from) && (!range.to || date <= range.to)
}

export interface FinanceSummary {
  invested: number
  withdrawn: number
  profit: number
  /** Profit relative to what went in; `null` while nothing has been invested. */
  roi: number | null
  depositCount: number
  withdrawalCount: number
}

/** `toDisplay` turns an operation into the display currency, so every sum adds like with like. */
export function summarize(
  operations: FinanceOperation[],
  toDisplay: (operation: FinanceOperation) => number,
): FinanceSummary {
  let invested = 0
  let withdrawn = 0
  let depositCount = 0
  let withdrawalCount = 0

  for (const operation of operations) {
    const amount = toDisplay(operation)

    if (operation.kind === 'deposit') {
      invested += amount
      depositCount++
    } else {
      withdrawn += amount
      withdrawalCount++
    }
  }

  const profit = withdrawn - invested

  return {
    invested,
    withdrawn,
    profit,
    roi: invested > 0 ? profit / invested : null,
    depositCount,
    withdrawalCount,
  }
}
