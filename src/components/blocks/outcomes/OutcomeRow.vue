<script setup lang="ts">
import { CheckIcon, XIcon } from '@lucide/vue'
import { nextTick, ref, type ComponentPublicInstance } from 'vue'
import CopyButton from '@/components/shared/CopyButton.vue'
import RowActions from '@/components/shared/RowActions.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { OutcomeItem } from '@/types'
import { formatDateTime } from '@/utils/format'

const props = defineProps<{ item: OutcomeItem }>()
const emit = defineEmits<{ save: [text: string]; remove: [] }>()

const isEditing = ref(false)
const draft = ref('')
const inputRef = ref<ComponentPublicInstance | null>(null)

async function startEditing() {
  draft.value = props.item.text
  isEditing.value = true

  await nextTick()
  const element = inputRef.value?.$el
  if (element instanceof HTMLInputElement) element.select()
}

function commit() {
  const text = draft.value.trim()

  if (text) {
    emit('save', text)
  }

  isEditing.value = false
}
</script>

<template>
  <div class="hover:bg-muted/40 flex items-center gap-2 px-4 py-2 transition-colors">
    <template v-if="isEditing">
      <Input
        ref="inputRef"
        v-model="draft"
        class="h-8 flex-1 font-mono"
        @keydown.enter.prevent="commit"
        @keydown.esc.prevent="isEditing = false"
      />
      <Button type="button" variant="ghost" size="icon-sm" aria-label="Сохранить" @click="commit">
        <CheckIcon class="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Отменить"
        @click="isEditing = false"
      >
        <XIcon class="size-4" />
      </Button>
    </template>

    <template v-else>
      <span class="min-w-0 flex-1 font-mono text-sm break-all whitespace-pre-wrap">
        {{ item.text }}
      </span>
      <span class="text-muted-foreground shrink-0 text-xs tabular-nums">
        {{ formatDateTime(item.createdAt) }}
      </span>
      <CopyButton :value="item.text" what="запись" />
      <RowActions :label="item.text" @edit="startEditing" @remove="emit('remove')" />
    </template>
  </div>
</template>
