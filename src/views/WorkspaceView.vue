<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import AddressBlock from '@/components/blocks/addresses/AddressBlock.vue'
import PaymentCardsBlock from '@/components/blocks/cards/PaymentCardsBlock.vue'
import EmailBlock from '@/components/blocks/emails/EmailBlock.vue'
import ImportantInfoBlock from '@/components/blocks/important/ImportantInfoBlock.vue'
import LinksBlock from '@/components/blocks/links/LinksBlock.vue'
import OutcomeBlock from '@/components/blocks/outcomes/OutcomeBlock.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import WorkspaceFormDialog from '@/components/workspace/WorkspaceFormDialog.vue'
import WorkspaceHeader from '@/components/workspace/WorkspaceHeader.vue'
import { useDashboardData, useWorkspaceStore } from '@/stores'
import type { WorkspaceDraft } from '@/types'

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()
const { deleteWorkspace } = useDashboardData()

const workspaceId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))
const workspace = computed(() => workspaceStore.byId(workspaceId.value))

const editOpen = ref(false)
const removalOpen = ref(false)

async function handleEdit(draft: WorkspaceDraft) {
  await workspaceStore.update(workspaceId.value, draft)
  toast.success('Раздел обновлён')
}

async function confirmRemoval() {
  await deleteWorkspace(workspaceId.value)
  removalOpen.value = false
  toast.success('Раздел удалён')
  await router.push({ name: 'home' })
}
</script>

<template>
  <div v-if="!workspace" class="text-muted-foreground py-16 text-center text-sm">
    <p v-if="workspaceStore.isLoaded">Раздел не найден.</p>
    <p v-else>Загрузка…</p>
  </div>

  <div v-else class="flex min-w-0 flex-col gap-6">
    <WorkspaceHeader :workspace="workspace" @edit="editOpen = true" @remove="removalOpen = true" />

    <!-- Two independent columns instead of a grid: blocks stack tightly and leave no ragged gaps. -->
    <div class="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-5">
      <div class="flex min-w-0 flex-col gap-5 xl:col-span-3">
        <EmailBlock :workspace-id="workspaceId" />
        <AddressBlock :workspace-id="workspaceId" />
        <OutcomeBlock :workspace-id="workspaceId" />
      </div>

      <div class="flex min-w-0 flex-col gap-5 xl:col-span-2">
        <ImportantInfoBlock :workspace-id="workspaceId" />
        <LinksBlock :workspace-id="workspaceId" />
        <PaymentCardsBlock :workspace-id="workspaceId" />
      </div>
    </div>

    <WorkspaceFormDialog v-model:open="editOpen" :workspace="workspace" @save="handleEdit" />

    <ConfirmDialog
      v-model:open="removalOpen"
      title="Удалить раздел?"
      :description="`«${workspace.name}» вместе с его адресами, картами и ссылками будет удалён. Общие списки почт и важной информации не пострадают.`"
      @confirm="confirmRemoval"
    />
  </div>
</template>
