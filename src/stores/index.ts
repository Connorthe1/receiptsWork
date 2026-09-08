import { useAddressStore } from './addresses'
import { useCardStore } from './cards'
import { useEmailStore } from './emails'
import { useImportantInfoStore } from './importantInfo'
import { useLinkStore } from './links'
import { useOutcomeStore } from './outcomes'
import { useWorkspaceStore } from './workspaces'

export {
  useAddressStore,
  useCardStore,
  useEmailStore,
  useImportantInfoStore,
  useLinkStore,
  useOutcomeStore,
  useWorkspaceStore,
}

/** Single entry point for loading and for cascading deletes across stores. */
export function useDashboardData() {
  const workspaces = useWorkspaceStore()
  const emails = useEmailStore()
  const importantInfo = useImportantInfoStore()
  const addresses = useAddressStore()
  const cards = useCardStore()
  const links = useLinkStore()
  const outcomes = useOutcomeStore()

  const scoped = [importantInfo, addresses, cards, links, outcomes]

  async function loadAll(): Promise<void> {
    await Promise.all([workspaces.load(), emails.load(), ...scoped.map((store) => store.load())])
  }

  /** Drops the workspace together with everything that only lived inside it. */
  async function deleteWorkspace(id: string): Promise<void> {
    await Promise.all(scoped.map((store) => store.removeScope(id)))
    await workspaces.remove(id)
  }

  async function reloadAll(): Promise<void> {
    workspaces.reset()
    emails.reset()
    scoped.forEach((store) => store.reset())
    await loadAll()
  }

  return {
    workspaces,
    emails,
    importantInfo,
    addresses,
    cards,
    links,
    outcomes,
    loadAll,
    reloadAll,
    deleteWorkspace,
  }
}
