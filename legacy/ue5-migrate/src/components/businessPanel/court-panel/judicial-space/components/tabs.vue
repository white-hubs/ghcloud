<template>
  <div class="tabs">
    <div :class="['tab', props.active===item.value && 'active']" @click="handleClick(item)"
      v-for="item in props.tabsList" :key="item.value">
      {{ item.label }}
    </div>
  </div>
</template>

<script setup lang='ts'>
/**
 * tab 切换
 * props:{
 *   tabsList:[{label:string,value:string}],  数据源
 *   active:string    当前选中的tab
 * }
 * emit事件
 *    change:(value:string,item:{label:string,value:string})  切换tab时触发的事件
 */
import { reactive, toRefs, onMounted,PropType } from 'vue';
const props = defineProps({
  tabsList:{
    type: Array as PropType<{label:string,value:string,disabled?:boolean}[]> ,
    default: () => []
  },
  disabled:{
    type: Boolean,
    default: false
  },
  active: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['update:active','change'])
const handleClick=(item)=>{
  if(props.disabled) return
  if(item.disabled) return
  emit('update:active',item.value)
  emit('change',item.value,item)
}
/**
* 数据部分
*/
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
.tabs {
  display: flex;
  align-items: center;
  gap: 6px;

  .tab {
    padding: 5px 8px;
    cursor: pointer;
    background: rgba(41, 137, 255, 0.40);
    border-radius: 2px;
    font-size: 12px;
    font-family: Source Han Sans CN, Source Han Sans CN-Regular;
    font-weight: Regular;
    text-align: justify;
    color: #c5dbff;
    border: 1px solid rgba(41, 137, 255, 0.40);

    &.active {
      color: #c5dbff;
      background: rgba(41, 137, 255, 0.60);
      border: 1px solid #2989ff;
    }
  }
}
</style>