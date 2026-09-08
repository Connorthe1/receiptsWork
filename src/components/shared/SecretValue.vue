<script setup lang="ts">
import { EyeIcon, EyeOffIcon } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { maskSecret } from '@/utils/format'

const props = defineProps<{
  value: string
  /** Custom masked representation, e.g. a card number keeping its last four digits. */
  mask?: string
  class?: string
}>()

const revealed = ref(false)
const displayed = computed(() =>
  revealed.value ? props.value || '—' : (props.mask ?? maskSecret(props.value)),
)
</script>

<template>
  <span class="flex min-w-0 items-center gap-1">
    <span :class="cn('truncate font-mono text-sm', props.class)">{{ displayed }}</span>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      class="text-muted-foreground hover:text-foreground size-7 shrink-0"
      :aria-label="revealed ? 'Скрыть значение' : 'Показать значение'"
      @click="revealed = !revealed"
    >
      <EyeOffIcon v-if="revealed" class="size-3.5" />
      <EyeIcon v-else class="size-3.5" />
    </Button>
  </span>
</template>
