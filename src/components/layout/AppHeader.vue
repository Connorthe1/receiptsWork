<script setup lang="ts">
import { MoonIcon, SunIcon } from '@lucide/vue'
import { useDark, useToggle } from '@vueuse/core'
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

const route = useRoute()
const isDark = useDark()
const toggleDark = useToggle(isDark)

const title = computed(() => route.meta.title ?? 'Дашборд')
</script>

<template>
  <header
    class="bg-background/80 sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b px-4 backdrop-blur"
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
      size="icon"
      class="ml-auto"
      :aria-label="isDark ? 'Включить светлую тему' : 'Включить тёмную тему'"
      @click="toggleDark()"
    >
      <SunIcon v-if="isDark" class="size-4" />
      <MoonIcon v-else class="size-4" />
    </Button>
  </header>
</template>
