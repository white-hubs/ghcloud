<template>
  <SubPanelTemplate title="月度编目工作量统计">
    <div :style="{ height: px2rem(chartHeight + 'px') }">
      <overviewChartBar :title="'人次'" :xData="month.xData" :yData="month.yData" :x-font-size="10.5"></overviewChartBar>
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import {  reactive, ref,onMounted } from 'vue';
import { px2rem } from '@/utils/common'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue"
import { ModelValueItf } from '../../public/types'
import { tidyUpRecordTrend } from "@/api/library-management";
import moment from 'moment'
const chartHeight=220
const month=reactive({
  xData:[],
  yData:[
  {
    data:[],
  }
]
})
const getTidyUpRecordTrend = async ()=>{
  const res = await tidyUpRecordTrend({period:[moment().startOf("month").format('YYYY-MM-DD 00:00:00'), moment().endOf("months").format("YYYY-MM-DD HH:mm:ss")].join(",")})
  month.xData = res.map(e=>e.key)
  month.yData[0].data = res.map(e=>e.value)
}
onMounted(()=>{
  getTidyUpRecordTrend()
})
</script>