<script setup lang="ts">
import { DownloadIcon, MoonIcon, SunIcon, Trash2Icon, UploadIcon } from '@lucide/vue'
import { markRaw, ref, shallowRef } from 'vue'
import { toast } from 'vue-sonner'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/composables/useTheme'
import { clearAllData, exportData, importData, parseBackup, type BackupFile } from '@/services'
import { useDashboardData } from '@/stores'
import { backupFilename, downloadJson } from '@/utils/download'

const { isDark } = useTheme()
const { reloadAll } = useDashboardData()

const fileInput = ref<HTMLInputElement | null>(null)
const pendingBackup = shallowRef<BackupFile | null>(null)
const importOpen = ref(false)
const clearFirstOpen = ref(false)
const clearSecondOpen = ref(false)

async function handleExport() {
  downloadJson(backupFilename(), await exportData())
  toast.success('Резервная копия сохранена')
}

async function handleFileChosen(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file) return

  try {
    // markRaw: keep backup plain so IndexedDB can structured-clone it
    pendingBackup.value = markRaw(parseBackup(await file.text()))
    importOpen.value = true
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Не удалось прочитать файл')
  }
}

async function confirmImport() {
  if (!pendingBackup.value) return

  try {
    await importData(pendingBackup.value)
    pendingBackup.value = null
    importOpen.value = false
    await reloadAll()
    toast.success('Данные восстановлены')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Не удалось импортировать данные')
  }
}

async function confirmClear() {
  await clearAllData()
  clearSecondOpen.value = false
  await reloadAll()
  toast.success('Все данные удалены')
}
</script>

<template>
  <div class="flex max-w-2xl flex-col gap-4">
    <div>
      <h1 class="text-xl font-semibold tracking-tight">Настройки</h1>
      <p class="text-muted-foreground text-sm">
        Данные хранятся в IndexedDB этого браузера и никуда не отправляются.
      </p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Оформление</CardTitle>
        <CardDescription>Тема сохраняется локально.</CardDescription>
      </CardHeader>
      <CardContent>
        <label class="flex items-center gap-3">
          <Switch v-model="isDark" />
          <span class="flex items-center gap-2 text-sm">
            <MoonIcon v-if="isDark" class="size-4" />
            <SunIcon v-else class="size-4" />
            {{ isDark ? 'Тёмная тема' : 'Светлая тема' }}
          </span>
        </label>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Резервная копия</CardTitle>
        <CardDescription>
          Экспорт сохраняет всю базу в JSON-файл, импорт полностью заменяет текущие данные.
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" @click="handleExport">
          <DownloadIcon class="size-4" />
          Экспорт данных
        </Button>
        <Button variant="outline" size="sm" @click="fileInput?.click()">
          <UploadIcon class="size-4" />
          Импорт данных
        </Button>
        <input
          ref="fileInput"
          type="file"
          accept="application/json,.json"
          class="hidden"
          @change="handleFileChosen"
        />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-destructive text-base">Опасная зона</CardTitle>
        <CardDescription>
          Полная очистка удалит почты, разделы, адреса, карты, ссылки и финансы без возможности
          отмены.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" size="sm" @click="clearFirstOpen = true">
          <Trash2Icon class="size-4" />
          Удалить все данные
        </Button>
      </CardContent>
    </Card>
  </div>

  <ConfirmDialog
    v-model:open="importOpen"
    title="Заменить все данные?"
    :description="`Текущая база будет полностью перезаписана копией от ${pendingBackup?.exportedAt.slice(0, 10) ?? ''}.`"
    confirm-label="Импортировать"
    @confirm="confirmImport"
  />

  <ConfirmDialog
    v-model:open="clearFirstOpen"
    title="Удалить все данные?"
    description="Будет очищена вся локальная база. Сначала стоит сделать экспорт."
    confirm-label="Продолжить"
    @confirm="clearSecondOpen = true"
  />

  <ConfirmDialog
    v-model:open="clearSecondOpen"
    title="Точно удалить? Это необратимо"
    description="Второе и последнее подтверждение."
    confirm-label="Да, удалить всё"
    @confirm="confirmClear"
  />
</template>
