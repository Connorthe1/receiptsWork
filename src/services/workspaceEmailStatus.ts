import { db } from '@/db'
import type { EmailStatus, WorkspaceEmailStatus } from '@/types'

/**
 * Join table between workspaces and the global email list. A row only exists once a
 * workspace overrides the status, so the absence of a row means "follow the global status".
 */
export const workspaceEmailStatusService = {
  all: () => db.workspaceEmailStatuses.toArray(),

  async set(
    workspaceId: string,
    emailId: string,
    status: EmailStatus,
  ): Promise<WorkspaceEmailStatus> {
    const existing = await db.workspaceEmailStatuses
      .where('[workspaceId+emailId]')
      .equals([workspaceId, emailId])
      .first()

    if (existing) {
      await db.workspaceEmailStatuses.update(existing.id, { status })
      return { ...existing, status }
    }

    const entry: WorkspaceEmailStatus = {
      id: crypto.randomUUID(),
      workspaceId,
      emailId,
      status,
    }

    await db.workspaceEmailStatuses.add(entry)
    return entry
  },

  async removeByWorkspace(workspaceId: string): Promise<void> {
    await db.workspaceEmailStatuses.where('workspaceId').equals(workspaceId).delete()
  },

  async removeByEmail(emailId: string): Promise<void> {
    await db.workspaceEmailStatuses.where('emailId').equals(emailId).delete()
  },

  async clear(): Promise<void> {
    await db.workspaceEmailStatuses.clear()
  },
}
