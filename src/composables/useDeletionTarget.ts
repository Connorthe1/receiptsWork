import { computed, ref, type Ref } from 'vue'

/**
 * Holds the record a confirmation dialog is asking about. Destructure the result so the
 * refs unwrap correctly inside templates.
 */
export function useDeletionTarget<T>() {
  const target = ref<T | null>(null) as Ref<T | null>

  const isOpen = computed({
    get: () => target.value !== null,
    set: (value: boolean) => {
      if (!value) target.value = null
    },
  })

  function request(item: T): void {
    target.value = item
  }

  function dismiss(): void {
    target.value = null
  }

  return { target, isOpen, request, dismiss }
}
