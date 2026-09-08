<script setup lang="ts">
import { SearchIcon } from '@lucide/vue'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const search = defineModel<string>({ required: true })

const props = withDefaults(defineProps<{ placeholder?: string; class?: string }>(), {
  placeholder: 'Поиск…',
})
</script>

<template>
  <div :class="cn('relative', props.class)">
    <SearchIcon
      class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
    />
    <Input v-model="search" :placeholder="placeholder" class="h-8 pl-8 text-sm" />
  </div>
</template>
