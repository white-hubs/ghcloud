<template>
  <SubPanelTemplate title="科室使用量top5">
    <template #extra>
      <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
    </template>
    <div class="body chart" :style="{ height: px2rem(chartHeight + 'px') }">
      <EventAlarmItem
        v-for="(item, index) in listData"
        :sort="index + 1"
        :name="item.label"
        :count="item.value"
        :ratio="item.ratio.toFixed(2) + '%'"
        :modes="'次'"
      />
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import EventAlarmItem from "@/components/businessPanel/public/eventAlarmItem.vue";
import { onMounted, onUnmounted, ref } from 'vue';
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { getOfficeUseTop } from "@/mock/medical-gas"
import { px2rem } from '@/utils/common';

const props = withDefaults(defineProps<{
  fromPage: FromPageType;
  chartHeight?: number;
}>(), {
  fromPage: 'PARK',
  chartHeight: 300
})
const trendTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
const chartData = ref<{ label: string; value:number;}[]>([]);
const listData = ref<{ label: string; value: number; ratio: number; }[]>([])

const getTemplateData = () => {
  // TODO  接口调用
  const { timeType } = trendTime.value
  chartData.value = getOfficeUseTop({formPage: props.fromPage, timeType: timeType as TimeType})
  
  // const total = chartData.value.reduce(function (total, value) {
  //   return total + value.value;
  // }, 0);
  listData.value = chartData.value.map(e => {
    return {
      ...e,
      ratio: e.value
      // ratio: e.value / total
    }
  })
}

// 模拟动态数据
let timer = null
let timeList = ['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_YEAR']
let index = 1
const changeTime = () => {
  timer = setInterval(() => {
    trendTime.value.timeType = timeList[index]
    getTemplateData()
    index++;
    if (index > timeList.length - 1) {
      index = 0
      // return
    }
  }, window.config.pageLoopRequestTime)
}

onMounted(() => {
  getTemplateData()
  changeTime()
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>
<style scoped lang="less">
.eventAlarmItem{
  margin-bottom: 15px !important;
}
.h300{
  height: 300px;
}
:deep(.eventAlarmItem:nth-child(1) .top .left .sort){
  background: rgba(241,69,69,0.302);
  border: 1px solid #F14545;
  color: #fff;
}
:deep(.eventAlarmItem:nth-child(2) .top .left .sort){
  background: rgba(255,171,16,0.3);
  border: 1px solid #FFAB10;
  color: #fff;
}
:deep(.eventAlarmItem:nth-child(3) .top .left .sort){
  color: #fff;
  background: rgba(50,142,255,0.2);
  border: 1px solid #2989FF;
}
</style>