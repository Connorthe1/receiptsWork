<script setup lang="ts">
import { PlusIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'

/** Icon-only, so every card header stays the same width; `label` names the action. */
defineProps<{ label: string }>()
</script>

<template>
  <Button type="button" size="icon-sm" variant="outline" :aria-label="label" :title="label">
    <PlusIcon class="size-4" />
  </Button>
</template>
