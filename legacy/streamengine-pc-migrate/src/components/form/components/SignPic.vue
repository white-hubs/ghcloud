<template>
  <img :src="imgSrc" v-if="imgSrc && props.signId" />
</template>
<script setup lang="ts">
import { getFileByID } from '@/api/file';
import { onMounted, ref } from 'vue';

const props = withDefaults(defineProps<{
  signId: string | number
}>(), {
  signId: ''
})

const imgSrc = ref('')

onMounted(async () => {
  const res = await getFileByID({ id: props.signId })
  fetchImage(res.path)
})
const fetchImage=async (path: string)=>{
  const res = await fetch(path)
  if(res.status!==200){
    imgSrc.value = ''
    return
  }
  imgSrc.value=path  
}
</script>
<style scoped>
img {
  width: 100px;
}
</style>