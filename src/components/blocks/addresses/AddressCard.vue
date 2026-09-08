<script setup lang="ts">
import { CopyIcon, FilesIcon } from '@lucide/vue'
import { computed } from 'vue'
import CopyButton from '@/components/shared/CopyButton.vue'
import RowActions from '@/components/shared/RowActions.vue'
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useCopy } from '@/composables/useCopy'
import type { Address } from '@/types'
import { addressSummary, formatAddress } from '@/utils/format'

const props = defineProps<{ address: Address }>()
const emit = defineEmits<{ edit: []; remove: []; duplicate: [] }>()

const { copyValue } = useCopy()

const fullName = computed(() =>
  [props.address.firstName, props.address.lastName].filter(Boolean).join(' '),
)

const summary = computed(() => addressSummary(props.address))
const fullText = computed(() => formatAddress(props.address))

/** Fields worth copying one by one when filling a checkout form. */
const fields = computed(() =>
  [
    { label: 'Имя и фамилия', value: fullName.value },
    { label: 'Address Line 1', value: props.address.address1 },
    { label: 'City', value: props.address.city },
    { label: 'State', value: props.address.state },
    { label: 'ZIP', value: props.address.postalCode },
    { label: 'Country', value: props.address.country },
    { label: 'Phone', value: props.address.phone },
  ].filter((field) => field.value),
)
</script>

<template>
  <div class="hover:bg-muted/40 flex items-start gap-3 px-4 py-3 transition-colors">
    <div class="min-w-0 flex-1">
      <div class="flex min-w-0 items-center gap-2">
        <span class="truncate text-sm font-medium">{{ address.label }}</span>
        <span v-if="fullName" class="text-muted-foreground truncate text-xs">{{ fullName }}</span>
      </div>
      <p class="text-muted-foreground mt-0.5 truncate text-xs">{{ summary || '—' }}</p>
      <p v-if="address.phone" class="text-muted-foreground mt-0.5 truncate font-mono text-xs">
        {{ address.phone }}
      </p>
    </div>

    <CopyButton :value="fullText" what="весь адрес" />

    <RowActions @edit="emit('edit')" @remove="emit('remove')">
      <template v-if="fields.length">
        <DropdownMenuLabel class="text-muted-foreground text-xs">Копировать поле</DropdownMenuLabel>
        <DropdownMenuItem
          v-for="field in fields"
          :key="field.label"
          @select="copyValue(field.value)"
        >
          <CopyIcon class="size-4" />
          {{ field.label }}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
      </template>

      <DropdownMenuItem @select="emit('duplicate')">
        <FilesIcon class="size-4" />
        Дублировать
      </DropdownMenuItem>
      <DropdownMenuSeparator />
    </RowActions>
  </div>
</template>
