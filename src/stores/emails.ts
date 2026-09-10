import { defineStore } from 'pinia'
import { computed } from 'vue'
import { emailRepository, workspaceEmailStatusService } from '@/services'
import type { EmailAccount, EmailDraft } from '@/types'
import { useCollection } from './collection'
import { useWorkspaceStore } from './workspaces'

export const useEmailStore = defineStore('emails', () => {
  const collection = useCollection(emailRepository)
  const workspaceStore = useWorkspaceStore()

  const emails = computed(() =>
    [...collection.items.value].sort((a, b) => a.index - b.index || a.createdAt - b.createdAt),
  )

  function byId(id: string): EmailAccount | undefined {
    return collection.items.value.find((email) => email.id === id)
  }

  function nextIndex(): number {
    return collection.items.value.reduce((max, email) => Math.max(max, email.index ?? 0), 0) + 1
  }

  /** Backfill `index` for rows restored from older backups that predate the field. */
  async function ensureIndices(): Promise<void> {
    const items = collection.items.value
    if (items.length === 0 || items.every((email) => typeof email.index === 'number')) return

    const ordered = [...items].sort(
      (a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id),
    )

    for (let i = 0; i < ordered.length; i++) {
      const email = ordered[i]!
      const index = i + 1

      if (email.index === index) continue

      await collection.update(email.id, { index })
    }
  }

  async function load(): Promise<void> {
    await collection.load()
    await ensureIndices()
  }

  async function create(draft: EmailDraft): Promise<EmailAccount> {
    return collection.create({ ...draft, index: nextIndex() })
  }

  async function createMany(drafts: EmailDraft[]): Promise<EmailAccount[]> {
    let index = nextIndex()

    return collection.createMany(drafts.map((draft) => ({ ...draft, index: index++ })))
  }

  /** Deleting an email also drops every per-workspace override pointing at it. */
  async function remove(id: string): Promise<void> {
    await collection.remove(id)
    await workspaceEmailStatusService.removeByEmail(id)
    workspaceStore.forgetEmail(id)
  }

  async function removeAll(): Promise<void> {
    await collection.clear()
    await workspaceEmailStatusService.clear()
    workspaceStore.forgetAllEmails()
  }

  return {
    emails,
    items: collection.items,
    isLoaded: collection.isLoaded,
    load,
    create,
    createMany,
    update: collection.update,
    remove,
    removeAll,
    reset: collection.reset,
    byId,
  }
})
