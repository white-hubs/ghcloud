<template>
  <div>
    <SubPanelTemplate title="今日人员清点">
      <div class="appointment-statistics">
        <div class="statistics-item" v-for="item in reservationData" :key="item.title">
          <div class="statistics-box">
            <div class="monitorPanel-left">
              <div class="bg">
                <img :src="getAssetsImage('overView4.png')" alt="" />
                <img class="rotate aniamtion-electric-fan" :src="getAssetsImage('overView13.png')" alt="" />
              </div>
            </div>
            <div class="monitorPanel-right">
              <div class="statistics-value">{{ item.value }}</div>
              <div class="statistics-title">{{ item.title }}</div>
            </div>
          </div>
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="今日异常监区排行榜">
      <div class="chart">
        <barChart :title="'人'" :unit="'人'" :x-data="alarmType.xData"
          :data="[{ color: '#1890FF', name: '', data: alarmType.yData }]" class="columnBox" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="实到人数趋势图">
      <div class="echart">
        <LineChart :x-data="xData" :series="yData" :showLegend="true" :showBackground="true" :titles="titles" gridTop="15"
          :unit="{ x: '', y: '人次' }" :axisPointer="true" />
      </div>
    </SubPanelTemplate>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { getAssetsImage } from "@/utils/getImage"
import { taskAbnormalRank, taskAttendedTrend, taskTodayCount } from "@/api/securitymanagement";
import barChart from "@/components/businessPanel/public/charts/bar/barChart.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";

const reservationData = ref([
  {
    title: "未到人数",
    value: 100,
  },
  {
    title: "应到人数",
    value: 100,
  }
])
const alarmType = reactive({
    xData: [],
    yData: []
})
const xData = ref<string[]>([])
const titles = []
const yData = ref<{name:string; data: number[]; linearGradientColor?:string[];lineColor?:string; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>([
  {
    name: '进入',
    data: [],
    smooth: true,
    symbolSize: 8,
    showSymbol: false,
    lineColor: '#2989FF',
    linearGradientColor: ['#2AE8BD', '#2989FF']
  }
])
const getTaskTodayCount = async ()=>{
  const res =  await taskTodayCount()
  reservationData.value[0].value = res.expectedCount
  reservationData.value[1].value = res.unattendedCount
}
const getTaskAbnormalRank = async ()=>{
  const res =  await taskAbnormalRank({type:'TODAY'})
  alarmType.xData = res.map(item=>item.locationName)
  alarmType.yData = res.map(item=>item.unattendedCount)
}
const getTaskAttendedTrend = async ()=>{
  const res = await taskAttendedTrend({type:'THIS_YEAR'})
  xData.value = res.map(item=>item.date)
  yData.value[0].data = res.map(item=>item.attendedCount)
 
}
onMounted(()=>{
  getTaskTodayCount()
  getTaskAbnormalRank()
  getTaskAttendedTrend()
})
</script>
<style lang="less" scoped>
.appointment-statistics {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 20px 0;

  .statistics-item {
    width: 108px;
    height: 224px;
    background: rgba(9, 25, 46, 0.03);
    border: 1px solid;
    border-image: linear-gradient(133deg, rgba(120, 179, 255, 0.10) 6%, rgba(70, 150, 255, 0.12) 14%, rgba(46, 113, 196, 0.31) 99%) 1 1;
    padding: 4px;

    .statistics-box {
      width: 100px;
      height: 216px;
      background: rgba(2, 2, 36, 0.20), radial-gradient(rgba(0, 0, 0, 0.00), rgba(0, 0, 0, 0.00) 64%, rgba(23, 57, 97, 0.30));
      border: 1px solid;
      border-image: linear-gradient(299deg, rgba(86, 143, 212, 0.10) 5%, rgba(255, 255, 255, 0.00) 52%, rgba(39, 109, 208, 0.30) 82%) 1 1;
      backdrop-filter: blur(1px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;

      .monitorPanel-left {
        .bg {
          position: relative;
          width: 100px;
          height: 80px;
          perspective: 200;

          img {
            width: 100%;
            height: 100%;
          }

          .rotate {
            position: absolute;
            width: 35px;
            height: 35px;
            left: 35px;
            top: 8px;
            transform: rotateY(45deg);
          }
        }
      }

      .monitorPanel-right {
        color: #fff;

        .statistics-value {
          font-size: 24px;
          font-weight: Regular;
          text-align: center;
        }

        .statistics-title {
          margin-top: 10px;
          font-size: 12px;
          text-align: center;
        }
      }
    }
  }
}
.chart{
  height: 280px;
}
.echart{
  height: 280px;
}
</style>