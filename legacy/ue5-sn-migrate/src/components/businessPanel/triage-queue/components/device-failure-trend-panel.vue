<template>
  <SubPanelTemplate title="设备故障趋势">
    <template #extra>
      <DateInlineForm v-model:modelValue="trend" @search="alarmTrendInfo">
      </DateInlineForm>
    </template>
    <LineChart :x-data="xData.arr" :series="series" :showLegend="false"
      gridTop="20" :unit="{ x: '', y: '次' }" />
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { ModelValueItf } from "../../public/types";
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
import { alarmTrend } from '@/utils/requestData/alarm'
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();

/**
 * 设备故障趋势
 */
const trend = ref<ModelValueItf>();
  const xData = reactive({
  arr: ["1时", "2时", "3时", "4时", "5时"],
});
const series = reactive([
  {
    data: [],
    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
  },
]);
  const alarmTrendInfo = async () => {
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: trend.value.dateRange.join(","),
    type: trend.value.timeType,
  };
  let res: any = await alarmTrend(param);
  xData.arr = res.xdata;
  series[0].data = res.ydata;
};



let timer = null

onMounted(() => {
  
})
onUnmounted(() => {
  clearInterval(timer)
})
</script>
<style scoped lang="less"></style>