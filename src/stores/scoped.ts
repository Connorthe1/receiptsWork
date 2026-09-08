import { defineStore } from 'pinia'
import type { Repository } from '@/services'
import type { BaseEntity, WorkspaceScope } from '@/types'
import { byScope, inCreationOrder, useCollection } from './collection'

type Scoped = BaseEntity & { workspaceId: WorkspaceScope }

/**
 * Important info, addresses, cards and links only differ by their entity shape:
 * each one is a flat list where `workspaceId === null` belongs to the Home page.
 */
export function defineScopedStore<T extends Scoped>(id: string, repository: Repository<T>) {
  return defineStore(id, () => {
    const collection = useCollection(repository)

    function forScope(scope: WorkspaceScope): T[] {
      return inCreationOrder(byScope(collection.items.value, scope))
    }

    async function removeScope(scope: WorkspaceScope): Promise<void> {
      const doomed = byScope(collection.items.value, scope)
      await Promise.all(doomed.map((item) => repository.remove(item.id)))
      collection.items.value = collection.items.value.filter((item) => item.workspaceId !== scope)
    }

    return { ...collection, forScope, removeScope }
  })
}
