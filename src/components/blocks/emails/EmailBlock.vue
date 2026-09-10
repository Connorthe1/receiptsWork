<script setup lang="ts">
import { MailIcon, Trash2Icon, UploadIcon } from '@lucide/vue'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import DashboardCard from '@/components/shared/DashboardCard.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import SearchInput from '@/components/shared/SearchInput.vue'
import StatusFilterSelect from '@/components/shared/StatusFilterSelect.vue'
import { Button } from '@/components/ui/button'
import { useDeletionTarget } from '@/composables/useDeletionTarget'
import { useEmailStore, useWorkspaceStore } from '@/stores'
import type { EmailAccount, EmailDraft, EmailStatus, StatusFilter } from '@/types'
import EmailFormDialog from './EmailFormDialog.vue'
import EmailImportDialog from './EmailImportDialog.vue'
import EmailRow from './EmailRow.vue'

const props = withDefaults(
  defineProps<{
    /** `null` on the Home page: statuses are then read from and written to `globalStatus`. */
    workspaceId?: string | null
    class?: string
  }>(),
  { workspaceId: null },
)

const emailStore = useEmailStore()
const workspaceStore = useWorkspaceStore()

const search = ref('')
const statusFilter = ref<StatusFilter>('all')

const formOpen = ref(false)
const importOpen = ref(false)
const clearAllOpen = ref(false)
const editing = ref<EmailAccount | null>(null)

const existingEmails = computed(() => emailStore.emails.map((email) => email.email))

const {
  target: pendingRemoval,
  isOpen: removalOpen,
  request: requestRemoval,
  confirm: confirmRemoval,
} = useDeletionTarget<EmailAccount>()

/** The status is a per-section notion, so the Home page neither shows nor filters by it. */
function statusOf(email: EmailAccount): EmailStatus | null {
  return props.workspaceId ? workspaceStore.emailStatus(props.workspaceId, email) : null
}

/** On Home there is no per-section status, so fall back to the account's global flag. */
function effectiveStatus(email: EmailAccount): EmailStatus {
  return statusOf(email) ?? email.globalStatus
}

const visibleEmails = computed(() => {
  const query = search.value.trim().toLowerCase()

  return emailStore.emails
    .filter((email) => {
      const matchesQuery =
        !query ||
        email.email.toLowerCase().includes(query) ||
        email.label.toLowerCase().includes(query) ||
        email.notes.toLowerCase().includes(query)

      const matchesStatus =
        statusFilter.value === 'all' || effectiveStatus(email) === statusFilter.value

      return matchesQuery && matchesStatus
    })
    .sort((a, b) => {
      const aInactive = effectiveStatus(a) === 'inactive'
      const bInactive = effectiveStatus(b) === 'inactive'

      if (aInactive !== bInactive) return Number(aInactive) - Number(bInactive)

      return a.index - b.index
    })
})

function openEdit(email: EmailAccount) {
  editing.value = email
  formOpen.value = true
}

async function handleSave(draft: EmailDraft) {
  if (!editing.value) return

  await emailStore.update(editing.value.id, draft)
  toast.success('Аккаунт обновлён')
}

async function handleImport(drafts: EmailDraft[]) {
  await emailStore.createMany(drafts)
  toast.success(`Импортировано аккаунтов: ${drafts.length}`)
}

async function handleStatusChange(email: EmailAccount, status: EmailStatus) {
  if (!props.workspaceId) return

  await workspaceStore.setEmailStatus(props.workspaceId, email.id, status)
}

async function removeEmail(email: EmailAccount) {
  await emailStore.remove(email.id)
  toast.success('Аккаунт удалён')
}

async function removeAllEmails() {
  const count = emailStore.emails.length
  if (count === 0) return

  await emailStore.removeAll()
  clearAllOpen.value = false
  toast.success(`Удалено аккаунтов: ${count}`)
}
</script>

<template>
  <DashboardCard
    title="Почты"
    :icon="MailIcon"
    :count="emailStore.emails.length"
    :class="props.class"
  >
    <template #actions>
      <SearchInput v-model="search" class="max-w-40 min-w-24 flex-1" />
      <StatusFilterSelect v-if="workspaceId" v-model="statusFilter" />
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Импорт почт списком"
        title="Импорт списком"
        @click="importOpen = true"
      >
        <UploadIcon class="size-4" />
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="icon-sm"
        aria-label="Удалить все почты"
        title="Удалить все"
        :disabled="emailStore.emails.length === 0"
        @click="clearAllOpen = true"
      >
        <Trash2Icon class="size-4" />
      </Button>
    </template>

    <p v-if="workspaceId" class="text-muted-foreground border-b px-5 py-2.5 text-xs">
      Список общий для всех разделов, статус ниже действует только здесь.
    </p>

    <EmptyState
      v-if="emailStore.emails.length === 0"
      title="Пока нет ни одного аккаунта"
      description="Импортируйте список email, чтобы держать логины и пароли под рукой."
      action-label="Импорт списком"
      @action="importOpen = true"
    />
    <EmptyState v-else-if="visibleEmails.length === 0" title="Ничего не найдено" />

    <!-- The list is capped in height so a long inbox scrolls instead of pushing the page down. -->
    <div v-else class="max-h-[26rem] divide-y overflow-y-auto overscroll-contain">
      <EmailRow
        v-for="email in visibleEmails"
        :key="email.id"
        :email="email"
        :status="statusOf(email)"
        @update:status="handleStatusChange(email, $event)"
        @edit="openEdit(email)"
        @remove="requestRemoval(email)"
      />
    </div>
  </DashboardCard>

  <EmailFormDialog v-model:open="formOpen" :email="editing" @save="handleSave" />

  <EmailImportDialog v-model:open="importOpen" :existing="existingEmails" @import="handleImport" />

  <ConfirmDialog
    v-model:open="removalOpen"
    title="Удалить аккаунт?"
    :description="`${pendingRemoval?.email ?? ''} будет удалён из всех разделов.`"
    @confirm="confirmRemoval(removeEmail)"
  />

  <ConfirmDialog
    v-model:open="clearAllOpen"
    title="Удалить все аккаунты?"
    :description="`Будут удалены все ${emailStore.emails.length} аккаунтов из всех разделов. Действие нельзя отменить.`"
    confirm-label="Удалить все"
    @confirm="removeAllEmails"
  />
</template>
