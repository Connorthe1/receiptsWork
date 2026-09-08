import { ref, type Ref } from 'vue'

/**
 * Holds the record a confirmation dialog is asking about. Destructure the result so the
 * refs unwrap correctly inside templates.
 */
export function useDeletionTarget<T>() {
  const target = ref<T | null>(null) as Ref<T | null>
  const isOpen = ref(false)

  function request(item: T): void {
    target.value = item
    isOpen.value = true
  }

  /**
   * Confirming also closes the dialog, so the target is captured before the handler runs
   * instead of being read afterwards, when the close may already have cleared it.
   */
  async function confirm(handler: (item: T) => Promise<void> | void): Promise<void> {
    const item = target.value
    isOpen.value = false

    if (item) {
      await handler(item)
    }

    target.value = null
  }

  return { target, isOpen, request, confirm }
}
