<script setup lang="ts">
import { CheckIcon, CopyIcon } from '@lucide/vue'
import type { Component } from 'vue'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCopy } from '@/composables/useCopy'

const props = withDefaults(
  defineProps<{
    value: string
    /** Shown in the tooltip, e.g. "Email". */
    what?: string
    icon?: Component
  }>(),
  { what: 'значение' },
)

const { copyValue } = useCopy()
const justCopied = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | undefined

async function handleCopy() {
  await copyValue(props.value)
  justCopied.value = true

  clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    justCopied.value = false
  }, 1200)
}
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        class="text-muted-foreground hover:text-foreground shrink-0"
        :aria-label="`Копировать ${what}`"
        @click="handleCopy"
      >
        <CheckIcon v-if="justCopied" class="size-3.5 text-emerald-500" />
        <component :is="icon ?? CopyIcon" v-else class="size-3.5" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Копировать {{ what }}</TooltipContent>
  </Tooltip>
</template>
