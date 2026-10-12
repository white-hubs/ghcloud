<template>
  <CountTo :startVal="startVal" :endVal="props.endVal" :duration="props.duration" :separator="props.separator"
    class="gh-count-to" :decimals="props.decimals"></CountTo>
</template>
<script setup lang="ts">
import { CountTo } from "vue3-count-to";
import { ref, watch } from 'vue';

interface Props {
  startVal: number;
  endVal: number;
  duration: number;
  separator: string;
  decimals: string | number;
}
const props = withDefaults(defineProps<Props>(), {
  startVal: 0,
  endVal: 0,
  duration: 2000,
  separator: ',',
  decimals: 0
})

watch(() => props.endVal, () => {
  setTimeout(() => {
    startVal.value = props.endVal
  }, props.duration)
}, {
  immediate: true
})

const startVal = ref(props.startVal ?? 0)

</script>
<style scoped>
.gh-count-to {
  font-family: 'robotoMedium';
}
</style>