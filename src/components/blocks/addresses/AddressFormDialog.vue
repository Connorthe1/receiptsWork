<script setup lang="ts">
import { reactive, watch } from 'vue'
import { toast } from 'vue-sonner'
import FormDialog from '@/components/shared/FormDialog.vue'
import FormField from '@/components/shared/FormField.vue'
import { Input } from '@/components/ui/input'
import type { Address, AddressDraft } from '@/types'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{ address?: Address | null }>()
const emit = defineEmits<{ save: [draft: AddressDraft] }>()

const emptyDraft = (): AddressDraft => ({
  label: '',
  firstName: '',
  lastName: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postalCode: '',
})

const form = reactive<AddressDraft>(emptyDraft())

watch(open, (isOpen) => {
  if (!isOpen) return

  const source = props.address
  Object.assign(form, emptyDraft())

  if (source) {
    Object.assign(form, {
      label: source.label,
      firstName: source.firstName,
      lastName: source.lastName,
      address1: source.address1,
      address2: source.address2,
      city: source.city,
      state: source.state,
      postalCode: source.postalCode,
    })
  }
})

function handleSubmit() {
  if (!form.label.trim()) {
    toast.error('Укажите название адреса')
    return
  }

  emit('save', { ...form, label: form.label.trim() })
  open.value = false
}
</script>

<template>
  <FormDialog
    v-model:open="open"
    :title="address ? 'Редактировать адрес' : 'Новый адрес'"
    description="Почтовый адрес для быстрой вставки в формы."
    wide
    @submit="handleSubmit"
  >
    <FormField v-slot="{ id }" label="Название адреса">
      <Input :id="id" v-model="form.label" placeholder="US Address #1" />
    </FormField>

    <div class="grid gap-4 sm:grid-cols-2">
      <FormField v-slot="{ id }" label="First Name">
        <Input :id="id" v-model="form.firstName" autocomplete="off" />
      </FormField>
      <FormField v-slot="{ id }" label="Last Name">
        <Input :id="id" v-model="form.lastName" autocomplete="off" />
      </FormField>
    </div>

    <FormField v-slot="{ id }" label="Address Line 1">
      <Input :id="id" v-model="form.address1" autocomplete="off" />
    </FormField>

    <FormField v-slot="{ id }" label="Address Line 2">
      <Input :id="id" v-model="form.address2" autocomplete="off" />
    </FormField>

    <div class="grid gap-4 sm:grid-cols-3">
      <FormField v-slot="{ id }" label="City">
        <Input :id="id" v-model="form.city" autocomplete="off" />
      </FormField>
      <FormField v-slot="{ id }" label="State / Province">
        <Input :id="id" v-model="form.state" autocomplete="off" />
      </FormField>
      <FormField v-slot="{ id }" label="ZIP / Postal Code">
        <Input :id="id" v-model="form.postalCode" autocomplete="off" />
      </FormField>
    </div>
  </FormDialog>
</template>
