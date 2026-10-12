<template>
  <SubPanelTemplate :title="props.title">
    <template #extra>
      <div>
        <DateInlineForm v-model:modelValue="topTimeFrame" @search="changeTopTimeFrame"></DateInlineForm>
      </div>
    </template>
    <div class="chart" v-if="pieData.length">
      <RoundPie :pieData="pieData" :unit="'天'" />
    </div>
    <noData class="chart" v-else></noData>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import RoundPie from "@/components/businessPanel/medical-gas/components/round-pie.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import { environmentalStatPieGraph } from '@/api/securitymanagement'

const props = withDefaults(defineProps<{
title?: string;
}>(), {
title: '空气质量统计'
})
const topTimeFrame = ref({
timeType:'THIS_YEAR',
dateRange:[]
});
const colorList = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A"];
const pieData = ref([
  {
    name:'优',
    value:10,
    color:'#328BF7',
  },
  {
    name:'良',
    value:10,
    color:'#19F8F7',
  },
  {
    name:'轻度污染',
    value:10,
    color:'#FFC700',
  },
  {
    name:'中度污染',
    value:10,
    color:'#FF7A00',
  },
  {
    name:'重度污染',
    value:10,
    color:'#EF424A',
  },
  {
    name:'严重污染',
    value:10,
    color:'#FF0000',
  },
])

const changeTopTimeFrame = async ()=>{
  const res = await environmentalStatPieGraph({periodType:topTimeFrame.value.timeType})
  pieData.value = res.map(e=>{
    return {
      name:e.describe,
      value:e.number,
    }
  })
}
</script>
<style lang="less" scoped>
.chart{
  height: 300px;
}
</style>