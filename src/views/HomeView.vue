<script setup lang="ts">
import AddressBlock from '@/components/blocks/addresses/AddressBlock.vue'
import PaymentCardsBlock from '@/components/blocks/cards/PaymentCardsBlock.vue'
import EmailBlock from '@/components/blocks/emails/EmailBlock.vue'
import ImportantInfoBlock from '@/components/blocks/important/ImportantInfoBlock.vue'
import LinksBlock from '@/components/blocks/links/LinksBlock.vue'
</script>

<template>
  <div class="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-5">
    <div class="flex min-w-0 flex-col gap-5 xl:col-span-3">
      <EmailBlock />
      <AddressBlock />
    </div>

    <div class="flex min-w-0 flex-col gap-5 xl:col-span-2">
      <ImportantInfoBlock />
      <LinksBlock />
      <PaymentCardsBlock />
    </div>
  </div>
</template>
