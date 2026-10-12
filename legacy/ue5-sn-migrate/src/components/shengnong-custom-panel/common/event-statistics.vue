<template>
  <div class="wrapper">
    <a-tabs v-if="showTabs" v-model:activeKey="activeKey" @change="changeTimeRisk">
      <a-tab-pane key="ALARM_ALL" tab="报警数"></a-tab-pane>
      <a-tab-pane key="ALARM_HANDLER" tab="处理数" force-render></a-tab-pane>
    </a-tabs>
    <div class="more" @click="moreClick">查看更多></div>
    <div style="width: 100%; overflow: hidden;" v-if="dataList.length !== 0">
      <vue3-seamless-scroll v-if="isScroll" :list="dataList" :step="0.5"
        hover :singleHeight="40">
        <EventAlarmItem v-for="(item, index) in dataList" :sort="item.rank" :linkRatio="Number(item.chainRatio)" :count="item.totalNum"
          :name="item.marketName" :width="Number(item.width)" @click="clickRow(item)"></EventAlarmItem>
      </vue3-seamless-scroll>
      <div v-else>
        <EventAlarmItem v-for="(item, index) in dataList" :sort="item.rank" :linkRatio="Number(item.chainRatio)" :count="item.totalNum"
          :name="item.marketName" :width="Number(item.width)" @click="clickRow(item)"></EventAlarmItem>
      </div>
    </div>
    <noData v-else />
  </div>
</template>
<script setup lang="ts">
import { ref,watch,PropType } from 'vue'
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";
import { storeMarket } from '@/piniaStore/other'
import {  getcurrentData } from "@/utils/common";
import EventAlarmItem from "./snEventItem.vue";
import noData from "@/components/businessPanel/public/noData.vue";

interface DataType{
  marketName:string;
  totalNum:number;
  name:string;
  chainRatio:string;
  rank:number;
  width:number;
}
const props = defineProps({
  data: {
    type: Array as PropType<DataType[]>,
    default: () => []
  },
  isScroll: {
    type: Boolean,
    default: false
  },
  showTabs: {
    type: Boolean,
    default: true
  }

});
const activeKey = ref("ALARM_ALL");
const isScroll=ref(props.isScroll)
const dataList = ref<DataType[]>(props.data);
const emit = defineEmits(["changeTabs","clickRow",'moreClick']);

const changeTimeRisk = async () => {
  emit('changeTabs', activeKey.value)
};
const clickRow = (record) => {
  emit('clickRow', record)
};
const moreClick=()=>{
emit('moreClick')
}
watch(
  () => props.data,
  (n) => {
    dataList.value = n;
  },
  {
    immediate: true,
  }
)
</script>

<style lang="less" scoped>
.wrapper{
  width:100%
}
:deep(.ant-tabs){
    height: 28px;
    font-size: 16px !important;
  }
:deep(.ant-tabs-nav .ant-tabs-tab){
  display:block;
  margin: 0px 10px;
  padding:0px;
  color: #93AADB;
}
:deep(.ant-tabs-tab-active) {
  border-bottom: 1px solid #6194F7;
  background: linear-gradient(180deg,rgba(97,148,247,0.02), rgba(97,148,247,0.50) 96%);
  color: #6194F7;
}
:deep(.ant-tabs-top > .ant-tabs-nav){
  margin:0px;
}
.more {
  color:#93AADB;
  font-size: 14px;
  text-align: right;
  margin:4px;
  cursor: pointer;
}
</style>
