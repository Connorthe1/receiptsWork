import { outcomeRepository } from '@/services'
import { defineScopedStore } from './scoped'

export const useOutcomeStore = defineScopedStore('outcomes', outcomeRepository)
