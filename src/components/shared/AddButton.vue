<script setup lang="ts">
import { PlusIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'

/** `label` stays as the accessible name once the card is too narrow to show the caption. */
defineProps<{ label: string }>()
</script>

<template>
  <Button type="button" size="sm" variant="outline" :aria-label="label">
    <PlusIcon class="size-4" />
    <span class="hidden @lg:inline">Добавить</span>
  </Button>
</template>
