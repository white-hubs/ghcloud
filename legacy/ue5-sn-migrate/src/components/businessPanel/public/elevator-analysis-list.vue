<template>
  <div class="alarm-analysis">
    <div class="alarm-analysisBox" v-for="(item, index) in contentList" @click="handleCurrent(item)">
      <div class="alarm-analysis-left">
        <div class="alarm-analysis-color" :style="{ background: item.color }"></div>
        <div class="alarm-analysis-name" :title="item.name">{{ item.name }}</div>
      </div>
      <div>{{ countNum(item.value) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
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

const countNum = (value:number|string)=>{
    let num=0
    contentList.value.forEach(item=>{
        num+=Number(item.value) 
    })
    if(props.showRatio) {
      return value?Math.round( Number(value)/num * 10000 / 100) + "%":value+'%'  ;
    }else{
        return value;
    }
}

const contentList = ref([])
watch(() => props.contentList,() => {
  contentList.value = props.contentList
},{deep: true, immediate:true});

const handleCurrent = (item) => {
  emit("handlecurrent", item);
};
</script>
<style scoped lang="less">
.alarm-analysis {
  z-index: 9;
  font-size: 14px;
  width: 100%;
  color: #fff;
  height: 180px;
  overflow-y: auto;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .alarm-analysisBox {
    width: 188px;
    background: linear-gradient(0deg,rgba(104,123,164,0.16) 1%, rgba(110,143,214,0.00) 65%);
    border-bottom: 1px solid;
    border-image: linear-gradient(307deg, rgba(29,50,85,0.00), rgba(65,135,255,0.90) 62%, rgba(0,0,0,0.00) 89%) 1 1;
  }

  .alarm-analysisBox,
  .alarm-analysis-left {

    display: flex;
    align-items: center;
    justify-content: space-between;

    .alarm-analysis-name {
      width: 65px;
      overflow: hidden;
      color: #fff;
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
    margin-bottom: 5px;
    height: 36px;
  }
}
</style>
