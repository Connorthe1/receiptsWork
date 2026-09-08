<script setup lang="ts">
import { ClipboardCopyIcon } from '@lucide/vue'
import { computed } from 'vue'
import CopyButton from '@/components/shared/CopyButton.vue'
import RowActions from '@/components/shared/RowActions.vue'
import SecretValue from '@/components/shared/SecretValue.vue'
import StatusToggle from '@/components/shared/StatusToggle.vue'
import { cn } from '@/lib/utils'
import type { EmailAccount, EmailStatus } from '@/types'

const props = defineProps<{ email: EmailAccount; status: EmailStatus }>()

const emit = defineEmits<{
  'update:status': [status: EmailStatus]
  edit: []
  remove: []
}>()

const status = computed({
  get: () => props.status,
  set: (value: EmailStatus) => emit('update:status', value),
})

const bothValues = computed(() => `${props.email.email}\n${props.email.password}`)
</script>

<template>
  <div
    :class="
      cn(
        'hover:bg-muted/40 flex items-center gap-3 px-4 py-2 transition-colors',
        status === 'inactive' && 'bg-muted/20 opacity-55',
      )
    "
  >
    <div class="min-w-0 flex-1">
      <div class="flex min-w-0 items-center gap-1">
        <span class="truncate text-sm font-medium">{{ email.email }}</span>
        <CopyButton :value="email.email" what="email" />
      </div>
      <p v-if="email.label || email.notes" class="text-muted-foreground truncate text-xs">
        {{ [email.label, email.notes].filter(Boolean).join(' · ') }}
      </p>
    </div>

    <div class="hidden w-56 items-center gap-1 md:flex">
      <SecretValue :value="email.password" class="flex-1" />
      <CopyButton :value="email.password" what="пароль" />
    </div>

    <CopyButton :value="bothValues" what="email и пароль" :icon="ClipboardCopyIcon" />

    <StatusToggle v-model="status" :label="`Статус ${email.email}`" />

    <RowActions :label="email.email" @edit="emit('edit')" @remove="emit('remove')" />
  </div>
</template>
