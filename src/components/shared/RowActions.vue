<script setup lang="ts">
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/** `label` names the record the menu belongs to, so screen readers get more than "Действия". */
defineProps<{ label?: string }>()

const emit = defineEmits<{ edit: []; remove: [] }>()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        class="text-muted-foreground shrink-0"
        :aria-label="label ? `Действия: ${label}` : 'Действия'"
      >
        <MoreHorizontalIcon class="size-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-48">
      <slot />
      <DropdownMenuItem @select="emit('edit')">
        <PencilIcon class="size-4" />
        Редактировать
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive" @select="emit('remove')">
        <Trash2Icon class="size-4" />
        Удалить
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
