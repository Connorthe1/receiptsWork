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
    /** The headline figures are large; the secondary statistics stay compact. */
    size?: 'lg' | 'sm'
  }>(),
  { tone: 'neutral', size: 'lg' },
)

const toneClasses = {
  neutral: '',
  positive: 'text-emerald-600 dark:text-emerald-400',
  negative: 'text-destructive',
}
</script>

<template>
  <div
    :class="
      cn(
        'bg-card text-card-foreground ring-foreground/10 flex min-w-0 flex-col rounded-xl shadow-xs ring-1',
        props.size === 'lg' ? 'gap-2 px-5 py-4' : 'gap-1 px-4 py-3',
      )
    "
  >
    <div class="text-muted-foreground flex items-center gap-2 text-xs font-medium">
      <component :is="icon" v-if="icon" class="size-4 shrink-0" />
      <span class="truncate">{{ label }}</span>
    </div>
    <p
      :class="
        cn(
          'truncate font-semibold tracking-tight tabular-nums',
          props.size === 'lg' ? 'text-2xl' : 'text-lg',
          toneClasses[props.tone],
        )
      "
    >
      {{ value }}
    </p>
    <p v-if="hint" class="text-muted-foreground truncate text-xs">{{ hint }}</p>
  </div>
</template>
