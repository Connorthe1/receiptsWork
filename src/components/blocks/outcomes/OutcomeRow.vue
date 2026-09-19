<script setup lang="ts">
import { CheckIcon, XIcon } from '@lucide/vue'
import { nextTick, ref, type ComponentPublicInstance } from 'vue'
import CopyButton from '@/components/shared/CopyButton.vue'
import RowActions from '@/components/shared/RowActions.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { OutcomeItem } from '@/types'
import { formatDateTime } from '@/utils/format'

const props = defineProps<{ item: OutcomeItem }>()
const emit = defineEmits<{
  save: [patch: { text: string; tag: string }]
  toggle: [isDisabled: boolean]
  remove: []
}>()

const isEditing = ref(false)
const draft = ref('')
const tagDraft = ref('')
const inputRef = ref<ComponentPublicInstance | null>(null)

async function startEditing() {
  draft.value = props.item.text
  tagDraft.value = props.item.tag ?? ''
  isEditing.value = true

  await nextTick()
  const element = inputRef.value?.$el
  if (element instanceof HTMLInputElement) element.select()
}

function commit() {
  const text = draft.value.trim()

  if (text) {
    emit('save', { text, tag: tagDraft.value.trim() })
  }

  isEditing.value = false
}
</script>

<template>
  <div class="hover:bg-muted/40 flex items-center gap-2 px-5 py-2.5 transition-colors">
    <template v-if="isEditing">
      <Input
        ref="inputRef"
        v-model="draft"
        class="h-8 flex-1 font-mono"
        @keydown.enter.prevent="commit"
        @keydown.esc.prevent="isEditing = false"
      />
      <Input
        v-model="tagDraft"
        class="h-8 w-24 shrink-0"
        placeholder="Тег"
        aria-label="Тег"
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
      <!-- Unchecked means switched off: the record stays, but sinks to the bottom of the list. -->
      <Checkbox
        :model-value="!item.isDisabled"
        :aria-label="item.isDisabled ? `Включить: ${item.text}` : `Выключить: ${item.text}`"
        @update:model-value="emit('toggle', $event !== true)"
      />
      <span
        :class="
          cn(
            'min-w-0 flex-1 font-mono text-sm break-all whitespace-pre-wrap',
            item.isDisabled && 'text-muted-foreground line-through',
          )
        "
      >
        {{ item.text }}
      </span>
      <Badge v-if="item.tag" variant="outline" class="max-w-28 shrink-0">
        <span class="truncate">{{ item.tag }}</span>
      </Badge>
      <span class="text-muted-foreground shrink-0 text-xs tabular-nums">
        {{ formatDateTime(item.createdAt) }}
      </span>
      <CopyButton :value="item.text" what="запись" />
      <RowActions :label="item.text" @edit="startEditing" @remove="emit('remove')" />
    </template>
  </div>
</template>
