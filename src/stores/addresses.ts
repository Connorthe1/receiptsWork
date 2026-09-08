import { addressRepository } from '@/services'
import { defineScopedStore } from './scoped'

export const useAddressStore = defineScopedStore('addresses', addressRepository)
