import type { Table } from 'dexie'
import { db, dbTables, type DbTableName } from '@/db'

export const BACKUP_VERSION = 1

export interface BackupFile {
  app: 'receipts-work'
  version: number
  exportedAt: string
  data: Record<DbTableName, unknown[]>
}

/** The tables hold different shapes, so backup code treats every row as opaque. */
function tableOf(name: DbTableName): Table<unknown, string> {
  return db[name] as unknown as Table<unknown, string>
}

const allTables = () => dbTables.map(tableOf)

export async function exportData(): Promise<BackupFile> {
  const entries = await Promise.all(
    dbTables.map(async (name) => [name, await tableOf(name).toArray()] as const),
  )

  return {
    app: 'receipts-work',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: Object.fromEntries(entries) as Record<DbTableName, unknown[]>,
  }
}

/** Throws a message suitable for showing to the user when the file is not a valid backup. */
export function parseBackup(raw: string): BackupFile {
  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Файл не является корректным JSON')
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Файл не похож на резервную копию')
  }

  const candidate = parsed as Partial<BackupFile>

  if (
    candidate.app !== 'receipts-work' ||
    typeof candidate.data !== 'object' ||
    candidate.data === null
  ) {
    throw new Error('Файл не похож на резервную копию Receipts Work')
  }

  // Backups written before a table existed simply restore it as empty.
  const rows = candidate.data as Partial<Record<DbTableName, unknown[]>>
  const data = Object.fromEntries(
    dbTables.map((name) => [name, Array.isArray(rows[name]) ? rows[name] : []]),
  ) as Record<DbTableName, unknown[]>

  return { ...candidate, data } as BackupFile
}

/** Replaces the whole database with the backup contents. */
export async function importData(backup: BackupFile): Promise<void> {
  await db.transaction('rw', allTables(), async () => {
    for (const name of dbTables) {
      await tableOf(name).clear()
      await tableOf(name).bulkAdd(backup.data[name])
    }
  })
}

export async function clearAllData(): Promise<void> {
  await db.transaction('rw', allTables(), async () => {
    for (const name of dbTables) {
      await tableOf(name).clear()
    }
  })
}
