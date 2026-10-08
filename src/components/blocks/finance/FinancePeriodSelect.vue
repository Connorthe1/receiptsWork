<script setup lang="ts">
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { financePeriods, type FinancePeriod } from '@/utils/finance'

const period = defineModel<FinancePeriod>('period', { required: true })
/** Bounds of «Свой период» as `YYYY-MM-DD`; either may stay empty. */
const from = defineModel<string>('from', { required: true })
const to = defineModel<string>('to', { required: true })
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <Select v-model="period">
      <SelectTrigger size="sm" class="w-40" aria-label="Период">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="option in financePeriods" :key="option.value" :value="option.value">
          {{ option.label }}
        </SelectItem>
      </SelectContent>
    </Select>

    <template v-if="period === 'custom'">
      <Input v-model="from" type="date" class="h-8 w-36" aria-label="С даты" />
      <span class="text-muted-foreground text-xs">—</span>
      <Input v-model="to" type="date" class="h-8 w-36" aria-label="По дату" />
    </template>
  </div>
</template>
