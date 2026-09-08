<script setup lang="ts">
import { reactive, watch } from 'vue'
import { toast } from 'vue-sonner'
import FormDialog from '@/components/shared/FormDialog.vue'
import FormField from '@/components/shared/FormField.vue'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  workspaceColor,
  workspaceColorKeys,
  workspaceIcon,
  workspaceIconKeys,
} from '@/lib/workspaceAppearance'
import type { Workspace, WorkspaceDraft } from '@/types'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{ workspace?: Workspace | null }>()
const emit = defineEmits<{ save: [draft: WorkspaceDraft] }>()

const form = reactive<WorkspaceDraft>({
  name: '',
  description: '',
  icon: 'folder',
  color: 'violet',
})

watch(open, (isOpen) => {
  if (!isOpen) return

  Object.assign(form, {
    name: props.workspace?.name ?? '',
    description: props.workspace?.description ?? '',
    icon: props.workspace?.icon || 'folder',
    color: props.workspace?.color || 'violet',
  })
})

function handleSubmit() {
  if (!form.name.trim()) {
    toast.error('Укажите название раздела')
    return
  }

  emit('save', { ...form, name: form.name.trim() })
  open.value = false
}
</script>

<template>
  <FormDialog
    v-model:open="open"
    :title="workspace ? 'Настройки раздела' : 'Новый раздел'"
    description="Раздел хранит собственные записи, адреса, карты и ссылки."
    @submit="handleSubmit"
  >
    <FormField v-slot="{ id }" label="Название">
      <Input :id="id" v-model="form.name" placeholder="Amazon Work" />
    </FormField>

    <FormField v-slot="{ id }" label="Описание">
      <Textarea :id="id" v-model="form.description" rows="2" />
    </FormField>

    <FormField label="Иконка">
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="key in workspaceIconKeys"
          :key="key"
          type="button"
          :aria-label="`Иконка ${key}`"
          :aria-pressed="form.icon === key"
          :class="
            cn(
              'hover:bg-muted flex size-9 items-center justify-center rounded-md border transition-colors',
              form.icon === key ? 'border-primary bg-muted' : 'border-border',
            )
          "
          @click="form.icon = key"
        >
          <component :is="workspaceIcon(key)" class="size-4" />
        </button>
      </div>
    </FormField>

    <FormField label="Цвет">
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="key in workspaceColorKeys"
          :key="key"
          type="button"
          :aria-label="`Цвет ${key}`"
          :aria-pressed="form.color === key"
          :class="
            cn(
              'flex size-9 items-center justify-center rounded-md border transition-colors',
              form.color === key ? 'border-primary' : 'border-border',
            )
          "
          @click="form.color = key"
        >
          <span :class="cn('size-3.5 rounded-full', workspaceColor(key))" />
        </button>
      </div>
    </FormField>
  </FormDialog>
</template>
