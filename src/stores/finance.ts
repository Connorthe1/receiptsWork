import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { financeOperationRepository, financeTagRepository, settingsService } from '@/services'
import type { Currency, FinanceOperation, FinanceTag } from '@/types'
import { convert, UNTAGGED } from '@/utils/finance'
import { inCreationOrder, useCollection } from './collection'

const USD_RATE_KEY = 'usdRate'
const DEFAULT_USD_RATE = 90

export const useFinanceStore = defineStore('finance', () => {
  const operationCollection = useCollection(financeOperationRepository)
  const tagCollection = useCollection(financeTagRepository)

  /** Rubles per dollar, set by hand. It lives in the database so the backup carries it. */
  const usdRate = ref(DEFAULT_USD_RATE)

  /** A view preference of this browser, so it stays out of the backup. */
  const displayCurrency = useStorage<Currency>('receipts-work-finance-currency', 'RUB')

  /** Newest day first; within a day the operation entered last is on top. */
  const operations = computed(() =>
    [...operationCollection.items.value].sort(
      (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt,
    ),
  )

  const tags = computed(() => inCreationOrder(tagCollection.items.value))

  async function load(): Promise<void> {
    await Promise.all([operationCollection.load(), tagCollection.load()])
    usdRate.value = await settingsService.get(USD_RATE_KEY, DEFAULT_USD_RATE)
  }

  function tagById(id: string | null): FinanceTag | undefined {
    return id ? tagCollection.items.value.find((tag) => tag.id === id) : undefined
  }

  /** The tag an operation is counted under; a tag that no longer exists counts as none. */
  function tagKey(operation: FinanceOperation): string {
    return tagById(operation.tagId)?.id ?? UNTAGGED
  }

  function toDisplay(operation: Pick<FinanceOperation, 'amount' | 'currency'>): number {
    return convert(operation.amount, operation.currency, displayCurrency.value, usdRate.value)
  }

  async function setUsdRate(rate: number): Promise<void> {
    await settingsService.set(USD_RATE_KEY, rate)
    usdRate.value = rate
  }

  /** The operations stay where they are; they only lose the tag. */
  async function removeTag(id: string): Promise<void> {
    const tagged = operationCollection.items.value.filter((operation) => operation.tagId === id)
    await Promise.all(
      tagged.map((operation) => operationCollection.update(operation.id, { tagId: null })),
    )
    await tagCollection.remove(id)
  }

  function reset(): void {
    operationCollection.reset()
    tagCollection.reset()
    usdRate.value = DEFAULT_USD_RATE
  }

  return {
    operations,
    tags,
    usdRate,
    displayCurrency,
    isLoaded: operationCollection.isLoaded,
    load,
    reset,
    tagById,
    tagKey,
    toDisplay,
    setUsdRate,
    createOperation: operationCollection.create,
    updateOperation: operationCollection.update,
    removeOperation: operationCollection.remove,
    createTag: tagCollection.create,
    updateTag: tagCollection.update,
    removeTag,
  }
})
