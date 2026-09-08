<script setup lang="ts">
import { MoonIcon, SunIcon } from '@lucide/vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useTheme } from '@/composables/useTheme'
import { useWorkspaceStore } from '@/stores'

const route = useRoute()
const workspaceStore = useWorkspaceStore()
const { isDark, toggleTheme } = useTheme()

const title = computed(() => {
  if (route.name === 'workspace' && typeof route.params.id === 'string') {
    return workspaceStore.byId(route.params.id)?.name ?? 'Раздел'
  }

  return route.meta.title ?? 'Дашборд'
})
</script>

<template>
  <header
    class="bg-background/80 sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4 backdrop-blur"
  >
    <SidebarTrigger class="-ml-1" />
    <Separator orientation="vertical" class="mr-2 h-4" />

    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>{{ title }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <Button
      variant="ghost"
      size="icon-sm"
      class="ml-auto"
      :aria-label="isDark ? 'Включить светлую тему' : 'Включить тёмную тему'"
      @click="toggleTheme()"
    >
      <SunIcon v-if="isDark" class="size-4" />
      <MoonIcon v-else class="size-4" />
    </Button>
  </header>
</template>
