<template>
  <div  :class="`alarm-analysis ${props.warperClassName}`">
    <div class="alarm-analysisBox" v-for="(item, index) in contentList" @click="handleCurrent(item)">
      <div class="alarm-analysis-left">
        <div class="alarm-analysis-color" :style="{ background: item.color }"></div>
        <div class="alarm-analysis-name" :title="item.name" @click="(e)=>{ handleName(item) }">{{ item.name }}</div>
      </div>
      <div v-if="showNumber" class="alarm-analysis-right">{{ item.value }}{{ unit }}</div>
      <div v-if="showRatio" @click="(e)=>{ handleValue(item) }">{{ countNum(item.value) }}</div>
    </div>
  </div>
</template>
 
<script setup lang="ts">
import { computed, ref, watch } from "vue";
const emit = defineEmits(["handlecurrent", "clickName", "clickValue"]);
interface list {
  name: string;
  value: number | string;
  color: string;
  ratio?: string;
  code?: string;
}
interface Props {
    contentList: list[];
    showRatio?: boolean;
    warperClassName?: string;
    showNumber?: boolean;
    unit?: string;
}
const props = withDefaults(defineProps<Props>(), {
    showRatio: false,
    warperClassName: "",
    showNumber: true,
    unit: "个"
});

const countNum = (value:number|string)=>{
    let num=0
    contentList.value.forEach(item=>{
        num+=Number(item.value) 
    })
    if(props.showRatio) {
        return value?(Math.round( Number(value)/num * 10000) / 100).toFixed(1) + "%":value+'%'  ;
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
const handleName = (item) => {
  emit("clickName", item);
};
const handleValue = (item) => {
  emit("clickValue", item);
};
</script>
<style scoped lang="less">
.alarm-analysis {
  z-index: 9;
  font-size: calc(var(--font-size-scale) * 14px);
  width: 100%;
  color: #fff;
  max-height: 100%;
  overflow-y: auto;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  .alarm-analysisBox {
    width: calc(var(--font-size-scale) * 100px);
    width: 100%;
    overflow: auto;
  }
.alarm-analysis-right{
  color:#fff;
  white-space: nowrap;
  margin-right: 10px;
} 
  .alarm-analysisBox,
  .alarm-analysis-left {

    display: flex;
    align-items: center;
    justify-content: space-between;
    height:100%;
    .alarm-analysis-name {
      // width: calc(var(--font-size-scale) * 65px);
      width: auto;
      // height:100%;
      overflow: hidden;
      color: #fff;
      /*内容会被修剪，并且其余内容是不可见的*/
      text-overflow: ellipsis;
      /*显示省略符号来代表被修剪的文本。*/
      white-space: nowrap;
      /*文本不换行*/
      // display: flex;
      // align-items: center;
    }

    .alarm-analysis-color {
      width: calc(var(--font-size-scale) * 10px);
      height: calc(var(--font-size-scale) * 10px);
      background: #306cca;
      margin-right: 6px;
    }
  }

  .alarm-analysisBox {
    margin-bottom: 10px;
  }
}
</style>
