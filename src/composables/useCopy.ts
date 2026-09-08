import { useClipboard } from '@vueuse/core'
import { toast } from 'vue-sonner'

/**
 * Clipboard helper used by every copy button. Values are intentionally never logged
 * or included in error messages, since most of them are secrets.
 */
export function useCopy() {
  const { copy, isSupported } = useClipboard({ legacy: true })

  async function copyValue(value: string, label = 'Скопировано'): Promise<void> {
    if (!value) {
      toast.warning('Нечего копировать')
      return
    }

    try {
      await copy(value)
      toast.success(label, { duration: 1500 })
    } catch {
      toast.error('Не удалось скопировать')
    }
  }

  return { copyValue, isSupported }
}
