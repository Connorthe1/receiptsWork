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
      <!-- Centred column: full-width rows leave large dead gaps between value and actions. -->
      <div class="mx-auto w-full max-w-6xl min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <RouterView />
      </div>
    </SidebarInset>
  </SidebarProvider>

  <Toaster position="bottom-right" />
</template>
