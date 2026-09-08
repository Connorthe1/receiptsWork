import { ref, type Ref } from 'vue'
import type { Draft, Repository } from '@/services'
import type { BaseEntity, WorkspaceScope } from '@/types'

/**
 * Keeps a whole table in memory and mirrors every change to IndexedDB.
 * The dataset is personal-sized, so filtering happens in getters rather than in queries.
 */
export function useCollection<T extends BaseEntity>(repository: Repository<T>) {
  const items = ref([]) as Ref<T[]>
  const isLoaded = ref(false)

  async function load(): Promise<void> {
    if (isLoaded.value) return

    items.value = await repository.all()
    isLoaded.value = true
  }

  async function create(draft: Draft<T>): Promise<T> {
    const created = await repository.create(draft)
    items.value.push(created)
    return created
  }

  async function update(id: string, patch: Partial<Draft<T>>): Promise<T> {
    const updated = await repository.update(id, patch)
    const index = items.value.findIndex((item) => item.id === id)

    if (index !== -1) {
      items.value.splice(index, 1, updated)
    }

    return updated
  }

  async function remove(id: string): Promise<void> {
    await repository.remove(id)
    items.value = items.value.filter((item) => item.id !== id)
  }

  function reset(): void {
    items.value = []
    isLoaded.value = false
  }

  return { items, isLoaded, load, create, update, remove, reset }
}

export function byScope<T extends { workspaceId: WorkspaceScope }>(
  items: T[],
  scope: WorkspaceScope,
): T[] {
  return items.filter((item) => item.workspaceId === scope)
}

export function inCreationOrder<T extends BaseEntity>(items: T[]): T[] {
  return [...items].sort((a, b) => a.createdAt - b.createdAt)
}
