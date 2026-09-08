import { defineStore } from 'pinia'
import { computed } from 'vue'
import { emailRepository, workspaceEmailStatusService } from '@/services'
import type { EmailAccount } from '@/types'
import { inCreationOrder, useCollection } from './collection'
import { useWorkspaceStore } from './workspaces'

export const useEmailStore = defineStore('emails', () => {
  const collection = useCollection(emailRepository)
  const workspaceStore = useWorkspaceStore()

  const emails = computed(() => inCreationOrder(collection.items.value))

  function byId(id: string): EmailAccount | undefined {
    return collection.items.value.find((email) => email.id === id)
  }

  /** Deleting an email also drops every per-workspace override pointing at it. */
  async function remove(id: string): Promise<void> {
    await collection.remove(id)
    await workspaceEmailStatusService.removeByEmail(id)
    workspaceStore.forgetEmail(id)
  }

  return {
    emails,
    items: collection.items,
    isLoaded: collection.isLoaded,
    load: collection.load,
    create: collection.create,
    update: collection.update,
    remove,
    reset: collection.reset,
    byId,
  }
})
