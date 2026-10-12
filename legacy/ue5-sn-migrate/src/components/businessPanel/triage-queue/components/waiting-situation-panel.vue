<template>
  <SubPanelTemplate title="候诊情况">
    <div class="chart">
        <overviewChartBar :title="'人次'" :xData="barData.xData" :yData="barData.yData" :x-font-size="10.5"></overviewChartBar>
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { onMounted,reactive } from 'vue';
import overviewChartBar from "../../hospital/overview-chartBar.vue"
import { waitingSituation } from '@/api/consultation-data'
import { storeMenu } from '@/piniaStore/menu'
import { storeArea } from '@/piniaStore/area'
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();

/**
 * 候诊情况
 */
const barData = reactive({
    xData: [],
    yData: [
        {
            data: [],
            name: '',
            color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
        }
    ]
})
//候诊情况
const getWaitingSituation=async()=>{
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
  };
const res=await waitingSituation(params)

res.forEach(item=>{
  barData.xData.push(item.timeFlag)
  item.visitNum? barData.yData[0].data.push(item.visitNum):barData.yData[0].data.push(0)
})
}
onMounted(() => {
  getWaitingSituation()
})
</script>
<style scoped lang="less">
.chart {
    height: 220px;
}
</style>