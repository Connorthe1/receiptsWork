<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import FormDialog from '@/components/shared/FormDialog.vue'
import FormField from '@/components/shared/FormField.vue'
import { Textarea } from '@/components/ui/textarea'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{ existing: string[] }>()
const emit = defineEmits<{ import: [texts: string[]] }>()

const raw = ref('')

watch(open, (isOpen) => {
  if (isOpen) raw.value = ''
})

/** One code per line; blank lines are skipped, and so is a code this block already holds. */
const result = computed(() => {
  const seen = new Set(props.existing)
  const texts: string[] = []
  let duplicates = 0

  for (const rawLine of raw.value.split(/\r?\n/)) {
    const text = rawLine.trim()
    if (!text) continue

    if (seen.has(text)) {
      duplicates++
      continue
    }

    seen.add(text)
    texts.push(text)
  }

  return { texts, duplicates }
})

function handleSubmit() {
  if (result.value.texts.length === 0) {
    toast.error('Не нашлось ни одного нового кода')
    return
  }

  emit('import', result.value.texts)
  open.value = false
}
</script>

<template>
  <FormDialog
    v-model:open="open"
    title="Добавить списком"
    description="Одна строка — один код. Тег при таком добавлении не присваивается."
    :submit-label="result.texts.length ? `Добавить (${result.texts.length})` : 'Добавить'"
    @submit="handleSubmit"
  >
    <FormField v-slot="{ id }" label="Список кодов">
      <Textarea
        :id="id"
        v-model="raw"
        rows="12"
        autocomplete="off"
        spellcheck="false"
        class="font-mono text-xs"
        placeholder="A1B2-C3D4&#10;123456"
      />
    </FormField>

    <p v-if="raw.trim()" class="text-muted-foreground text-xs">
      Готово к добавлению: <span class="text-foreground">{{ result.texts.length }}</span>
      <template v-if="result.duplicates">
        · дубликатов пропущено: {{ result.duplicates }}
      </template>
    </p>
  </FormDialog>
</template>
