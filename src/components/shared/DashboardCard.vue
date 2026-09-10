<script setup lang="ts">
import { ChevronDownIcon } from '@lucide/vue'
import type { Component } from 'vue'
import { ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    title: string
    icon?: Component
    count?: number
    class?: string
  }>(),
  { count: 0 },
)

/** Local for now; the card is self-contained so persisting layout later stays a one-liner. */
const open = ref(true)
</script>

<template>
  <Collapsible
    v-model:open="open"
    :class="
      cn(
        // A container query: the rows adapt to the block's own width, not the window's.
        '@container bg-card text-card-foreground ring-foreground/10 flex min-w-0 flex-col overflow-hidden rounded-xl shadow-xs ring-1',
        props.class,
      )
    "
  >
    <div class="flex flex-wrap items-center gap-2 border-b px-5 py-3.5">
      <component :is="icon" v-if="icon" class="text-muted-foreground size-4 shrink-0" />
      <!-- The title gives up its width first, so the actions keep to a single row. -->
      <h2 class="min-w-0 truncate text-sm font-semibold tracking-tight">{{ title }}</h2>
      <Badge variant="secondary" class="shrink-0 tabular-nums">{{ count }}</Badge>

      <div class="ml-auto flex flex-1 items-center justify-end gap-1.5">
        <slot name="actions" />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          class="text-muted-foreground"
          :aria-label="open ? 'Свернуть блок' : 'Развернуть блок'"
          @click="open = !open"
        >
          <ChevronDownIcon :class="cn('size-4 transition-transform', !open && '-rotate-90')" />
        </Button>
      </div>
    </div>

    <CollapsibleContent>
      <slot />
    </CollapsibleContent>
  </Collapsible>
</template>
