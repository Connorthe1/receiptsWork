import type { EmailDraft } from '@/types'

export interface EmailImportResult {
  drafts: EmailDraft[]
  /** Emails already present in the list or repeated inside the pasted text. */
  duplicates: string[]
  /** Lines that could not be read as `email:password`. */
  invalid: string[]
}

/** Everything a password may not start with, so the split always lands on the first separator. */
const LINE_PATTERN = /^([^\s:;|,]+)(?:\s*[:;|,\t]\s*|\s+)?(.*)$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/

function isComment(line: string): boolean {
  return line.startsWith('#') || line.startsWith('//')
}

/**
 * Reads a `mail:password` list — one account per line, pasted by hand or loaded from a txt file.
 * `:`, `;`, `|`, `,`, tabs and spaces all work as the separator; the password keeps the rest of
 * the line as is, so its own punctuation survives.
 */
export function parseEmailCredentials(raw: string, existing: string[] = []): EmailImportResult {
  const seen = new Set(existing.map((email) => email.trim().toLowerCase()))

  const drafts: EmailDraft[] = []
  const duplicates: string[] = []
  const invalid: string[] = []

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || isComment(line)) continue

    const match = LINE_PATTERN.exec(line)
    const email = match?.[1] ?? ''

    if (!EMAIL_PATTERN.test(email)) {
      invalid.push(line)
      continue
    }

    const key = email.toLowerCase()

    if (seen.has(key)) {
      duplicates.push(email)
      continue
    }

    seen.add(key)
    drafts.push({
      email,
      password: (match?.[2] ?? '').trim(),
      label: '',
      notes: '',
      globalStatus: 'active',
    })
  }

  return { drafts, duplicates, invalid }
}
