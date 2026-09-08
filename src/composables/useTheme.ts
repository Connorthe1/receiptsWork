import { createSharedComposable, useDark, useToggle } from '@vueuse/core'

export const useTheme = createSharedComposable(() => {
  const isDark = useDark({
    storageKey: 'receipts-work-theme',
    initialValue: 'dark',
  })

  return { isDark, toggleTheme: useToggle(isDark) }
})
