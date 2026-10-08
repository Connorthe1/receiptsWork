<script setup lang="ts">
import { ArrowDownLeftIcon, ArrowLeftRightIcon, ArrowUpRightIcon } from '@lucide/vue'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import DashboardCard from '@/components/shared/DashboardCard.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import SearchInput from '@/components/shared/SearchInput.vue'
import { Button } from '@/components/ui/button'
import { useDeletionTarget } from '@/composables/useDeletionTarget'
import { useFinanceStore } from '@/stores'
import type { FinanceKind, FinanceOperation, FinanceOperationDraft } from '@/types'
import { formatIsoDate, formatMoney } from '@/utils/finance'
import FinanceOperationFormDialog from './FinanceOperationFormDialog.vue'
import FinanceOperationRow from './FinanceOperationRow.vue'

const props = defineProps<{
  /** Already narrowed to the selected period, and deposits to the selected tag. */
  operations: FinanceOperation[]
  class?: string
}>()

const store = useFinanceStore()

const search = ref('')
const formOpen = ref(false)
const editing = ref<FinanceOperation | null>(null)
const newKind = ref<FinanceKind>('deposit')

const {
  target: pendingRemoval,
  isOpen: removalOpen,
  request: requestRemoval,
  confirm: confirmRemoval,
} = useDeletionTarget<FinanceOperation>()

const visibleOperations = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return props.operations

  return props.operations.filter((operation) =>
    [operation.notes, store.tagById(operation.tagId)?.name ?? '', String(operation.amount)]
      .join(' ')
      .toLowerCase()
      .includes(query),
  )
})

const removalDescription = computed(() => {
  const operation = pendingRemoval.value
  if (!operation) return ''

  const sign = operation.kind === 'deposit' ? -1 : 1
  const amount = formatMoney(sign * operation.amount, operation.currency, true)

  return `Операция «${amount}» от ${formatIsoDate(operation.date)} будет удалена.`
})

function openCreate(kind: FinanceKind) {
  editing.value = null
  newKind.value = kind
  formOpen.value = true
}

function openEdit(operation: FinanceOperation) {
  editing.value = operation
  formOpen.value = true
}

async function handleSave(draft: FinanceOperationDraft) {
  if (editing.value) {
    await store.updateOperation(editing.value.id, draft)
    toast.success('Операция обновлена')
  } else {
    await store.createOperation(draft)
    toast.success(draft.kind === 'deposit' ? 'Вложение записано' : 'Вывод записан')
  }
}

async function removeOperation(operation: FinanceOperation) {
  await store.removeOperation(operation.id)
  toast.success('Операция удалена')
}
</script>

<template>
  <DashboardCard
    title="Операции"
    :icon="ArrowLeftRightIcon"
    :count="operations.length"
    :class="props.class"
  >
    <template #actions>
      <SearchInput v-model="search" class="max-w-40 min-w-24 flex-1" />
      <Button type="button" variant="outline" size="sm" @click="openCreate('deposit')">
        <ArrowUpRightIcon />
        Вложение
      </Button>
      <Button type="button" variant="outline" size="sm" @click="openCreate('withdrawal')">
        <ArrowDownLeftIcon />
        Вывод
      </Button>
    </template>

    <EmptyState
      v-if="store.operations.length === 0"
      title="Пока нет операций"
      description="Запишите первое вложение, а когда выведете деньги — вывод. Профит посчитается сам."
      action-label="Добавить вложение"
      @action="openCreate('deposit')"
    />
    <EmptyState
      v-else-if="operations.length === 0"
      title="Нет операций"
      description="За выбранный период и тег ничего не записано."
    />
    <EmptyState v-else-if="visibleOperations.length === 0" title="Ничего не найдено" />

    <div v-else class="divide-y">
      <FinanceOperationRow
        v-for="operation in visibleOperations"
        :key="operation.id"
        :operation="operation"
        @edit="openEdit(operation)"
        @remove="requestRemoval(operation)"
      />
    </div>
  </DashboardCard>

  <FinanceOperationFormDialog
    v-model:open="formOpen"
    :operation="editing"
    :kind="newKind"
    @save="handleSave"
  />

  <ConfirmDialog
    v-model:open="removalOpen"
    title="Удалить операцию?"
    :description="removalDescription"
    @confirm="confirmRemoval(removeOperation)"
  />
</template>
