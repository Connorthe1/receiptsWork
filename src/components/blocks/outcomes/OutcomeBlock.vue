<script setup lang="ts">
import { ListChecksIcon, PlusIcon } from '@lucide/vue'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import DashboardCard from '@/components/shared/DashboardCard.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import SearchInput from '@/components/shared/SearchInput.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDeletionTarget } from '@/composables/useDeletionTarget'
import { useOutcomeStore } from '@/stores'
import type { OutcomeItem, WorkspaceScope } from '@/types'
import OutcomeRow from './OutcomeRow.vue'

const props = withDefaults(defineProps<{ workspaceId?: WorkspaceScope; class?: string }>(), {
  workspaceId: null,
})

const store = useOutcomeStore()

const newText = ref('')
const search = ref('')

const {
  target: pendingRemoval,
  isOpen: removalOpen,
  request: requestRemoval,
  confirm: confirmRemoval,
} = useDeletionTarget<OutcomeItem>()

/** Newest on top: the last code you received is the one you need right now. */
const outcomes = computed(() => [...store.forScope(props.workspaceId)].reverse())

const visibleOutcomes = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return outcomes.value

  return outcomes.value.filter((item) => item.text.toLowerCase().includes(query))
})

async function add() {
  const text = newText.value.trim()
  if (!text) return

  await store.create({ text, workspaceId: props.workspaceId })
  newText.value = ''
}

async function updateText(item: OutcomeItem, text: string) {
  if (text === item.text) return

  await store.update(item.id, { text })
  toast.success('Запись обновлена')
}

async function removeOutcome(item: OutcomeItem) {
  await store.remove(item.id)
  toast.success('Запись удалена')
}
</script>

<template>
  <DashboardCard title="Исход" :icon="ListChecksIcon" :count="outcomes.length" :class="props.class">
    <template #actions>
      <SearchInput v-model="search" class="max-w-40 min-w-24 flex-1" />
    </template>

    <div class="flex items-center gap-2 border-b px-5 py-3">
      <Input
        v-model="newText"
        class="h-8 flex-1 font-mono"
        placeholder="Код, номер заказа, любой результат…"
        @keydown.enter.prevent="add"
      />
      <Button size="sm" variant="outline" :disabled="!newText.trim()" @click="add">
        <PlusIcon class="size-4" />
        Добавить
      </Button>
    </div>

    <EmptyState
      v-if="outcomes.length === 0"
      title="Пока пусто"
      description="Записывайте сюда коды из писем и другие результаты работы — поле выше добавляет запись по Enter."
    />
    <EmptyState v-else-if="visibleOutcomes.length === 0" title="Ничего не найдено" />

    <div v-else class="max-h-[26rem] divide-y overflow-y-auto overscroll-contain">
      <OutcomeRow
        v-for="item in visibleOutcomes"
        :key="item.id"
        :item="item"
        @save="updateText(item, $event)"
        @remove="requestRemoval(item)"
      />
    </div>
  </DashboardCard>

  <ConfirmDialog
    v-model:open="removalOpen"
    title="Удалить запись?"
    :description="pendingRemoval?.text ?? ''"
    @confirm="confirmRemoval(removeOutcome)"
  />
</template>
