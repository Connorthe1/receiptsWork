import { importantItemRepository } from '@/services'
import { defineScopedStore } from './scoped'

export const useImportantInfoStore = defineScopedStore('importantInfo', importantItemRepository)
