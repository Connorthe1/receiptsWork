<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { CheckIcon } from '@lucide/vue'
import { reactiveOmit } from '@vueuse/core'
import {
  CheckboxIndicator,
  CheckboxRoot,
  useForwardPropsEmits,
} from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<CheckboxRootProps & {
  class?: HTMLAttributes['class']
}>()

const emits = defineEmits<CheckboxRootEmits>()

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <CheckboxRoot
    data-slot="checkbox"
    v-bind="forwarded"
    :class="cn(
      'border-input dark:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground data-checked:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs focus-visible:ring-3 peer relative inline-flex items-center justify-center transition-all outline-none after:absolute after:-inset-x-2 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50',
      props.class,
    )"
  >
    <CheckboxIndicator
      data-slot="checkbox-indicator"
      class="flex items-center justify-center text-current"
    >
      <slot>
        <CheckIcon class="size-3" />
      </slot>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
