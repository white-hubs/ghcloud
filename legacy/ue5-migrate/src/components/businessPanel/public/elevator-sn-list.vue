<template>
  <div class="alarm-analysis">
    <div
      class="alarm-analysisBox"
      v-for="(item, index) in contentList"
      @click="handlecurrent(item)"
    >
      <div class="alarm-analysis-left">
        <div class="alarm-analysis-color" :style="{ background: item.color }"></div>
        <div class="alarm-analysis-name" :title="item.name">{{ item.name }}</div>
      </div>
      <div>{{ countNum(item.value) }}</div>
      <!-- <div v-if="item.ratio">{{ item.ratio }}</div> -->
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, reactive, toRefs, onMounted, computed } from "vue";
const emit = defineEmits(["handlecurrent"]);
interface list {
  name: string;
  value: number | string;
  color: string;
  ratio?: string;
}
interface Props {
    contentList: list[];
    showRatio?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    showRatio: true
});
const countNum = computed(()=>(value:number|string)=>{
    let num=0
    props.contentList.forEach(item=>{
        num+=Number(item.value) 
    })
    if(props.showRatio) {
        return (Math.round( Number(value)/num * 10000) / 100).toFixed(0) + "%"  ;
    }else{
        return value;
    }
})
  

const handlecurrent = (item) => {
  emit("handlecurrent", item);
};
</script>
<style scoped lang="less">
.alarm-analysis {
  display:flex;
  justify-content:space-between;

  flex-wrap:wrap;

  z-index:9;
  font-size: 14px;
  width: 250px;
  color: #fff;
  color:rgba(165, 182, 218, 1);
  
cursor: pointer;
.alarm-analysisBox{
  // display:flex;
  width: 100px;

}
  .alarm-analysisBox,
  .alarm-analysis-left {
    // margin-left:10px;
   
    display: flex;
    align-items: center;
    justify-content: space-between;

    .alarm-analysis-name {
      width: 80px;
      overflow: hidden;
      color: #d9e7ff;
      /*内容会被修剪，并且其余内容是不可见的*/
      text-overflow: ellipsis;
      /*显示省略符号来代表被修剪的文本。*/
      white-space: nowrap;
      /*文本不换行*/
    }

    .alarm-analysis-color {
      width: 10px;
      height: 10px;
      background: #306cca;
      margin-right: 6px;
    }
  }

  .alarm-analysisBox {
    margin-bottom: 10px;
  }
}
</style>
