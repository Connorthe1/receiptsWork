<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from '@/components/ui/dialog'

const open = defineModel<boolean>('open', { required: true })

withDefaults(
  defineProps<{
    title: string
    description: string
    submitLabel?: string
    /** Wider layout for forms with paired fields, such as addresses. */
    wide?: boolean
  }>(),
  { submitLabel: 'Сохранить', wide: false },
)

const emit = defineEmits<{ submit: [] }>()
</script>

<template>
  <Dialog v-model:open="open">
    <DialogScrollContent :class="wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>{{ description }}</DialogDescription>
      </DialogHeader>

      <form class="grid gap-4" @submit.prevent="emit('submit')">
        <slot />

        <DialogFooter class="mt-2">
          <Button type="button" variant="outline" @click="open = false">Отмена</Button>
          <Button type="submit">{{ submitLabel }}</Button>
        </DialogFooter>
      </form>
    </DialogScrollContent>
  </Dialog>
</template>
