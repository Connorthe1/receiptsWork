import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { workspaceEmailStatusService, workspaceRepository } from '@/services'
import type { EmailAccount, EmailStatus, Workspace, WorkspaceEmailStatus } from '@/types'
import { useCollection } from './collection'

export const useWorkspaceStore = defineStore('workspaces', () => {
  const collection = useCollection(workspaceRepository)
  const emailStatuses = ref<WorkspaceEmailStatus[]>([])

  const workspaces = computed(() =>
    [...collection.items.value].sort((a, b) => a.createdAt - b.createdAt),
  )

  async function load(): Promise<void> {
    await collection.load()
    emailStatuses.value = await workspaceEmailStatusService.all()
  }

  function byId(id: string): Workspace | undefined {
    return collection.items.value.find((workspace) => workspace.id === id)
  }

  /** Falls back to the global status until the workspace explicitly overrides it. */
  function emailStatus(workspaceId: string, email: EmailAccount): EmailStatus {
    const override = emailStatuses.value.find(
      (entry) => entry.workspaceId === workspaceId && entry.emailId === email.id,
    )

    return override?.status ?? email.globalStatus
  }

  async function setEmailStatus(
    workspaceId: string,
    emailId: string,
    status: EmailStatus,
  ): Promise<void> {
    const entry = await workspaceEmailStatusService.set(workspaceId, emailId, status)
    const index = emailStatuses.value.findIndex((item) => item.id === entry.id)

    if (index === -1) {
      emailStatuses.value.push(entry)
    } else {
      emailStatuses.value.splice(index, 1, entry)
    }
  }

  function forgetEmail(emailId: string): void {
    emailStatuses.value = emailStatuses.value.filter((entry) => entry.emailId !== emailId)
  }

  function forgetAllEmails(): void {
    emailStatuses.value = []
  }

  async function remove(id: string): Promise<void> {
    await collection.remove(id)
    await workspaceEmailStatusService.removeByWorkspace(id)
    emailStatuses.value = emailStatuses.value.filter((entry) => entry.workspaceId !== id)
  }

  function reset(): void {
    collection.reset()
    emailStatuses.value = []
  }

  return {
    workspaces,
    isLoaded: collection.isLoaded,
    load,
    byId,
    emailStatus,
    setEmailStatus,
    forgetEmail,
    forgetAllEmails,
    create: collection.create,
    update: collection.update,
    remove,
    reset,
  }
})
