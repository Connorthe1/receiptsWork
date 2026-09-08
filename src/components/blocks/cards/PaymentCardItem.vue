<script setup lang="ts">
import { computed } from 'vue'
import CopyButton from '@/components/shared/CopyButton.vue'
import RowActions from '@/components/shared/RowActions.vue'
import SecretValue from '@/components/shared/SecretValue.vue'
import type { PaymentCard } from '@/types'
import { digitsOnly, formatCardNumber, formatExpiry, maskCardNumber } from '@/utils/format'

const props = defineProps<{ card: PaymentCard; billingAddressLabel?: string }>()
const emit = defineEmits<{ edit: []; remove: [] }>()

const expiry = computed(() => formatExpiry(props.card))
const plainNumber = computed(() => digitsOnly(props.card.cardNumber) || props.card.cardNumber)
</script>

<template>
  <div class="hover:bg-muted/40 flex flex-col gap-2 px-5 py-3.5 transition-colors">
    <div class="flex items-center gap-2">
      <span class="truncate text-sm font-medium">{{ card.label }}</span>
      <span v-if="billingAddressLabel" class="text-muted-foreground truncate text-xs">
        · {{ billingAddressLabel }}
      </span>
      <div class="ml-auto">
        <RowActions :label="card.label" @edit="emit('edit')" @remove="emit('remove')" />
      </div>
    </div>

    <div class="grid gap-x-3 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
      <span class="text-muted-foreground self-center text-xs">Cardholder</span>
      <div class="flex min-w-0 items-center gap-1">
        <span class="truncate font-mono text-sm">{{ card.cardholderName || '—' }}</span>
        <CopyButton :value="card.cardholderName" what="имя держателя" />
      </div>

      <span class="text-muted-foreground self-center text-xs">Card</span>
      <div class="flex min-w-0 items-center gap-1">
        <SecretValue
          :value="formatCardNumber(card.cardNumber)"
          :mask="maskCardNumber(card.cardNumber)"
        />
        <CopyButton :value="plainNumber" what="номер карты" />
      </div>

      <span class="text-muted-foreground self-center text-xs">Expiry</span>
      <div class="flex min-w-0 items-center gap-1">
        <span class="font-mono text-sm">{{ expiry }}</span>
        <CopyButton :value="expiry" what="срок действия" />
      </div>

      <span class="text-muted-foreground self-center text-xs">CVV</span>
      <div class="flex min-w-0 items-center gap-1">
        <SecretValue :value="card.cvv" />
        <CopyButton :value="card.cvv" what="CVV" />
      </div>
    </div>

    <p v-if="card.notes" class="text-muted-foreground text-xs">{{ card.notes }}</p>
  </div>
</template>
