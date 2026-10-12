<template>
  <div>
    <patrolStatistics></patrolStatistics>
    <SubPanelTemplate title="今日巡更时段分布">
      <div class="chart">
        <LineChart :unit="{x:'',y:''}" :gridTop="'5'" :x-data="xData" :series="[
            {
              data: yDataTrend,
              linearGradientColor: ['rgb(86, 142, 255)', 'rgb(86, 142, 255,0)'],
            },
          ]" />
      </div>
    </SubPanelTemplate>
   <rankingPatrolPersonnel></rankingPatrolPersonnel>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import { patrolTodayTimeFrame } from '@/api/door';
import patrolStatistics from "./components/patrolStatistics.vue";
import rankingPatrolPersonnel from "./components/rankingPatrolPersonnel.vue";

const xData = ref<string[]>([]);
const yDataTrend = ref<number[]>([]);

const getPatrolTodayTimeFrame = async () => {
  const res = await patrolTodayTimeFrame({type:'TODAY'})
  xData.value = []
  yDataTrend.value = []
   res.forEach((e)=>{
    xData.value.push(e.key)
    yDataTrend.value.push(e.value)
   })
}

onMounted(()=>{
  getPatrolTodayTimeFrame()
})
</script>
<style lang="less" scoped>
.environment-box {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;

  .environment-item {
    background: rgba(142, 172, 206, 0.1);
    padding: 4px;
    padding: 10px 10px;

    .environment-item-title {
      font-size: 16px;
      color: #fff;
    }

    .environment-item-box {
      display: flex;

      .environment-item-value,
      .environment-item-unit {
        color: #fff;
        margin: auto;
        font-size: 14px;
      }

      .environment-item-unit {
        color: #fff;
        margin: auto;
        font-size: 18px;
      }
    }
  }
}

.chart {
  height: 250px;
}
</style>