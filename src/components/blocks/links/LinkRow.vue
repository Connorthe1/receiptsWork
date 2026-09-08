<script setup lang="ts">
import { ExternalLinkIcon } from '@lucide/vue'
import { computed } from 'vue'
import CopyButton from '@/components/shared/CopyButton.vue'
import RowActions from '@/components/shared/RowActions.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { LinkItem } from '@/types'
import { hostname, normalizeUrl } from '@/utils/format'

const props = defineProps<{ link: LinkItem }>()
const emit = defineEmits<{ edit: []; remove: [] }>()

const href = computed(() => normalizeUrl(props.link.url))
</script>

<template>
  <div class="hover:bg-muted/40 flex items-center gap-3 px-4 py-2 transition-colors">
    <div class="min-w-0 flex-1">
      <div class="flex min-w-0 items-center gap-2">
        <span class="truncate text-sm font-medium">{{ link.title }}</span>
        <Badge v-if="link.category" variant="outline" class="shrink-0">{{ link.category }}</Badge>
      </div>
      <p class="text-muted-foreground truncate text-xs">
        {{ hostname(link.url) }}<span v-if="link.notes"> · {{ link.notes }}</span>
      </p>
    </div>

    <Button
      as="a"
      :href="href"
      target="_blank"
      rel="noreferrer noopener"
      variant="ghost"
      size="icon-sm"
      class="text-muted-foreground hover:text-foreground shrink-0"
      aria-label="Открыть в новой вкладке"
    >
      <ExternalLinkIcon class="size-3.5" />
    </Button>

    <CopyButton :value="href" what="ссылку" />
    <RowActions :label="link.title" @edit="emit('edit')" @remove="emit('remove')" />
  </div>
</template>
