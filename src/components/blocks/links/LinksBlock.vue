<script setup lang="ts">
import { CopyPlusIcon, LinkIcon } from '@lucide/vue'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import AddButton from '@/components/shared/AddButton.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import DashboardCard from '@/components/shared/DashboardCard.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import SearchInput from '@/components/shared/SearchInput.vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDeletionTarget } from '@/composables/useDeletionTarget'
import { useLinkStore } from '@/stores'
import type { LinkDraft, LinkItem, WorkspaceScope } from '@/types'
import { stripEntityMeta } from '@/utils/entity'
import { hostname } from '@/utils/format'
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

/** Inside a workspace the Home list doubles as a library to copy from. */
const homeLinks = computed(() => (props.workspaceId ? store.forScope(null) : []))

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

async function copyFromHome(link: LinkItem) {
  await store.create({ ...stripEntityMeta(link), workspaceId: props.workspaceId })
  toast.success(`«${link.title}» скопирована в раздел`)
}

async function removeLink(link: LinkItem) {
  await store.remove(link.id)
  toast.success('Ссылка удалена')
}
</script>

<template>
  <DashboardCard title="Ссылки" :icon="LinkIcon" :count="links.length" :class="props.class">
    <template #actions>
      <SearchInput v-model="search" class="max-w-40 min-w-24 flex-1" />

      <DropdownMenu v-if="workspaceId">
        <DropdownMenuTrigger as-child>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Взять ссылку с главной"
            title="Взять ссылку с главной"
          >
            <CopyPlusIcon class="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-72">
          <DropdownMenuLabel class="text-muted-foreground text-xs">
            Ссылки с главной
          </DropdownMenuLabel>
          <DropdownMenuItem v-if="homeLinks.length === 0" disabled>
            На главной пока нет ссылок
          </DropdownMenuItem>
          <DropdownMenuItem
            v-for="link in homeLinks"
            :key="link.id"
            @select="copyFromHome(link)"
          >
            <LinkIcon class="size-4" />
            <span class="min-w-0 flex-1 truncate">{{ link.title }}</span>
            <span class="text-muted-foreground truncate text-xs">
              {{ hostname(link.url) }}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddButton label="Добавить ссылку" @click="openCreate" />
    </template>

    <EmptyState
      v-if="links.length === 0"
      title="Пока нет ссылок"
      :description="
        workspaceId
          ? 'Админки, таблицы и панели этого раздела в одном месте.'
          : 'Общие ссылки — их можно копировать в любой раздел.'
      "
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
