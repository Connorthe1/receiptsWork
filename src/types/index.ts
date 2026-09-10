export type EmailStatus = 'active' | 'inactive'

/** `null` means the record belongs to the Home page rather than to a workspace. */
export type WorkspaceScope = string | null

export interface BaseEntity {
  id: string
  createdAt: number
  updatedAt: number
}

export interface EmailAccount extends BaseEntity {
  /** Stable ordinal assigned on create; never renumbered when the list is filtered or reordered. */
  index: number
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

/** Shared across the Home page and every workspace, just like the email list. */
export interface ImportantItem extends BaseEntity {
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
  address1: string
  address2: string
  city: string
  state: string
  postalCode: string
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

/** Free-form result jotted down while working: codes from email, order numbers, notes. */
export interface OutcomeItem extends BaseEntity {
  workspaceId: WorkspaceScope
  text: string
}

export type StatusFilter = 'all' | 'active' | 'inactive'

/**
 * Shapes edited by the form dialogs. `workspaceId` is added by the surrounding block,
 * so the dialogs stay reusable between the Home page and workspaces.
 */
export type EmailDraft = Omit<EmailAccount, keyof BaseEntity | 'index'>
export type WorkspaceDraft = Omit<Workspace, keyof BaseEntity>
export type ImportantItemDraft = Omit<ImportantItem, keyof BaseEntity>
export type AddressDraft = Omit<Address, keyof BaseEntity | 'workspaceId'>
export type CardDraft = Omit<PaymentCard, keyof BaseEntity | 'workspaceId'>
export type LinkDraft = Omit<LinkItem, keyof BaseEntity | 'workspaceId'>
