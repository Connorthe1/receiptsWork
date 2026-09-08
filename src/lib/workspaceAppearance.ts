import {
  BriefcaseIcon,
  BuildingIcon,
  FlaskConicalIcon,
  FolderIcon,
  GlobeIcon,
  PackageIcon,
  RocketIcon,
  ShoppingCartIcon,
  UsersIcon,
} from '@lucide/vue'
import type { Component } from 'vue'

export const workspaceIcons: Record<string, Component> = {
  folder: FolderIcon,
  briefcase: BriefcaseIcon,
  cart: ShoppingCartIcon,
  package: PackageIcon,
  rocket: RocketIcon,
  flask: FlaskConicalIcon,
  users: UsersIcon,
  building: BuildingIcon,
  globe: GlobeIcon,
}

export const workspaceIconKeys = Object.keys(workspaceIcons)

export function workspaceIcon(key: string): Component {
  return workspaceIcons[key] ?? FolderIcon
}

/** Fixed palette so the sidebar stays readable in both themes. */
export const workspaceColors: Record<string, string> = {
  slate: 'bg-slate-400',
  violet: 'bg-violet-500',
  emerald: 'bg-emerald-500',
  sky: 'bg-sky-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
}

export const workspaceColorKeys = Object.keys(workspaceColors)

export function workspaceColor(key: string): string {
  return workspaceColors[key] ?? workspaceColors.slate!
}
