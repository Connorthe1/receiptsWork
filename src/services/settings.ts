import { db } from '@/db'

/**
 * Key-value preferences kept in IndexedDB rather than localStorage, so they are part of
 * the backup. The caller supplies the fallback, which also fixes the value's type.
 */
export const settingsService = {
  async get<T>(id: string, fallback: T): Promise<T> {
    const row = await db.settings.get(id)
    return row === undefined ? fallback : (row.value as T)
  },

  async set(id: string, value: unknown): Promise<void> {
    await db.settings.put({ id, value })
  },
}
