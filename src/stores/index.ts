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

  /** Lists that belong to a single scope; the email and important-info lists are app-wide. */
  const scoped = [addresses, cards, links, outcomes]
  const global = [workspaces, emails, importantInfo]

  async function loadAll(): Promise<void> {
    await Promise.all([...global, ...scoped].map((store) => store.load()))
  }

  /** Drops the workspace together with everything that only lived inside it. */
  async function deleteWorkspace(id: string): Promise<void> {
    await Promise.all(scoped.map((store) => store.removeScope(id)))
    await workspaces.remove(id)
  }

  async function reloadAll(): Promise<void> {
    for (const store of [...global, ...scoped]) {
      store.reset()
    }

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
