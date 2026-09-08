<script setup lang="ts">
import { MailIcon, PlusIcon } from '@lucide/vue'
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
const editing = ref<EmailAccount | null>(null)

const {
  target: pendingRemoval,
  isOpen: removalOpen,
  request: requestRemoval,
  confirm: confirmRemoval,
} = useDeletionTarget<EmailAccount>()

function statusOf(email: EmailAccount): EmailStatus {
  return props.workspaceId
    ? workspaceStore.emailStatus(props.workspaceId, email)
    : email.globalStatus
}

const visibleEmails = computed(() => {
  const query = search.value.trim().toLowerCase()

  return emailStore.emails.filter((email) => {
    const matchesQuery =
      !query ||
      email.email.toLowerCase().includes(query) ||
      email.label.toLowerCase().includes(query) ||
      email.notes.toLowerCase().includes(query)

    const matchesStatus = statusFilter.value === 'all' || statusOf(email) === statusFilter.value

    return matchesQuery && matchesStatus
  })
})

function openCreate() {
  editing.value = null
  formOpen.value = true
}

function openEdit(email: EmailAccount) {
  editing.value = email
  formOpen.value = true
}

async function handleSave(draft: EmailDraft) {
  if (editing.value) {
    await emailStore.update(editing.value.id, draft)
    toast.success('Аккаунт обновлён')
  } else {
    await emailStore.create(draft)
    toast.success('Аккаунт добавлен')
  }
}

async function handleStatusChange(email: EmailAccount, status: EmailStatus) {
  if (props.workspaceId) {
    await workspaceStore.setEmailStatus(props.workspaceId, email.id, status)
  } else {
    await emailStore.update(email.id, { globalStatus: status })
  }
}

async function removeEmail(email: EmailAccount) {
  await emailStore.remove(email.id)
  toast.success('Аккаунт удалён')
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
      <SearchInput v-model="search" placeholder="Поиск по почтам…" class="hidden w-44 lg:block" />
      <StatusFilterSelect v-model="statusFilter" />
      <Button size="sm" variant="outline" @click="openCreate">
        <PlusIcon class="size-4" />
        Добавить
      </Button>
    </template>

    <p v-if="workspaceId" class="text-muted-foreground border-b px-4 py-2 text-xs">
      Список общий для всех разделов, статус ниже действует только здесь.
    </p>

    <EmptyState
      v-if="emailStore.emails.length === 0"
      title="Пока нет ни одного аккаунта"
      description="Добавьте email, чтобы держать логины и пароли под рукой."
      action-label="Добавить email"
      @action="openCreate"
    />
    <EmptyState v-else-if="visibleEmails.length === 0" title="Ничего не найдено" />

    <div v-else class="divide-y">
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

  <ConfirmDialog
    v-model:open="removalOpen"
    title="Удалить аккаунт?"
    :description="`${pendingRemoval?.email ?? ''} будет удалён из всех разделов.`"
    @confirm="confirmRemoval(removeEmail)"
  />
</template>
