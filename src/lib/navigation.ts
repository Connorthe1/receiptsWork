import type { FunctionalComponent } from 'vue'
import { LayoutDashboardIcon, SettingsIcon } from '@lucide/vue'

export interface NavItem {
  title: string
  to: string
  icon: FunctionalComponent
}

export const navItems: NavItem[] = [
  { title: 'Обзор', to: '/', icon: LayoutDashboardIcon },
  { title: 'Настройки', to: '/settings', icon: SettingsIcon },
]
