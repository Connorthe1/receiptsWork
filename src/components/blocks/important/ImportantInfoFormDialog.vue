<script setup lang="ts">
import { reactive, watch } from 'vue'
import { toast } from 'vue-sonner'
import FormDialog from '@/components/shared/FormDialog.vue'
import FormField from '@/components/shared/FormField.vue'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { ImportantItem, ImportantItemDraft } from '@/types'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{ item?: ImportantItem | null }>()
const emit = defineEmits<{ save: [draft: ImportantItemDraft] }>()

const form = reactive<ImportantItemDraft>({
  title: '',
  value: '',
  isSecret: false,
  notes: '',
})

watch(open, (isOpen) => {
  if (!isOpen) return

  Object.assign(form, {
    title: props.item?.title ?? '',
    value: props.item?.value ?? '',
    isSecret: props.item?.isSecret ?? false,
    notes: props.item?.notes ?? '',
  })
})

function handleSubmit() {
  if (!form.title.trim()) {
    toast.error('Укажите название записи')
    return
  }

  emit('save', { ...form, title: form.title.trim() })
  open.value = false
}
</script>

<template>
  <FormDialog
    v-model:open="open"
    :title="item ? 'Редактировать запись' : 'Новая запись'"
    description="Произвольная пара «название → значение»."
    @submit="handleSubmit"
  >
    <FormField v-slot="{ id }" label="Название">
      <Input :id="id" v-model="form.title" placeholder="Default password" />
    </FormField>

    <FormField v-slot="{ id }" label="Значение">
      <Input :id="id" v-model="form.value" class="font-mono" autocomplete="off" />
    </FormField>

    <FormField v-slot="{ id }" label="Комментарий">
      <Textarea :id="id" v-model="form.notes" rows="2" />
    </FormField>

    <label class="flex items-center gap-2 pt-1">
      <Switch v-model="form.isSecret" />
      <span class="text-sm">Секретное значение — скрывать по умолчанию</span>
    </label>
  </FormDialog>
</template>
