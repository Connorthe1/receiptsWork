<script setup lang="ts">
import { DicesIcon, RefreshCwIcon } from '@lucide/vue'
import { ref } from 'vue'
import CopyButton from '@/components/shared/CopyButton.vue'
import DashboardCard from '@/components/shared/DashboardCard.vue'
import { Button } from '@/components/ui/button'
import { randomUsPhone } from '@/utils/generate'

const phone = ref('')
</script>

<template>
  <DashboardCard title="Генерация" :icon="DicesIcon">
    <div class="flex items-center gap-3 px-5 py-3">
      <span class="text-muted-foreground shrink-0 text-xs">Номер США</span>
      <span class="min-w-0 flex-1 truncate font-mono text-sm">{{ phone || '—' }}</span>

      <CopyButton :value="phone" what="номер" />
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Сгенерировать номер"
        title="Сгенерировать"
        @click="phone = randomUsPhone()"
      >
        <RefreshCwIcon class="size-4" />
      </Button>
    </div>
  </DashboardCard>
</template>
