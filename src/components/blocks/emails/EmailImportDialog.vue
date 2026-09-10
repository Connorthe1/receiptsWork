<script setup lang="ts">
import { UploadIcon } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import FormDialog from '@/components/shared/FormDialog.vue'
import FormField from '@/components/shared/FormField.vue'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { EmailDraft } from '@/types'
import { parseEmailCredentials } from '@/utils/emailImport'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{ existing: string[] }>()
const emit = defineEmits<{ import: [drafts: EmailDraft[]] }>()

const raw = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

watch(open, (isOpen) => {
  if (isOpen) raw.value = ''
})

const result = computed(() => parseEmailCredentials(raw.value, props.existing))

async function handleFileChosen(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file) return

  const text = await file.text()
  raw.value = raw.value.trim() ? `${raw.value.trimEnd()}\n${text}` : text
}

function handleSubmit() {
  if (result.value.drafts.length === 0) {
    toast.error('Не нашлось ни одной новой строки вида email:password')
    return
  }

  emit('import', result.value.drafts)
  open.value = false
}
</script>

<template>
  <FormDialog
    v-model:open="open"
    title="Импорт почт"
    description="Одна строка — один аккаунт в формате email:password. Разделителем может быть : ; | , таб или пробел."
    :submit-label="
      result.drafts.length ? `Импортировать (${result.drafts.length})` : 'Импортировать'
    "
    @submit="handleSubmit"
  >
    <div>
      <Button type="button" variant="outline" size="sm" @click="fileInput?.click()">
        <UploadIcon class="size-4" />
        Загрузить txt-файл
      </Button>
      <input
        ref="fileInput"
        type="file"
        accept="text/plain,.txt,.csv"
        class="hidden"
        @change="handleFileChosen"
      />
    </div>

    <FormField v-slot="{ id }" label="Список аккаунтов">
      <Textarea
        :id="id"
        v-model="raw"
        rows="12"
        autocomplete="off"
        spellcheck="false"
        class="font-mono text-xs"
        placeholder="example@gmail.com:password&#10;second@outlook.com:qwerty123"
      />
    </FormField>

    <p v-if="raw.trim()" class="text-muted-foreground text-xs">
      Готово к добавлению: <span class="text-foreground">{{ result.drafts.length }}</span>
      <template v-if="result.duplicates.length">
        · дубликатов пропущено: {{ result.duplicates.length }}
      </template>
      <template v-if="result.invalid.length">
        · <span class="text-destructive">строк с ошибкой: {{ result.invalid.length }}</span>
      </template>
    </p>
  </FormDialog>
</template>
