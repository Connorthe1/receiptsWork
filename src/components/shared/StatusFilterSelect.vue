<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { StatusFilter } from '@/types'

const filter = defineModel<StatusFilter>({ required: true })

const options: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]
</script>

<template>
  <Select v-model="filter">
    <SelectTrigger size="sm" class="w-28" aria-label="Фильтр по статусу">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
