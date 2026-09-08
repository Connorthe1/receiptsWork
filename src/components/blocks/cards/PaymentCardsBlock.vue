<script setup lang="ts">
import { CreditCardIcon, PlusIcon } from '@lucide/vue'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import DashboardCard from '@/components/shared/DashboardCard.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import { Button } from '@/components/ui/button'
import { useDeletionTarget } from '@/composables/useDeletionTarget'
import { useAddressStore, useCardStore } from '@/stores'
import type { CardDraft, PaymentCard, WorkspaceScope } from '@/types'
import PaymentCardFormDialog from './PaymentCardFormDialog.vue'
import PaymentCardItem from './PaymentCardItem.vue'

const props = withDefaults(defineProps<{ workspaceId?: WorkspaceScope; class?: string }>(), {
  workspaceId: null,
})

const store = useCardStore()
const addressStore = useAddressStore()

const formOpen = ref(false)
const editing = ref<PaymentCard | null>(null)

const {
  target: pendingRemoval,
  isOpen: removalOpen,
  request: requestRemoval,
  dismiss,
} = useDeletionTarget<PaymentCard>()

const cards = computed(() => store.forScope(props.workspaceId))

/** Cards may reference a workspace address or a global one from the Home page. */
const availableAddresses = computed(() => [
  ...addressStore.forScope(props.workspaceId),
  ...(props.workspaceId ? addressStore.forScope(null) : []),
])

function billingLabel(card: PaymentCard): string | undefined {
  if (!card.billingAddressId) return undefined

  return availableAddresses.value.find((address) => address.id === card.billingAddressId)?.label
}

function openCreate() {
  editing.value = null
  formOpen.value = true
}

function openEdit(card: PaymentCard) {
  editing.value = card
  formOpen.value = true
}

async function handleSave(draft: CardDraft) {
  if (editing.value) {
    await store.update(editing.value.id, draft)
    toast.success('Карта обновлена')
  } else {
    await store.create({ ...draft, workspaceId: props.workspaceId })
    toast.success('Карта добавлена')
  }
}

async function confirmRemoval() {
  if (!pendingRemoval.value) return

  await store.remove(pendingRemoval.value.id)
  dismiss()
  toast.success('Карта удалена')
}
</script>

<template>
  <DashboardCard title="Карты" :icon="CreditCardIcon" :count="cards.length" :class="props.class">
    <template #actions>
      <Button size="sm" variant="outline" @click="openCreate">
        <PlusIcon class="size-4" />
        Добавить
      </Button>
    </template>

    <EmptyState
      v-if="cards.length === 0"
      title="Пока нет карт"
      description="Номер и CVV скрыты по умолчанию и не покидают этот компьютер."
      action-label="Добавить карту"
      @action="openCreate"
    />

    <div v-else class="divide-y">
      <PaymentCardItem
        v-for="card in cards"
        :key="card.id"
        :card="card"
        :billing-address-label="billingLabel(card)"
        @edit="openEdit(card)"
        @remove="requestRemoval(card)"
      />
    </div>
  </DashboardCard>

  <PaymentCardFormDialog
    v-model:open="formOpen"
    :card="editing"
    :addresses="availableAddresses"
    @save="handleSave"
  />

  <ConfirmDialog
    v-model:open="removalOpen"
    title="Удалить карту?"
    :description="`«${pendingRemoval?.label ?? ''}» будет удалена.`"
    @confirm="confirmRemoval"
  />
</template>
