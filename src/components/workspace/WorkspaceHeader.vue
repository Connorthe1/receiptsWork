<script setup lang="ts">
import { PencilIcon, Trash2Icon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { workspaceColor, workspaceIcon } from '@/lib/workspaceAppearance'
import type { Workspace } from '@/types'

defineProps<{ workspace: Workspace }>()
const emit = defineEmits<{ edit: []; remove: [] }>()
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <div
      :class="
        cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg text-white',
          workspaceColor(workspace.color),
        )
      "
    >
      <component :is="workspaceIcon(workspace.icon)" class="size-5" />
    </div>

    <div class="min-w-0 flex-1">
      <h1 class="truncate text-xl font-semibold tracking-tight">{{ workspace.name }}</h1>
      <p v-if="workspace.description" class="text-muted-foreground truncate text-sm">
        {{ workspace.description }}
      </p>
    </div>

    <div class="flex items-center gap-2">
      <Button variant="outline" size="sm" @click="emit('edit')">
        <PencilIcon class="size-4" />
        Настройки
      </Button>
      <Button variant="destructive" size="sm" @click="emit('remove')">
        <Trash2Icon class="size-4" />
        Удалить
      </Button>
    </div>
  </div>
</template>
