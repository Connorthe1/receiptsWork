<script setup lang="ts">
import { KeyRoundIcon } from '@lucide/vue'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import AddButton from '@/components/shared/AddButton.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import DashboardCard from '@/components/shared/DashboardCard.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import SearchInput from '@/components/shared/SearchInput.vue'
import { useDeletionTarget } from '@/composables/useDeletionTarget'
import { useImportantInfoStore } from '@/stores'
import type { ImportantItem, ImportantItemDraft, WorkspaceScope } from '@/types'
import ImportantInfoFormDialog from './ImportantInfoFormDialog.vue'
import ImportantInfoRow from './ImportantInfoRow.vue'

const props = withDefaults(defineProps<{ workspaceId?: WorkspaceScope; class?: string }>(), {
  workspaceId: null,
})

const store = useImportantInfoStore()

const search = ref('')
const formOpen = ref(false)
const editing = ref<ImportantItem | null>(null)

const {
  target: pendingRemoval,
  isOpen: removalOpen,
  request: requestRemoval,
  confirm: confirmRemoval,
} = useDeletionTarget<ImportantItem>()

const visibleItems = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return store.items

  return store.items.filter(
    (item) => item.title.toLowerCase().includes(query) || item.notes.toLowerCase().includes(query),
  )
})

function openCreate() {
  editing.value = null
  formOpen.value = true
}

function openEdit(item: ImportantItem) {
  editing.value = item
  formOpen.value = true
}

async function handleSave(draft: ImportantItemDraft) {
  if (editing.value) {
    await store.update(editing.value.id, draft)
    toast.success('Запись обновлена')
  } else {
    await store.create(draft)
    toast.success('Запись добавлена')
  }
}

async function removeItem(item: ImportantItem) {
  await store.remove(item.id)
  toast.success('Запись удалена')
}
</script>

<template>
  <DashboardCard
    title="Важная информация"
    :icon="KeyRoundIcon"
    :count="store.items.length"
    :class="props.class"
  >
    <template #actions>
      <SearchInput v-model="search" class="max-w-40 min-w-24 flex-1" />
      <AddButton label="Добавить запись" @click="openCreate" />
    </template>

    <p v-if="workspaceId" class="text-muted-foreground border-b px-5 py-2.5 text-xs">
      Список общий для всех разделов: правки видны везде.
    </p>

    <EmptyState
      v-if="store.items.length === 0"
      title="Пока нет записей"
      description="Телефон, PIN, реферальный ID — всё, что нужно под рукой."
      action-label="Добавить запись"
      @action="openCreate"
    />
    <EmptyState v-else-if="visibleItems.length === 0" title="Ничего не найдено" />

    <div v-else class="divide-y">
      <ImportantInfoRow
        v-for="item in visibleItems"
        :key="item.id"
        :item="item"
        @edit="openEdit(item)"
        @remove="requestRemoval(item)"
      />
    </div>
  </DashboardCard>

  <ImportantInfoFormDialog v-model:open="formOpen" :item="editing" @save="handleSave" />

  <ConfirmDialog
    v-model:open="removalOpen"
    title="Удалить запись?"
    :description="`«${pendingRemoval?.title ?? ''}» будет удалена.`"
    @confirm="confirmRemoval(removeItem)"
  />
</template>
