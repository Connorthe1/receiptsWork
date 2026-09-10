<script setup lang="ts">
import { CopyPlusIcon, MapPinIcon } from '@lucide/vue'
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
import { useAddressStore } from '@/stores'
import type { Address, AddressDraft, WorkspaceScope } from '@/types'
import { stripEntityMeta } from '@/utils/entity'
import { addressSummary } from '@/utils/format'
import AddressCard from './AddressCard.vue'
import AddressFormDialog from './AddressFormDialog.vue'

const props = withDefaults(defineProps<{ workspaceId?: WorkspaceScope; class?: string }>(), {
  workspaceId: null,
})

const store = useAddressStore()

const search = ref('')
const formOpen = ref(false)
const editing = ref<Address | null>(null)

const {
  target: pendingRemoval,
  isOpen: removalOpen,
  request: requestRemoval,
  confirm: confirmRemoval,
} = useDeletionTarget<Address>()

const addresses = computed(() => store.forScope(props.workspaceId))

/** Inside a workspace the Home list doubles as a library to copy from. */
const homeAddresses = computed(() => (props.workspaceId ? store.forScope(null) : []))

const visibleAddresses = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return addresses.value

  return addresses.value.filter((address) =>
    [address.label, address.firstName, address.lastName, addressSummary(address)]
      .join(' ')
      .toLowerCase()
      .includes(query),
  )
})

function openCreate() {
  editing.value = null
  formOpen.value = true
}

function openEdit(address: Address) {
  editing.value = address
  formOpen.value = true
}

async function handleSave(draft: AddressDraft) {
  if (editing.value) {
    await store.update(editing.value.id, draft)
    toast.success('Адрес обновлён')
  } else {
    await store.create({ ...draft, workspaceId: props.workspaceId })
    toast.success('Адрес добавлен')
  }
}

async function copyFromHome(address: Address) {
  await store.create({ ...stripEntityMeta(address), workspaceId: props.workspaceId })
  toast.success(`«${address.label}» скопирован в раздел`)
}

async function duplicate(address: Address) {
  await store.create({ ...stripEntityMeta(address), label: `${address.label} (копия)` })
  toast.success('Адрес продублирован')
}

async function removeAddress(address: Address) {
  await store.remove(address.id)
  toast.success('Адрес удалён')
}
</script>

<template>
  <DashboardCard title="Адреса" :icon="MapPinIcon" :count="addresses.length" :class="props.class">
    <template #actions>
      <SearchInput v-model="search" class="max-w-40 min-w-24 flex-1" />

      <DropdownMenu v-if="workspaceId">
        <DropdownMenuTrigger as-child>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Взять адрес с главной"
            title="Взять адрес с главной"
          >
            <CopyPlusIcon class="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-64">
          <DropdownMenuLabel class="text-muted-foreground text-xs">
            Адреса с главной
          </DropdownMenuLabel>
          <DropdownMenuItem v-if="homeAddresses.length === 0" disabled>
            На главной пока нет адресов
          </DropdownMenuItem>
          <DropdownMenuItem
            v-for="address in homeAddresses"
            :key="address.id"
            @select="copyFromHome(address)"
          >
            <MapPinIcon class="size-4" />
            <span class="truncate">{{ address.label }}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddButton label="Добавить адрес" @click="openCreate" />
    </template>

    <EmptyState
      v-if="addresses.length === 0"
      title="Пока нет адресов"
      description="Сохраните адрес, чтобы копировать его одним кликом."
      action-label="Добавить адрес"
      @action="openCreate"
    />
    <EmptyState v-else-if="visibleAddresses.length === 0" title="Ничего не найдено" />

    <div v-else class="divide-y">
      <AddressCard
        v-for="address in visibleAddresses"
        :key="address.id"
        :address="address"
        @edit="openEdit(address)"
        @remove="requestRemoval(address)"
        @duplicate="duplicate(address)"
      />
    </div>
  </DashboardCard>

  <AddressFormDialog v-model:open="formOpen" :address="editing" @save="handleSave" />

  <ConfirmDialog
    v-model:open="removalOpen"
    title="Удалить адрес?"
    :description="`«${pendingRemoval?.label ?? ''}» будет удалён.`"
    @confirm="confirmRemoval(removeAddress)"
  />
</template>
