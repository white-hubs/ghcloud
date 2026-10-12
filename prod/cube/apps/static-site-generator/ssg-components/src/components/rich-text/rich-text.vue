<template>
  <section 
    v-if="content"
    class="w-full"
    :class="background === 'gray' ? 'bg-[#fbfdff]' : 'bg-white'"
    v-html="content"
  />
</template>

<script setup lang="ts">
interface Props {
  content: string
  background?: 'white' | 'gray'
}

withDefaults(defineProps<Props>(), {
  background: 'white'
})
</script>
