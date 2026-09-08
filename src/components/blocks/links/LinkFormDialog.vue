<script setup lang="ts">
import { reactive, watch } from 'vue'
import { toast } from 'vue-sonner'
import FormDialog from '@/components/shared/FormDialog.vue'
import FormField from '@/components/shared/FormField.vue'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { LinkDraft, LinkItem } from '@/types'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{ link?: LinkItem | null }>()
const emit = defineEmits<{ save: [draft: LinkDraft] }>()

const form = reactive<LinkDraft>({
  title: '',
  url: '',
  category: '',
  notes: '',
})

watch(open, (isOpen) => {
  if (!isOpen) return

  Object.assign(form, {
    title: props.link?.title ?? '',
    url: props.link?.url ?? '',
    category: props.link?.category ?? '',
    notes: props.link?.notes ?? '',
  })
})

function handleSubmit() {
  if (!form.title.trim() || !form.url.trim()) {
    toast.error('Укажите название и URL')
    return
  }

  emit('save', { ...form, title: form.title.trim(), url: form.url.trim() })
  open.value = false
}
</script>

<template>
  <FormDialog
    v-model:open="open"
    :title="link ? 'Редактировать ссылку' : 'Новая ссылка'"
    description="Ссылки хранятся внутри текущего раздела."
    @submit="handleSubmit"
  >
    <FormField v-slot="{ id }" label="Название">
      <Input :id="id" v-model="form.title" placeholder="Admin Panel" />
    </FormField>

    <FormField v-slot="{ id }" label="URL">
      <Input :id="id" v-model="form.url" placeholder="https://example.com/admin" />
    </FormField>

    <FormField v-slot="{ id }" label="Категория">
      <Input :id="id" v-model="form.category" placeholder="Панели" />
    </FormField>

    <FormField v-slot="{ id }" label="Комментарий">
      <Textarea :id="id" v-model="form.notes" rows="2" />
    </FormField>
  </FormDialog>
</template>
