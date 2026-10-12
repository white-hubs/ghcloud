<template>
    <img class="sign_img" v-if="path" :src="path"/>
    <span v-else>{{ errTxt }}</span>   
</template>

<script setup lang="ts">
import { processService } from '../../../service/process/process'
import { computed, onMounted, reactive, ref } from 'vue'
const props = withDefaults(defineProps<{
    sign: string, // sign | id
    errTxt: string,
    isPublic:boolean
}>(),{
    sign: '',
    errTxt: '',
    isPublic:false
})
const path = ref()
onMounted(async ()=>{
   // 获取签名图片
  if (!props.sign) return
  const file =props.isPublic? await processService.getPublicFile(props.sign):  await processService.getFile(props.sign)
  path.value = file.path
})

</script>

<style scoped>
.sign_img{
    height: 40px;
    max-width: 100%;
}
</style>