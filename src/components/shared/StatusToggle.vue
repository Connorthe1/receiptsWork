<script setup lang="ts">
import { computed } from 'vue'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type { EmailStatus } from '@/types'

const status = defineModel<EmailStatus>({ required: true })

defineProps<{ label?: string }>()

const isActive = computed({
  get: () => status.value === 'active',
  set: (value: boolean) => {
    status.value = value ? 'active' : 'inactive'
  },
})
</script>

<template>
  <label class="flex shrink-0 cursor-pointer items-center gap-2">
    <Switch v-model="isActive" :aria-label="label ?? 'Статус'" />
    <span
      :class="
        cn('w-14 text-xs font-medium', isActive ? 'text-emerald-500' : 'text-muted-foreground')
      "
    >
      {{ isActive ? 'Active' : 'Inactive' }}
    </span>
  </label>
</template>
