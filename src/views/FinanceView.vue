<script setup lang="ts">
import { XIcon } from '@lucide/vue'
import { computed, ref } from 'vue'
import FinanceCurrencyControls from '@/components/blocks/finance/FinanceCurrencyControls.vue'
import FinanceOperationsBlock from '@/components/blocks/finance/FinanceOperationsBlock.vue'
import FinancePeriodSelect from '@/components/blocks/finance/FinancePeriodSelect.vue'
import FinanceSummary from '@/components/blocks/finance/FinanceSummary.vue'
import FinanceTagsBlock from '@/components/blocks/finance/FinanceTagsBlock.vue'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { workspaceColor } from '@/lib/workspaceAppearance'
import { useFinanceStore } from '@/stores'
import {
  ALL_TAGS,
  inRange,
  periodRange,
  summarize,
  UNTAGGED,
  type FinancePeriod,
} from '@/utils/finance'

const store = useFinanceStore()

const period = ref<FinancePeriod>('all')
const customFrom = ref('')
const customTo = ref('')
const tagFilter = ref(ALL_TAGS)

const range = computed(() =>
  periodRange(period.value, { from: customFrom.value, to: customTo.value }),
)

/** The tag breakdown follows the period only, so picking a tag never hides the others. */
const periodOperations = computed(() =>
  store.operations.filter((operation) => inRange(operation.date, range.value)),
)

/** Tags describe spending, so the tag filter narrows deposits and leaves every withdrawal in. */
const filteredOperations = computed(() =>
  tagFilter.value === ALL_TAGS
    ? periodOperations.value
    : periodOperations.value.filter(
        (operation) =>
          operation.kind === 'withdrawal' || store.tagKey(operation) === tagFilter.value,
      ),
)

const summary = computed(() => summarize(filteredOperations.value, store.toDisplay))

const isFiltered = computed(() => period.value !== 'all' || tagFilter.value !== ALL_TAGS)

function resetFilters() {
  period.value = 'all'
  tagFilter.value = ALL_TAGS
}
</script>

<template>
  <div class="flex min-w-0 flex-col gap-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-xl font-semibold tracking-tight">Финансы</h1>
        <p class="text-muted-foreground text-sm">
          Вложения и выводы. Итоги считаются в выбранной валюте по заданному курсу.
        </p>
      </div>
      <FinanceCurrencyControls />
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <FinancePeriodSelect
        v-model:period="period"
        v-model:from="customFrom"
        v-model:to="customTo"
      />

      <Select v-if="store.tags.length" v-model="tagFilter">
        <SelectTrigger size="sm" class="w-44" aria-label="Фильтр трат по тегу">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem :value="ALL_TAGS">Все траты</SelectItem>
          <SelectItem v-for="tag in store.tags" :key="tag.id" :value="tag.id">
            <span :class="cn('size-2 shrink-0 rounded-full', workspaceColor(tag.color))" />
            {{ tag.name }}
          </SelectItem>
          <SelectItem :value="UNTAGGED">Траты без тега</SelectItem>
        </SelectContent>
      </Select>

      <Button v-if="isFiltered" type="button" variant="ghost" size="sm" @click="resetFilters">
        <XIcon />
        Сбросить
      </Button>
    </div>

    <FinanceSummary :summary="summary" :currency="store.displayCurrency" />

    <!-- items-start: the two blocks keep their own heights instead of stretching to match. -->
    <div class="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-5">
      <FinanceOperationsBlock class="xl:col-span-3" :operations="filteredOperations" />
      <FinanceTagsBlock
        class="xl:col-span-2"
        :operations="periodOperations"
        :selected="tagFilter"
        @select="tagFilter = $event"
      />
    </div>
  </div>
</template>
