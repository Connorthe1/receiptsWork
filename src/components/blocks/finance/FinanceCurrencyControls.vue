<script setup lang="ts">
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFinanceStore } from '@/stores'
import type { Currency } from '@/types'
import { currencySymbols, parseAmount } from '@/utils/finance'

const store = useFinanceStore()

const rateDraft = ref('')

watch(
  () => store.usdRate,
  (rate) => {
    rateDraft.value = String(rate)
  },
  { immediate: true },
)

/** `change` fires on Enter and on blur, so the rate is saved once per edit. */
async function commitRate() {
  const rate = parseAmount(rateDraft.value)

  if (rate === null) {
    toast.error('Курс должен быть числом больше нуля')
    rateDraft.value = String(store.usdRate)
    return
  }

  if (rate === store.usdRate) return

  await store.setUsdRate(rate)
  toast.success('Курс обновлён')
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <Tabs
      :model-value="store.displayCurrency"
      @update:model-value="store.displayCurrency = $event as Currency"
    >
      <TabsList class="group-data-horizontal/tabs:h-8" aria-label="Валюта итогов">
        <TabsTrigger
          v-for="(symbol, currency) in currencySymbols"
          :key="currency"
          :value="currency"
          class="px-3"
        >
          {{ symbol }}
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <label class="text-muted-foreground flex items-center gap-1.5 text-xs">
      1 $ =
      <Input
        v-model="rateDraft"
        inputmode="decimal"
        autocomplete="off"
        class="h-8 w-20 text-right tabular-nums"
        aria-label="Курс доллара в рублях"
        @change="commitRate"
      />
      ₽
    </label>
  </div>
</template>
