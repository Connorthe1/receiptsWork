<script setup lang="ts">
import { TagsIcon } from '@lucide/vue'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import AddButton from '@/components/shared/AddButton.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import DashboardCard from '@/components/shared/DashboardCard.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import RowActions from '@/components/shared/RowActions.vue'
import { useDeletionTarget } from '@/composables/useDeletionTarget'
import { cn } from '@/lib/utils'
import { workspaceColor } from '@/lib/workspaceAppearance'
import { useFinanceStore } from '@/stores'
import type { FinanceOperation, FinanceTag, FinanceTagDraft } from '@/types'
import { ALL_TAGS, formatMoney, UNTAGGED } from '@/utils/finance'
import FinanceTagFormDialog from './FinanceTagFormDialog.vue'

const props = defineProps<{
  /** Narrowed to the selected period only: the tag filter must not hide the other tags. */
  operations: FinanceOperation[]
  /** The current tag filter: a tag id, `ALL_TAGS` or `UNTAGGED`. */
  selected: string
  class?: string
}>()

const emit = defineEmits<{ select: [value: string] }>()

const store = useFinanceStore()

const formOpen = ref(false)
const editing = ref<FinanceTag | null>(null)

const {
  target: pendingRemoval,
  isOpen: removalOpen,
  request: requestRemoval,
  confirm: confirmRemoval,
} = useDeletionTarget<FinanceTag>()

interface TagTotals {
  spent: number
  withdrawn: number
  count: number
}

const totals = computed(() => {
  const byTag = new Map<string, TagTotals>()

  for (const operation of props.operations) {
    const key = store.tagKey(operation)
    const entry = byTag.get(key) ?? { spent: 0, withdrawn: 0, count: 0 }
    const amount = store.toDisplay(operation)

    if (operation.kind === 'deposit') {
      entry.spent += amount
    } else {
      entry.withdrawn += amount
    }

    entry.count++
    byTag.set(key, entry)
  }

  return byTag
})

const totalSpent = computed(() =>
  [...totals.value.values()].reduce((sum, entry) => sum + entry.spent, 0),
)

/** Biggest spending first; a stable sort keeps tags with equal sums in creation order. */
const cards = computed(() =>
  store.tags
    .map((tag) => ({ tag, ...(totals.value.get(tag.id) ?? { spent: 0, withdrawn: 0, count: 0 }) }))
    .sort((a, b) => b.spent - a.spent),
)

const untaggedSpent = computed(() => totals.value.get(UNTAGGED)?.spent ?? 0)

function sharePercent(spent: number): number {
  return totalSpent.value > 0 ? Math.round((spent / totalSpent.value) * 100) : 0
}

function money(amount: number): string {
  return formatMoney(amount, store.displayCurrency)
}

/** Clicking the selected card again drops the filter. */
function toggle(value: string) {
  emit('select', props.selected === value ? ALL_TAGS : value)
}

function openCreate() {
  editing.value = null
  formOpen.value = true
}

function openEdit(tag: FinanceTag) {
  editing.value = tag
  formOpen.value = true
}

async function handleSave(draft: FinanceTagDraft) {
  if (editing.value) {
    await store.updateTag(editing.value.id, draft)
    toast.success('Тег обновлён')
  } else {
    await store.createTag(draft)
    toast.success('Тег добавлен')
  }
}

async function removeTag(tag: FinanceTag) {
  await store.removeTag(tag.id)
  if (props.selected === tag.id) emit('select', ALL_TAGS)
  toast.success('Тег удалён')
}
</script>

<template>
  <DashboardCard
    title="Траты по тегам"
    :icon="TagsIcon"
    :count="store.tags.length"
    :class="props.class"
  >
    <template #actions>
      <AddButton label="Новый тег" @click="openCreate" />
    </template>

    <EmptyState
      v-if="store.tags.length === 0"
      title="Пока нет тегов"
      description="Например, «Закупка» или «Эксперименты». Выбирайте тег при записи вложения — здесь будет видно, сколько ушло на каждый."
      action-label="Добавить тег"
      @action="openCreate"
    />

    <div v-else class="grid gap-3 p-4 @sm:grid-cols-2">
      <div
        v-for="card in cards"
        :key="card.tag.id"
        :class="
          cn(
            'hover:bg-muted/40 flex min-w-0 items-start gap-1 rounded-lg p-3 ring-1 transition-colors',
            selected === card.tag.id ? 'bg-muted/40 ring-primary' : 'ring-foreground/10',
          )
        "
      >
        <button
          type="button"
          class="min-w-0 flex-1 text-left"
          :aria-pressed="selected === card.tag.id"
          :title="selected === card.tag.id ? 'Снять фильтр' : 'Показать траты только по этому тегу'"
          @click="toggle(card.tag.id)"
        >
          <span class="flex min-w-0 items-center gap-2">
            <span :class="cn('size-2 shrink-0 rounded-full', workspaceColor(card.tag.color))" />
            <span class="truncate text-sm font-medium">{{ card.tag.name }}</span>
          </span>
          <span class="mt-1.5 flex items-baseline justify-between gap-2">
            <span class="truncate text-lg font-semibold tracking-tight tabular-nums">
              {{ money(card.spent) }}
            </span>
            <span class="text-muted-foreground shrink-0 text-xs tabular-nums" title="Доля трат">
              {{ sharePercent(card.spent) }}%
            </span>
          </span>
          <span class="bg-muted mt-2 block h-1.5 overflow-hidden rounded-full">
            <span
              :class="cn('block h-full rounded-full', workspaceColor(card.tag.color))"
              :style="{ width: `${sharePercent(card.spent)}%` }"
            />
          </span>
          <span class="text-muted-foreground mt-1.5 block truncate text-xs">
            <template v-if="card.count === 0">Нет операций</template>
            <template v-else>
              Операций: {{ card.count }}
              <template v-if="card.withdrawn > 0"> · выведено {{ money(card.withdrawn) }}</template>
            </template>
          </span>
        </button>
        <RowActions
          :label="card.tag.name"
          @edit="openEdit(card.tag)"
          @remove="requestRemoval(card.tag)"
        />
      </div>

      <button
        v-if="untaggedSpent > 0"
        type="button"
        :aria-pressed="selected === UNTAGGED"
        :title="selected === UNTAGGED ? 'Снять фильтр' : 'Показать только траты без тега'"
        :class="
          cn(
            'hover:bg-muted/40 min-w-0 rounded-lg border border-dashed p-3 text-left transition-colors',
            selected === UNTAGGED && 'bg-muted/40 border-primary',
          )
        "
        @click="toggle(UNTAGGED)"
      >
        <span class="text-muted-foreground block truncate text-sm font-medium">Без тега</span>
        <span class="mt-1.5 flex items-baseline justify-between gap-2">
          <span class="truncate text-lg font-semibold tracking-tight tabular-nums">
            {{ money(untaggedSpent) }}
          </span>
          <span class="text-muted-foreground shrink-0 text-xs tabular-nums" title="Доля трат">
            {{ sharePercent(untaggedSpent) }}%
          </span>
        </span>
        <span class="bg-muted mt-2 block h-1.5 overflow-hidden rounded-full">
          <span
            class="bg-muted-foreground/40 block h-full rounded-full"
            :style="{ width: `${sharePercent(untaggedSpent)}%` }"
          />
        </span>
        <span class="text-muted-foreground mt-1.5 block truncate text-xs">Траты без тега</span>
      </button>
    </div>
  </DashboardCard>

  <FinanceTagFormDialog v-model:open="formOpen" :tag="editing" @save="handleSave" />

  <ConfirmDialog
    v-model:open="removalOpen"
    title="Удалить тег?"
    :description="`«${pendingRemoval?.name ?? ''}» пропадёт из списка, а операции с ним останутся без тега.`"
    @confirm="confirmRemoval(removeTag)"
  />
</template>
