<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { useTheme } from '@/composables/useTheme'
import { useDashboardData } from '@/stores'

const { loadAll } = useDashboardData()

// Applies the stored theme before the first paint of the dashboard.
useTheme()

onMounted(loadAll)
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset class="min-w-0">
      <AppHeader />
      <div class="min-w-0 flex-1 p-4">
        <RouterView />
      </div>
    </SidebarInset>
  </SidebarProvider>

  <Toaster position="bottom-right" />
</template>
