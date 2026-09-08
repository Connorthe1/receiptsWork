<script setup lang="ts">
import AddressBlock from '@/components/blocks/addresses/AddressBlock.vue'
import PaymentCardsBlock from '@/components/blocks/cards/PaymentCardsBlock.vue'
import EmailBlock from '@/components/blocks/emails/EmailBlock.vue'
import ImportantInfoBlock from '@/components/blocks/important/ImportantInfoBlock.vue'
</script>

<template>
  <div class="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-5">
    <EmailBlock class="xl:col-span-3" />
    <ImportantInfoBlock class="xl:col-span-2" />
    <AddressBlock class="xl:col-span-3" />
    <PaymentCardsBlock class="xl:col-span-2" />
  </div>
</template>
