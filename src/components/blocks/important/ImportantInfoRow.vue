<script setup lang="ts">
import CopyButton from '@/components/shared/CopyButton.vue'
import RowActions from '@/components/shared/RowActions.vue'
import SecretValue from '@/components/shared/SecretValue.vue'
import type { ImportantItem } from '@/types'

defineProps<{ item: ImportantItem }>()
const emit = defineEmits<{ edit: []; remove: [] }>()
</script>

<template>
  <div class="hover:bg-muted/40 px-4 py-2 transition-colors">
    <div class="flex items-center gap-3">
      <span class="text-muted-foreground w-36 shrink-0 truncate text-xs">{{ item.title }}</span>

      <div class="min-w-0 flex-1">
        <SecretValue v-if="item.isSecret" :value="item.value" />
        <span v-else class="truncate font-mono text-sm">{{ item.value || '—' }}</span>
      </div>

      <CopyButton :value="item.value" :what="item.title" />
      <RowActions :label="item.title" @edit="emit('edit')" @remove="emit('remove')" />
    </div>

    <p v-if="item.notes" class="text-muted-foreground mt-0.5 pl-[9.75rem] text-xs">
      {{ item.notes }}
    </p>
  </div>
</template>
