import { defineStore } from 'pinia'
import { computed } from 'vue'
import { importantItemRepository } from '@/services'
import { inCreationOrder, useCollection } from './collection'

/** One list for the whole app: the same records show up on Home and in every workspace. */
export const useImportantInfoStore = defineStore('importantInfo', () => {
  const collection = useCollection(importantItemRepository)

  return { ...collection, items: computed(() => inCreationOrder(collection.items.value)) }
})
