<script setup lang="ts">
import { ArrowDownLeftIcon, ArrowUpRightIcon } from '@lucide/vue'
import { computed, reactive, watch } from 'vue'
import { toast } from 'vue-sonner'
import FormDialog from '@/components/shared/FormDialog.vue'
import FormField from '@/components/shared/FormField.vue'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { workspaceColor } from '@/lib/workspaceAppearance'
import { useFinanceStore } from '@/stores'
import type { Currency, FinanceKind, FinanceOperation, FinanceOperationDraft } from '@/types'
import {
  convert,
  currencySymbols,
  formatMoney,
  parseAmount,
  todayIso,
  UNTAGGED,
} from '@/utils/finance'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  operation?: FinanceOperation | null
  /** Which tab a new operation opens on. */
  kind?: FinanceKind
}>()
const emit = defineEmits<{ save: [draft: FinanceOperationDraft] }>()

const store = useFinanceStore()

/** The amount stays a string while typing, so «1 000,50» is not mangled halfway through. */
const form = reactive({
  kind: 'deposit' as FinanceKind,
  amount: '',
  currency: 'RUB' as Currency,
  date: '',
  tagId: UNTAGGED,
  notes: '',
})

/** New operations default to the currency of the one entered last: people stick to one. */
function lastUsedCurrency(): Currency {
  const latest = store.operations.reduce<FinanceOperation | null>(
    (newest, operation) => (!newest || operation.createdAt > newest.createdAt ? operation : newest),
    null,
  )

  return latest?.currency ?? store.displayCurrency
}

watch(open, (isOpen) => {
  if (!isOpen) return

  const operation = props.operation

  Object.assign(form, {
    kind: operation?.kind ?? props.kind ?? 'deposit',
    amount: operation ? String(operation.amount) : '',
    currency: operation?.currency ?? lastUsedCurrency(),
    date: operation?.date ?? todayIso(),
    tagId: operation ? store.tagKey(operation) : UNTAGGED,
    notes: operation?.notes ?? '',
  })
})

const amountHint = computed(() => {
  const amount = parseAmount(form.amount)
  const rate = `1 $ = ${store.usdRate} ₽`
  if (amount === null) return `Курс: ${rate}`

  const other: Currency = form.currency === 'RUB' ? 'USD' : 'RUB'
  return `≈ ${formatMoney(convert(amount, form.currency, other, store.usdRate), other)} по курсу ${rate}`
})

function handleSubmit() {
  const amount = parseAmount(form.amount)

  if (amount === null) {
    toast.error('Укажите сумму больше нуля')
    return
  }

  if (!form.date) {
    toast.error('Укажите дату')
    return
  }

  emit('save', {
    kind: form.kind,
    amount,
    currency: form.currency,
    date: form.date,
    tagId: form.tagId === UNTAGGED ? null : form.tagId,
    notes: form.notes.trim(),
  })
  open.value = false
}
</script>

<template>
  <FormDialog
    v-model:open="open"
    :title="operation ? 'Редактировать операцию' : 'Новая операция'"
    description="Вложение — деньги, которые ушли в работу. Вывод — то, что вернулось."
    @submit="handleSubmit"
  >
    <Tabs :model-value="form.kind" @update:model-value="form.kind = $event as FinanceKind">
      <TabsList class="w-full">
        <TabsTrigger value="deposit">
          <ArrowUpRightIcon />
          Вложение
        </TabsTrigger>
        <TabsTrigger value="withdrawal">
          <ArrowDownLeftIcon />
          Вывод
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <FormField v-slot="{ id }" label="Сумма" :hint="amountHint">
      <div class="flex gap-2">
        <Input
          :id="id"
          v-model="form.amount"
          inputmode="decimal"
          autocomplete="off"
          placeholder="1000"
          class="tabular-nums"
        />
        <Tabs :model-value="form.currency" @update:model-value="form.currency = $event as Currency">
          <TabsList aria-label="Валюта">
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
      </div>
    </FormField>

    <div class="grid gap-4 sm:grid-cols-2">
      <FormField v-slot="{ id }" label="Дата">
        <Input :id="id" v-model="form.date" type="date" />
      </FormField>

      <FormField label="Тег">
        <Select v-model="form.tagId">
          <SelectTrigger class="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="UNTAGGED">Без тега</SelectItem>
            <SelectItem v-for="tag in store.tags" :key="tag.id" :value="tag.id">
              <span :class="cn('size-2 shrink-0 rounded-full', workspaceColor(tag.color))" />
              {{ tag.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </FormField>
    </div>

    <FormField v-slot="{ id }" label="Комментарий">
      <Textarea :id="id" v-model="form.notes" rows="2" placeholder="Что за вложение или вывод" />
    </FormField>
  </FormDialog>
</template>
