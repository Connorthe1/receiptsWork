import type { BaseEntity } from '@/types'

/** Turns a stored record back into a draft, e.g. when duplicating it. */
export function stripEntityMeta<T extends BaseEntity>(entity: T): Omit<T, keyof BaseEntity> {
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...draft } = entity
  return draft
}
