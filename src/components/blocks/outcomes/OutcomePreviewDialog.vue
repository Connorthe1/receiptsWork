<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useCopy } from '@/composables/useCopy'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{ texts: string[] }>()

const { copyValue } = useCopy()

/** The reverse of the "paste as list" dialog: one record per line, in the order of the list. */
const content = computed(() => props.texts.join('\n'))
</script>

<template>
  <Dialog v-model:open="open">
    <DialogScrollContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Превью</DialogTitle>
        <DialogDescription>
          Одна строка — одна запись, в порядке списка. Записей: {{ texts.length }}.
        </DialogDescription>
      </DialogHeader>

      <Textarea
        :model-value="content"
        readonly
        spellcheck="false"
        aria-label="Записи построчно"
        class="max-h-[60vh] font-mono text-xs"
      />

      <DialogFooter>
        <Button type="button" variant="outline" @click="open = false">Закрыть</Button>
        <Button type="button" @click="copyValue(content)">Копировать</Button>
      </DialogFooter>
    </DialogScrollContent>
  </Dialog>
</template>
