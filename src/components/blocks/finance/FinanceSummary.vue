<script setup lang="ts">
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  PercentIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from '@lucide/vue'
import { computed } from 'vue'
import type { Currency } from '@/types'
import { formatMoney, formatPercent, type FinanceSummary } from '@/utils/finance'
import FinanceStatCard from './FinanceStatCard.vue'

const props = defineProps<{ summary: FinanceSummary; currency: Currency }>()

const tone = computed(() => {
  if (props.summary.profit > 0) return 'positive'
  if (props.summary.profit < 0) return 'negative'
  return 'neutral'
})

const money = (amount: number) => formatMoney(amount, props.currency)
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <FinanceStatCard
      label="Вложено"
      :icon="ArrowUpRightIcon"
      :value="money(summary.invested)"
      :hint="`Операций: ${summary.depositCount}`"
    />
    <FinanceStatCard
      label="Выведено"
      :icon="ArrowDownLeftIcon"
      :value="money(summary.withdrawn)"
      :hint="`Операций: ${summary.withdrawalCount}`"
    />
    <FinanceStatCard
      label="Профит"
      :icon="summary.profit < 0 ? TrendingDownIcon : TrendingUpIcon"
      :value="formatMoney(summary.profit, currency, true)"
      :tone="tone"
      hint="Выведено минус вложено"
    />
    <FinanceStatCard
      label="ROI"
      :icon="PercentIcon"
      :value="summary.roi === null ? '—' : formatPercent(summary.roi)"
      :tone="tone"
      :hint="summary.roi === null ? 'Пока нет вложений' : 'Профит к вложениям'"
    />
  </div>
</template>
