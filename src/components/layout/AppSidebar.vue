<script setup lang="ts">
import { HomeIcon, PlusIcon, ReceiptTextIcon, SettingsIcon } from '@lucide/vue'
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import WorkspaceFormDialog from '@/components/workspace/WorkspaceFormDialog.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { workspaceColor, workspaceIcon } from '@/lib/workspaceAppearance'
import { useWorkspaceStore } from '@/stores'
import type { WorkspaceDraft } from '@/types'

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()

const createOpen = ref(false)

async function handleCreate(draft: WorkspaceDraft) {
  const workspace = await workspaceStore.create(draft)
  toast.success('Раздел создан')
  await router.push({ name: 'workspace', params: { id: workspace.id } })
}
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <RouterLink to="/">
              <div
                class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
              >
                <ReceiptTextIcon class="size-4" />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium">Receipts Work</span>
                <span class="text-muted-foreground truncate text-xs">Рабочий дашборд</span>
              </div>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Main</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton as-child tooltip="Главная" :is-active="route.name === 'home'">
                <RouterLink to="/">
                  <HomeIcon />
                  <span>Главная</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Разделы</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="workspace in workspaceStore.workspaces" :key="workspace.id">
              <SidebarMenuButton
                as-child
                :tooltip="workspace.name"
                :is-active="route.params.id === workspace.id"
              >
                <RouterLink :to="{ name: 'workspace', params: { id: workspace.id } }">
                  <component :is="workspaceIcon(workspace.icon)" />
                  <span class="truncate">{{ workspace.name }}</span>
                  <span
                    :class="
                      cn('ml-auto size-2 shrink-0 rounded-full', workspaceColor(workspace.color))
                    "
                  />
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Новый раздел"
                class="text-muted-foreground"
                @click="createOpen = true"
              >
                <PlusIcon />
                <span>Новый раздел</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton as-child tooltip="Настройки" :is-active="route.name === 'settings'">
            <RouterLink to="/settings">
              <SettingsIcon />
              <span>Настройки</span>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>

  <WorkspaceFormDialog v-model:open="createOpen" @save="handleCreate" />
</template>
