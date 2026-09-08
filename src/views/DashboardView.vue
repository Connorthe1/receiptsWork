<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const stats = [
  { label: 'Чеков за сегодня', value: '—' },
  { label: 'Сумма за месяц', value: '—' },
  { label: 'В обработке', value: '—' },
  { label: 'Ошибки импорта', value: '—' },
]
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">Обзор</h1>
      <p class="text-muted-foreground text-sm">
        Каркас дашборда готов — виджеты подключим, когда появится описание функционала.
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card v-for="stat in stats" :key="stat.label">
        <CardHeader class="pb-2">
          <CardDescription>{{ stat.label }}</CardDescription>
          <CardTitle class="text-3xl tabular-nums">{{ stat.value }}</CardTitle>
        </CardHeader>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Основная область</CardTitle>
        <CardDescription>Здесь появятся таблицы, графики и фильтры.</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          class="text-muted-foreground flex h-64 items-center justify-center rounded-lg border border-dashed text-sm"
        >
          Пусто
        </div>
      </CardContent>
    </Card>
  </div>
</template>
