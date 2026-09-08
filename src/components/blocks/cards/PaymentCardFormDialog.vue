<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { toast } from 'vue-sonner'
import FormDialog from '@/components/shared/FormDialog.vue'
import FormField from '@/components/shared/FormField.vue'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Address, CardDraft, PaymentCard } from '@/types'

const NO_ADDRESS = 'none'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{ card?: PaymentCard | null; addresses: Address[] }>()
const emit = defineEmits<{ save: [draft: CardDraft] }>()

const emptyDraft = (): CardDraft => ({
  label: '',
  cardholderName: '',
  cardNumber: '',
  expiryMonth: '',
  expiryYear: '',
  cvv: '',
  billingAddressId: null,
  notes: '',
})

const form = reactive<CardDraft>(emptyDraft())

const billingAddress = computed({
  get: () => form.billingAddressId ?? NO_ADDRESS,
  set: (value: string) => {
    form.billingAddressId = value === NO_ADDRESS ? null : value
  },
})

watch(open, (isOpen) => {
  if (!isOpen) return

  Object.assign(form, emptyDraft())

  if (props.card) {
    Object.assign(form, {
      label: props.card.label,
      cardholderName: props.card.cardholderName,
      cardNumber: props.card.cardNumber,
      expiryMonth: props.card.expiryMonth,
      expiryYear: props.card.expiryYear,
      cvv: props.card.cvv,
      billingAddressId: props.card.billingAddressId,
      notes: props.card.notes,
    })
  }
})

function handleSubmit() {
  if (!form.label.trim()) {
    toast.error('Укажите название карты')
    return
  }

  emit('save', { ...form, label: form.label.trim() })
  open.value = false
}
</script>

<template>
  <FormDialog
    v-model:open="open"
    :title="card ? 'Редактировать карту' : 'Новая карта'"
    description="Данные хранятся только в этом браузере и никуда не отправляются."
    @submit="handleSubmit"
  >
    <FormField v-slot="{ id }" label="Название / Alias">
      <Input :id="id" v-model="form.label" placeholder="Main Visa" />
    </FormField>

    <FormField v-slot="{ id }" label="Cardholder Name">
      <Input :id="id" v-model="form.cardholderName" autocomplete="off" placeholder="JOHN SMITH" />
    </FormField>

    <FormField v-slot="{ id }" label="Card Number">
      <Input
        :id="id"
        v-model="form.cardNumber"
        autocomplete="off"
        inputmode="numeric"
        class="font-mono"
      />
    </FormField>

    <div class="grid gap-4 sm:grid-cols-3">
      <FormField v-slot="{ id }" label="Месяц">
        <Input
          :id="id"
          v-model="form.expiryMonth"
          autocomplete="off"
          inputmode="numeric"
          placeholder="12"
        />
      </FormField>
      <FormField v-slot="{ id }" label="Год">
        <Input
          :id="id"
          v-model="form.expiryYear"
          autocomplete="off"
          inputmode="numeric"
          placeholder="29"
        />
      </FormField>
      <FormField v-slot="{ id }" label="CVV">
        <Input
          :id="id"
          v-model="form.cvv"
          autocomplete="off"
          inputmode="numeric"
          class="font-mono"
        />
      </FormField>
    </div>

    <FormField label="Billing Address">
      <Select v-model="billingAddress">
        <SelectTrigger class="w-full">
          <SelectValue placeholder="Не выбран" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem :value="NO_ADDRESS">Не выбран</SelectItem>
          <SelectItem v-for="address in addresses" :key="address.id" :value="address.id">
            {{ address.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </FormField>

    <FormField v-slot="{ id }" label="Notes">
      <Textarea :id="id" v-model="form.notes" rows="2" />
    </FormField>
  </FormDialog>
</template>
