<script setup lang="ts">
import { EyeIcon, ListChecksIcon, PlusIcon, UploadIcon } from '@lucide/vue'
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
import OutcomeImportDialog from './OutcomeImportDialog.vue'
import OutcomePreviewDialog from './OutcomePreviewDialog.vue'
import OutcomeRow from './OutcomeRow.vue'

const props = withDefaults(defineProps<{ workspaceId?: WorkspaceScope; class?: string }>(), {
  workspaceId: null,
})

const store = useOutcomeStore()

const newText = ref('')
const newTag = ref('')
const search = ref('')
const importOpen = ref(false)
const previewOpen = ref(false)

const {
  target: pendingRemoval,
  isOpen: removalOpen,
  request: requestRemoval,
  confirm: confirmRemoval,
} = useDeletionTarget<OutcomeItem>()

/**
 * Newest on top: the last code you received is the one you need right now.
 * Switched-off records keep that order among themselves but sink below the active ones.
 */
const outcomes = computed(() => {
  const newestFirst = [...store.forScope(props.workspaceId)].reverse()

  return [
    ...newestFirst.filter((item) => !item.isDisabled),
    ...newestFirst.filter((item) => item.isDisabled),
  ]
})

const activeCount = computed(() => outcomes.value.filter((item) => !item.isDisabled).length)

const visibleOutcomes = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return outcomes.value

  return outcomes.value.filter(
    (item) =>
      item.text.toLowerCase().includes(query) || (item.tag ?? '').toLowerCase().includes(query),
  )
})

async function add() {
  const text = newText.value.trim()
  if (!text) return

  await store.create({
    text,
    tag: newTag.value.trim(),
    isDisabled: false,
    workspaceId: props.workspaceId,
  })
  newText.value = ''
  newTag.value = ''
}

/**
 * A pasted list goes in untagged. It is created in reverse so the first line ends up newest,
 * and the list then reads top to bottom in the order it was pasted.
 */
async function addMany(texts: string[]) {
  await store.createMany(
    [...texts].reverse().map((text) => ({
      text,
      tag: '',
      isDisabled: false,
      workspaceId: props.workspaceId,
    })),
  )
  toast.success(`Добавлено записей: ${texts.length}`)
}

async function saveOutcome(item: OutcomeItem, patch: { text: string; tag: string }) {
  if (patch.text === item.text && patch.tag === (item.tag ?? '')) return

  await store.update(item.id, patch)
  toast.success('Запись обновлена')
}

async function setDisabled(item: OutcomeItem, isDisabled: boolean) {
  if (isDisabled === (item.isDisabled ?? false)) return

  await store.update(item.id, { isDisabled })
}

async function removeOutcome(item: OutcomeItem) {
  await store.remove(item.id)
  toast.success('Запись удалена')
}
</script>

<template>
  <DashboardCard
    title="Исход"
    :icon="ListChecksIcon"
    :count="outcomes.length"
    :active-count="activeCount"
    :class="props.class"
  >
    <template #actions>
      <SearchInput v-model="search" class="max-w-40 min-w-24 flex-1" />
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Превью записей построчно"
        title="Превью"
        :disabled="visibleOutcomes.length === 0"
        @click="previewOpen = true"
      >
        <EyeIcon class="size-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Добавить коды списком"
        title="Добавить списком"
        @click="importOpen = true"
      >
        <UploadIcon class="size-4" />
      </Button>
    </template>

    <div class="flex items-center gap-2 border-b px-5 py-3">
      <Input
        v-model="newText"
        class="h-8 min-w-0 flex-1 font-mono"
        placeholder="Код, номер заказа, любой результат…"
        @keydown.enter.prevent="add"
      />
      <Input
        v-model="newTag"
        class="h-8 w-24 shrink-0"
        placeholder="Тег"
        aria-label="Тег"
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
      action-label="Добавить списком"
      @action="importOpen = true"
    />
    <EmptyState v-else-if="visibleOutcomes.length === 0" title="Ничего не найдено" />

    <div v-else class="max-h-[26rem] divide-y overflow-y-auto overscroll-contain">
      <OutcomeRow
        v-for="item in visibleOutcomes"
        :key="item.id"
        :item="item"
        @save="saveOutcome(item, $event)"
        @toggle="setDisabled(item, $event)"
        @remove="requestRemoval(item)"
      />
    </div>
  </DashboardCard>

  <OutcomeImportDialog
    v-model:open="importOpen"
    :existing="outcomes.map((item) => item.text)"
    @import="addMany"
  />

  <!-- Follows the search, so a tag typed there narrows the preview too. -->
  <OutcomePreviewDialog
    v-model:open="previewOpen"
    :texts="visibleOutcomes.map((item) => item.text)"
  />

  <ConfirmDialog
    v-model:open="removalOpen"
    title="Удалить запись?"
    :description="pendingRemoval?.text ?? ''"
    @confirm="confirmRemoval(removeOutcome)"
  />
</template>
