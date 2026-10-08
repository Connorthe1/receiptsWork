<script setup lang="ts">
import type { Component } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    label: string
    value: string
    hint?: string
    icon?: Component
    /** Colours the value: profit green, loss red. */
    tone?: 'neutral' | 'positive' | 'negative'
  }>(),
  { tone: 'neutral' },
)

const toneClasses = {
  neutral: '',
  positive: 'text-emerald-600 dark:text-emerald-400',
  negative: 'text-destructive',
}
</script>

<template>
  <div
    class="bg-card text-card-foreground ring-foreground/10 flex min-w-0 flex-col gap-2 rounded-xl px-5 py-4 shadow-xs ring-1"
  >
    <div class="text-muted-foreground flex items-center gap-2 text-xs font-medium">
      <component :is="icon" v-if="icon" class="size-4 shrink-0" />
      <span class="truncate">{{ label }}</span>
    </div>
    <p
      :class="
        cn('truncate text-2xl font-semibold tracking-tight tabular-nums', toneClasses[props.tone])
      "
    >
      {{ value }}
    </p>
    <p v-if="hint" class="text-muted-foreground truncate text-xs">{{ hint }}</p>
  </div>
</template>
