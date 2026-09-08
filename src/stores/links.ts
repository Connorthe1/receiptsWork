import { linkRepository } from '@/services'
import { defineScopedStore } from './scoped'

export const useLinkStore = defineScopedStore('links', linkRepository)
