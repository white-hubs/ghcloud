<!-- 物业收入对比 -->
<template>
  <SubPanelTemplate>
    <div class="chart">
        <LineChart :x-data="xDataGas" :series="yDataGas" :showLegend="true" :showBackground="true" :titles="titles"
          gridTop="15" :unit="{x:'',y:'元'}" :axisPointer="true" />
      </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";

const titles = ['收入','支出']


const xDataGas = ref<string[]>([1,2,3,4,5,6])
const yDataGas = ref<{name:string; data: number[]; linearGradientColor?:string[];lineColor?:string; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>([
  {
    name:'收入',
    data:[1,2,3,4,5,6]
  },
  {
    name:'支出',
    data:[6,5,4,3,2,1]
  },
])
</script>
<style lang="less" scoped></style>