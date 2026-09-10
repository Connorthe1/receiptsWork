<script setup lang="ts">
import { computed } from 'vue'
import CopyButton from '@/components/shared/CopyButton.vue'
import RowActions from '@/components/shared/RowActions.vue'
import SecretValue from '@/components/shared/SecretValue.vue'
import StatusToggle from '@/components/shared/StatusToggle.vue'
import { cn } from '@/lib/utils'
import type { EmailAccount, EmailStatus } from '@/types'

/** `status` is `null` on the Home page, where an account has no per-section state to show. */
const props = defineProps<{ email: EmailAccount; status: EmailStatus | null }>()

const emit = defineEmits<{
  'update:status': [status: EmailStatus]
  edit: []
  remove: []
}>()

const status = computed({
  get: () => props.status ?? 'active',
  set: (value: EmailStatus) => emit('update:status', value),
})

/** Inline template avoids Tailwind choking on `minmax(..., 1fr)` in class names. */
const rowStyle = {
  gridTemplateColumns: '1.75rem 15rem 7.5rem minmax(0, 1fr)',
}

/** Same mask length on every row so the dots themselves look even. */
const PASSWORD_MASK = '••••••••'
</script>

<template>
  <div
    :style="rowStyle"
    :class="
      cn(
        'hover:bg-muted/40 grid w-full min-w-0 items-center gap-x-3 px-5 py-3 transition-colors',
        status === 'inactive' && 'bg-muted/20 opacity-55',
      )
    "
  >
    <span class="text-muted-foreground text-right text-xs tabular-nums">
      {{ email.index }}
    </span>

    <div class="min-w-0 overflow-hidden">
      <div class="flex min-w-0 items-center gap-1">
        <span class="min-w-0 flex-1 truncate text-sm font-medium" :title="email.email">
          {{ email.email }}
        </span>
        <CopyButton :value="email.email" what="email" />
      </div>
      <p
        v-if="email.label || email.notes"
        class="text-muted-foreground truncate text-xs"
        :title="[email.label, email.notes].filter(Boolean).join(' · ')"
      >
        {{ [email.label, email.notes].filter(Boolean).join(' · ') }}
      </p>
    </div>

    <SecretValue :value="email.password" :mask="PASSWORD_MASK" class="w-16 shrink-0">
      <CopyButton :value="email.password" what="пароль" />
    </SecretValue>

    <div class="flex items-center justify-end gap-1.5">
      <StatusToggle v-if="props.status" v-model="status" :label="`Статус ${email.email}`" />
      <RowActions :label="email.email" @edit="emit('edit')" @remove="emit('remove')" />
    </div>
  </div>
</template>
