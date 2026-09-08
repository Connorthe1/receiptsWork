<script setup lang="ts">
import { LinkIcon, PlusIcon } from '@lucide/vue'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import DashboardCard from '@/components/shared/DashboardCard.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import SearchInput from '@/components/shared/SearchInput.vue'
import { Button } from '@/components/ui/button'
import { useDeletionTarget } from '@/composables/useDeletionTarget'
import { useLinkStore } from '@/stores'
import type { LinkDraft, LinkItem, WorkspaceScope } from '@/types'
import LinkFormDialog from './LinkFormDialog.vue'
import LinkRow from './LinkRow.vue'

const props = withDefaults(defineProps<{ workspaceId?: WorkspaceScope; class?: string }>(), {
  workspaceId: null,
})

const store = useLinkStore()

const search = ref('')
const formOpen = ref(false)
const editing = ref<LinkItem | null>(null)

const {
  target: pendingRemoval,
  isOpen: removalOpen,
  request: requestRemoval,
  confirm: confirmRemoval,
} = useDeletionTarget<LinkItem>()

const links = computed(() => store.forScope(props.workspaceId))

const visibleLinks = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return links.value

  return links.value.filter((link) =>
    [link.title, link.url, link.category, link.notes].join(' ').toLowerCase().includes(query),
  )
})

function openCreate() {
  editing.value = null
  formOpen.value = true
}

function openEdit(link: LinkItem) {
  editing.value = link
  formOpen.value = true
}

async function handleSave(draft: LinkDraft) {
  if (editing.value) {
    await store.update(editing.value.id, draft)
    toast.success('Ссылка обновлена')
  } else {
    await store.create({ ...draft, workspaceId: props.workspaceId })
    toast.success('Ссылка добавлена')
  }
}

async function removeLink(link: LinkItem) {
  await store.remove(link.id)
  toast.success('Ссылка удалена')
}
</script>

<template>
  <DashboardCard title="Ссылки" :icon="LinkIcon" :count="links.length" :class="props.class">
    <template #actions>
      <SearchInput v-model="search" placeholder="Поиск по ссылкам…" class="hidden w-36 2xl:block" />
      <Button size="sm" variant="outline" @click="openCreate">
        <PlusIcon class="size-4" />
        Добавить
      </Button>
    </template>

    <EmptyState
      v-if="links.length === 0"
      title="Пока нет ссылок"
      description="Админки, таблицы и панели этого раздела в одном месте."
      action-label="Добавить ссылку"
      @action="openCreate"
    />
    <EmptyState v-else-if="visibleLinks.length === 0" title="Ничего не найдено" />

    <div v-else class="divide-y">
      <LinkRow
        v-for="link in visibleLinks"
        :key="link.id"
        :link="link"
        @edit="openEdit(link)"
        @remove="requestRemoval(link)"
      />
    </div>
  </DashboardCard>

  <LinkFormDialog v-model:open="formOpen" :link="editing" @save="handleSave" />

  <ConfirmDialog
    v-model:open="removalOpen"
    title="Удалить ссылку?"
    :description="`«${pendingRemoval?.title ?? ''}» будет удалена.`"
    @confirm="confirmRemoval(removeLink)"
  />
</template>
