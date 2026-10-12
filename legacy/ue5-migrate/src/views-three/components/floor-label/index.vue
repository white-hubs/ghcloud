<template>
  <div class="floor-label">
    <div class="name">{{ props.name }}</div>
  </div>
</template>

<script setup lang='ts'>
import { reactive, toRefs, onMounted } from 'vue';
/**
* 数据部分
*/
const props=defineProps({
  name:{
    type:String,
    default:()=>'名称'
  },
  id:{
    type:String,
    default:''
  }
})
const state = reactive({})
onMounted(() => {
})
// 使用toRefs解构
// let { } = { ...toRefs(state) } 
defineExpose({
  ...toRefs(state)
})

</script>
<style scoped lang='less'>
.floor-label {
  // width: 200px;
  padding: 0px 10px 20px; 
  // height: 80px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: relative;
  background-image: url('/resource/v1/ue5-migrate/views-three/components/floor-label/floor-label.png');

  .name {
    text-align: center;
    font-size: 14px;
    
    color: #fff;
  }
}
</style>