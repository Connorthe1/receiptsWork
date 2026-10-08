<script setup lang="ts">
import { reactive, watch } from 'vue'
import { toast } from 'vue-sonner'
import FormDialog from '@/components/shared/FormDialog.vue'
import FormField from '@/components/shared/FormField.vue'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { workspaceColor, workspaceColorKeys } from '@/lib/workspaceAppearance'
import { useFinanceStore } from '@/stores'
import type { FinanceTag, FinanceTagDraft } from '@/types'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{ tag?: FinanceTag | null }>()
const emit = defineEmits<{ save: [draft: FinanceTagDraft] }>()

const store = useFinanceStore()

const form = reactive<FinanceTagDraft>({ name: '', color: 'violet' })

watch(open, (isOpen) => {
  if (!isOpen) return

  Object.assign(form, {
    name: props.tag?.name ?? '',
    // New tags walk the palette, so neighbouring cards rarely share a colour.
    color:
      props.tag?.color ??
      workspaceColorKeys[(store.tags.length + 1) % workspaceColorKeys.length] ??
      'violet',
  })
})

function handleSubmit() {
  const name = form.name.trim()

  if (!name) {
    toast.error('Укажите название тега')
    return
  }

  const isTaken = store.tags.some(
    (tag) => tag.id !== props.tag?.id && tag.name.toLowerCase() === name.toLowerCase(),
  )

  if (isTaken) {
    toast.error(`Тег «${name}» уже есть`)
    return
  }

  emit('save', { ...form, name })
  open.value = false
}
</script>

<template>
  <FormDialog
    v-model:open="open"
    :title="tag ? 'Редактировать тег' : 'Новый тег'"
    description="Тег выбирается при записи операции и показывает, куда уходят деньги."
    @submit="handleSubmit"
  >
    <FormField v-slot="{ id }" label="Название">
      <Input :id="id" v-model="form.name" placeholder="Закупка" />
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
