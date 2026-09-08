<script setup lang="ts">
import { useId } from 'vue'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const props = defineProps<{ label: string; hint?: string; class?: string }>()

const id = useId()
</script>

<template>
  <div :class="cn('grid gap-1.5', props.class)">
    <Label :for="id" class="text-xs">{{ label }}</Label>
    <slot :id="id" />
    <p v-if="hint" class="text-muted-foreground text-xs">{{ hint }}</p>
  </div>
</template>
