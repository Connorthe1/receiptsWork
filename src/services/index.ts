import { db } from '@/db'
import { createRepository } from './repository'

export const emailRepository = createRepository(db.emails)
export const workspaceRepository = createRepository(db.workspaces)
export const importantItemRepository = createRepository(db.importantItems)
export const addressRepository = createRepository(db.addresses)
export const cardRepository = createRepository(db.cards)
export const linkRepository = createRepository(db.links)
export const outcomeRepository = createRepository(db.outcomes)
export const financeOperationRepository = createRepository(db.financeOperations)
export const financeTagRepository = createRepository(db.financeTags)

export * from './repository'
export * from './settings'
export * from './workspaceEmailStatus'
export * from './backup'
