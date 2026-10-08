<script setup lang="ts">
import { ArrowDownLeftIcon, ArrowUpRightIcon } from '@lucide/vue'
import { computed } from 'vue'
import RowActions from '@/components/shared/RowActions.vue'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { workspaceColor } from '@/lib/workspaceAppearance'
import { useFinanceStore } from '@/stores'
import type { FinanceOperation } from '@/types'
import { formatIsoDate, formatMoney } from '@/utils/finance'

const props = defineProps<{ operation: FinanceOperation }>()
const emit = defineEmits<{ edit: []; remove: [] }>()

const store = useFinanceStore()

const isDeposit = computed(() => props.operation.kind === 'deposit')
const tag = computed(() => store.tagById(props.operation.tagId))

/** From the wallet's point of view: money put in leaves it, a withdrawal comes back. */
const sign = computed(() => (isDeposit.value ? -1 : 1))

const amount = computed(() =>
  formatMoney(sign.value * props.operation.amount, props.operation.currency, true),
)

/** The sum is shown as it was entered; the display currency only joins in when it differs. */
const converted = computed(() =>
  props.operation.currency === store.displayCurrency
    ? null
    : formatMoney(sign.value * store.toDisplay(props.operation), store.displayCurrency, true),
)
</script>

<template>
  <div class="hover:bg-muted/40 flex items-center gap-3 px-5 py-3 transition-colors">
    <div
      :class="
        cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full',
          isDeposit
            ? 'bg-muted text-muted-foreground'
            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        )
      "
    >
      <ArrowUpRightIcon v-if="isDeposit" class="size-4" />
      <ArrowDownLeftIcon v-else class="size-4" />
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex min-w-0 items-center gap-2">
        <span
          :class="
            cn(
              'shrink-0 text-sm font-medium tabular-nums',
              !isDeposit && 'text-emerald-600 dark:text-emerald-400',
            )
          "
        >
          {{ amount }}
        </span>
        <span v-if="converted" class="text-muted-foreground shrink-0 text-xs tabular-nums">
          ≈ {{ converted }}
        </span>
        <Badge v-if="tag" variant="outline" class="max-w-32 min-w-0">
          <span :class="cn('size-1.5 shrink-0 rounded-full', workspaceColor(tag.color))" />
          <span class="truncate">{{ tag.name }}</span>
        </Badge>
      </div>
      <p class="text-muted-foreground truncate text-xs">
        {{ isDeposit ? 'Вложение' : 'Вывод'
        }}<span v-if="operation.notes"> · {{ operation.notes }}</span>
      </p>
    </div>

    <span class="text-muted-foreground shrink-0 text-xs tabular-nums">
      {{ formatIsoDate(operation.date) }}
    </span>
    <RowActions :label="amount" @edit="emit('edit')" @remove="emit('remove')" />
  </div>
</template>
