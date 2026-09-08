import { cardRepository } from '@/services'
import { defineScopedStore } from './scoped'

export const useCardStore = defineScopedStore('cards', cardRepository)
