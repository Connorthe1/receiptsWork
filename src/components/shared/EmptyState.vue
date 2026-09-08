<script setup lang="ts">
import { PlusIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'

defineProps<{
  title: string
  description?: string
  actionLabel?: string
}>()

const emit = defineEmits<{ action: [] }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-2 px-5 py-12 text-center">
    <p class="text-sm font-medium">{{ title }}</p>
    <p v-if="description" class="text-muted-foreground max-w-xs text-xs">{{ description }}</p>
    <Button v-if="actionLabel" size="sm" variant="outline" class="mt-2" @click="emit('action')">
      <PlusIcon class="size-4" />
      {{ actionLabel }}
    </Button>
  </div>
</template>
