<script setup lang="ts">
import { CopyPlusIcon, CreditCardIcon } from '@lucide/vue'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import AddButton from '@/components/shared/AddButton.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import DashboardCard from '@/components/shared/DashboardCard.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDeletionTarget } from '@/composables/useDeletionTarget'
import { useAddressStore, useCardStore } from '@/stores'
import type { CardDraft, PaymentCard, WorkspaceScope } from '@/types'
import { stripEntityMeta } from '@/utils/entity'
import { maskCardNumber } from '@/utils/format'
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
  confirm: confirmRemoval,
} = useDeletionTarget<PaymentCard>()

const cards = computed(() => store.forScope(props.workspaceId))

/** Inside a workspace the Home list doubles as a library to copy from. */
const homeCards = computed(() => (props.workspaceId ? store.forScope(null) : []))

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

async function copyFromHome(card: PaymentCard) {
  await store.create({ ...stripEntityMeta(card), workspaceId: props.workspaceId })
  toast.success(`«${card.label}» скопирована в раздел`)
}

async function removeCard(card: PaymentCard) {
  await store.remove(card.id)
  toast.success('Карта удалена')
}
</script>

<template>
  <DashboardCard title="Карты" :icon="CreditCardIcon" :count="cards.length" :class="props.class">
    <template #actions>
      <DropdownMenu v-if="workspaceId">
        <DropdownMenuTrigger as-child>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Взять карту с главной"
            title="Взять карту с главной"
          >
            <CopyPlusIcon class="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-72">
          <DropdownMenuLabel class="text-muted-foreground text-xs">
            Карты с главной
          </DropdownMenuLabel>
          <DropdownMenuItem v-if="homeCards.length === 0" disabled>
            На главной пока нет карт
          </DropdownMenuItem>
          <DropdownMenuItem
            v-for="card in homeCards"
            :key="card.id"
            @select="copyFromHome(card)"
          >
            <CreditCardIcon class="size-4" />
            <span class="min-w-0 flex-1 truncate">{{ card.label }}</span>
            <span class="text-muted-foreground font-mono text-xs tabular-nums">
              {{ maskCardNumber(card.cardNumber) }}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddButton label="Добавить карту" @click="openCreate" />
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
    @confirm="confirmRemoval(removeCard)"
  />
</template>
