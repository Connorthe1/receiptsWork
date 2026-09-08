import Dexie, { type Table } from 'dexie'
import type {
  Address,
  EmailAccount,
  ImportantItem,
  LinkItem,
  OutcomeItem,
  PaymentCard,
  Workspace,
  WorkspaceEmailStatus,
} from '@/types'

export class DashboardDatabase extends Dexie {
  emails!: Table<EmailAccount, string>
  workspaces!: Table<Workspace, string>
  workspaceEmailStatuses!: Table<WorkspaceEmailStatus, string>
  importantItems!: Table<ImportantItem, string>
  addresses!: Table<Address, string>
  cards!: Table<PaymentCard, string>
  links!: Table<LinkItem, string>
  outcomes!: Table<OutcomeItem, string>

  constructor() {
    super('receipts-work')

    this.version(1).stores({
      emails: 'id, email, globalStatus, createdAt',
      workspaces: 'id, name, createdAt',
      workspaceEmailStatuses: 'id, [workspaceId+emailId], workspaceId, emailId',
      importantItems: 'id, workspaceId, createdAt',
      addresses: 'id, workspaceId, createdAt',
      cards: 'id, workspaceId, createdAt',
      links: 'id, workspaceId, createdAt',
    })

    this.version(2).stores({
      outcomes: 'id, workspaceId, createdAt',
    })
  }
}

export const db = new DashboardDatabase()

export const dbTables = [
  'emails',
  'workspaces',
  'workspaceEmailStatuses',
  'importantItems',
  'addresses',
  'cards',
  'links',
  'outcomes',
] as const

export type DbTableName = (typeof dbTables)[number]
