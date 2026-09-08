<script setup lang="ts">
import { reactive, watch } from 'vue'
import { toast } from 'vue-sonner'
import FormDialog from '@/components/shared/FormDialog.vue'
import FormField from '@/components/shared/FormField.vue'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { EmailAccount, EmailDraft } from '@/types'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{ email?: EmailAccount | null }>()
const emit = defineEmits<{ save: [draft: EmailDraft] }>()

const form = reactive<EmailDraft>({
  email: '',
  password: '',
  label: '',
  notes: '',
  globalStatus: 'active',
})

watch(open, (isOpen) => {
  if (!isOpen) return

  Object.assign(form, {
    email: props.email?.email ?? '',
    password: props.email?.password ?? '',
    label: props.email?.label ?? '',
    notes: props.email?.notes ?? '',
    globalStatus: props.email?.globalStatus ?? 'active',
  })
})

function handleSubmit() {
  if (!form.email.trim()) {
    toast.error('Укажите email или логин')
    return
  }

  emit('save', { ...form, email: form.email.trim() })
  open.value = false
}
</script>

<template>
  <FormDialog
    v-model:open="open"
    :title="email ? 'Редактировать аккаунт' : 'Новый аккаунт'"
    description="Email-аккаунты общие для всех разделов: изменения видны везде."
    @submit="handleSubmit"
  >
    <FormField v-slot="{ id }" label="Email / логин">
      <Input :id="id" v-model="form.email" autocomplete="off" placeholder="example@gmail.com" />
    </FormField>

    <FormField v-slot="{ id }" label="Пароль">
      <Input :id="id" v-model="form.password" type="text" autocomplete="off" class="font-mono" />
    </FormField>

    <FormField v-slot="{ id }" label="Название / комментарий">
      <Input :id="id" v-model="form.label" placeholder="Main account" />
    </FormField>

    <FormField v-slot="{ id }" label="Заметки">
      <Textarea :id="id" v-model="form.notes" rows="2" />
    </FormField>

    <label class="flex items-center gap-2 pt-1">
      <Switch
        :model-value="form.globalStatus === 'active'"
        @update:model-value="form.globalStatus = $event ? 'active' : 'inactive'"
      />
      <span class="text-sm"
        >Глобальный статус: {{ form.globalStatus === 'active' ? 'Active' : 'Inactive' }}</span
      >
    </label>
  </FormDialog>
</template>
