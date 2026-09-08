export type EmailStatus = 'active' | 'inactive'

/** `null` means the record belongs to the Home page rather than to a workspace. */
export type WorkspaceScope = string | null

export interface BaseEntity {
  id: string
  createdAt: number
  updatedAt: number
}

export interface EmailAccount extends BaseEntity {
  email: string
  password: string
  label: string
  notes: string
  globalStatus: EmailStatus
}

export interface Workspace extends BaseEntity {
  name: string
  description: string
  icon: string
  color: string
}

/** Per-workspace override of an email status. The email itself is never duplicated. */
export interface WorkspaceEmailStatus {
  id: string
  workspaceId: string
  emailId: string
  status: EmailStatus
}

export interface ImportantItem extends BaseEntity {
  workspaceId: WorkspaceScope
  title: string
  value: string
  isSecret: boolean
  notes: string
}

export interface Address extends BaseEntity {
  workspaceId: WorkspaceScope
  label: string
  firstName: string
  lastName: string
  company: string
  address1: string
  address2: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
  email: string
  notes: string
}

export interface PaymentCard extends BaseEntity {
  workspaceId: WorkspaceScope
  label: string
  cardholderName: string
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  billingAddressId: string | null
  notes: string
}

export interface LinkItem extends BaseEntity {
  workspaceId: WorkspaceScope
  title: string
  url: string
  category: string
  notes: string
}

export type StatusFilter = 'all' | 'active' | 'inactive'

/**
 * Shapes edited by the form dialogs. `workspaceId` is added by the surrounding block,
 * so the dialogs stay reusable between the Home page and workspaces.
 */
export type EmailDraft = Omit<EmailAccount, keyof BaseEntity>
export type WorkspaceDraft = Omit<Workspace, keyof BaseEntity>
export type ImportantItemDraft = Omit<ImportantItem, keyof BaseEntity | 'workspaceId'>
export type AddressDraft = Omit<Address, keyof BaseEntity | 'workspaceId'>
export type CardDraft = Omit<PaymentCard, keyof BaseEntity | 'workspaceId'>
export type LinkDraft = Omit<LinkItem, keyof BaseEntity | 'workspaceId'>
