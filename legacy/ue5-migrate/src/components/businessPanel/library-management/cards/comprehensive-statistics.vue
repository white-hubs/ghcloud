<template>
  <SubPanelTemplate>
    <div :style="{ height: px2rem(chartHeight + 'px') }">
      <pieGuidance :height="'80%'" position="inside" :radius="['0%', '80%']" :y-data="yData"></pieGuidance>
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import pieGuidance from "@/components/businessPanel/public/charts/pie/pie-guidance.vue"
import { px2rem } from '@/utils/common'
import { ref } from 'vue'
import { onMounted } from 'vue'
import { tidyUpStatisticsPage } from "@/api/library-management";

const chartHeight=220
const yData = ref([
    { name: '待编目', value: 0, itemStyle: { color: "#EF424A" } },
    { name: '待接收', value: 0, itemStyle: { color: "#19F8F7" } },
    { name: '已接收', value: 0, itemStyle: { color: "#328BF7" } },
    { name: '典藏退回', value: 0, itemStyle: { color: "#FFC700" } },
])
const getTidyUpStatisticsPage = async()=>{
    const wait = await tidyUpStatisticsPage({status:0})
    const toAccepted = await tidyUpStatisticsPage({status:1})
    const accepted = await tidyUpStatisticsPage({status:2})
    const returnAccepted = await tidyUpStatisticsPage({status:3})
    yData.value[0].value = wait.total
    yData.value[1].value = toAccepted.total
    yData.value[2].value = accepted.total
    yData.value[3].value = returnAccepted.total
}
onMounted(async()=>{
  getTidyUpStatisticsPage()
})
</script>