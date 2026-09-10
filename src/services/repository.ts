import type { Table, UpdateSpec } from 'dexie'
import type { BaseEntity } from '@/types'

/** Fields the caller supplies; `id` and timestamps are managed by the repository. */
export type Draft<T extends BaseEntity> = Omit<T, keyof BaseEntity>

export interface Repository<T extends BaseEntity> {
  all: () => Promise<T[]>
  create: (draft: Draft<T>) => Promise<T>
  createMany: (drafts: Draft<T>[]) => Promise<T[]>
  update: (id: string, patch: Partial<Draft<T>>) => Promise<T>
  remove: (id: string) => Promise<void>
  clear: () => Promise<void>
}

export function createRepository<T extends BaseEntity>(table: Table<T, string>): Repository<T> {
  function withMeta(draft: Draft<T>): T {
    const now = Date.now()

    return { ...draft, id: crypto.randomUUID(), createdAt: now, updatedAt: now } as T
  }

  return {
    all: () => table.toArray(),

    async create(draft) {
      const entity = withMeta(draft)

      await table.add(entity)
      return entity
    },

    async createMany(drafts) {
      const base = Date.now()
      const entities = drafts.map((draft, offset) => {
        const now = base + offset

        return { ...draft, id: crypto.randomUUID(), createdAt: now, updatedAt: now } as T
      })

      await table.bulkAdd(entities)
      return entities
    },

    async update(id, patch) {
      await table.update(id, { ...patch, updatedAt: Date.now() } as UpdateSpec<T>)
      const updated = await table.get(id)

      if (!updated) {
        throw new Error(`Record ${id} not found in "${table.name}"`)
      }

      return updated
    },

    async remove(id) {
      await table.delete(id)
    },

    async clear() {
      await table.clear()
    },
  }
}
