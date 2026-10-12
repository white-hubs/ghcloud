<template>
  <div >
    <SubPanelTemplate title="空间利用率" class="alarm-event">
      <div class="equipmentInfo">
        <div class="deviceList">
          <div class="device-box" v-for="item in dataList">
            <span>{{ item.title }}</span>
            <span style="margin-left: 4px;">
              <count-to :startVal="0" :endVal="item.value" :duration="4000"></count-to>
              <span class="unit">{{ item.unit }}</span>
            </span>
          </div>
        </div>
        <waterPolo title="" :value="alarmRateData.proportion" unit="%" bgColor="#2989FF" color="#2989FF">
        </waterPolo>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="楼栋空间利用率" class="alarm-event">
      <div class="charts">
        <stackedColumn :xData="buildUtilization.xData" :yData="buildUtilization.yData"></stackedColumn>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="租赁企业行业情况统计" class="alarm-event">
      <div class="flex-between mg-10">
        <PlanPie :pieData="levelPieData">
          <div class="content">
            <div class="pie-center">{{ throughNum }}</div>
            <div>通行总数</div>
          </div>
        </PlanPie>
        <PieList :roundPieData="levelPieData"></PieList>
      </div>
      <RollTable :column="columns" :data="industryStatistics" :showLength="8"> </RollTable>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import waterPolo from "../public/charts/waterPolo/waterPolo.vue";
import CountTo from "../public/count-to/count-to.vue";
import stackedColumn from "../public/charts/stacked-column/stackedColumn.vue";
import SubPanelTemplate from "../../equipmentPanel/businessPanel/public/subPanelTemplate.vue";
import { AlarmRate } from '@/api/models/alarm'
import PlanPie from "../public/charts/pie/planePie.vue";
import PieList from "../public/pieList.vue";
import RollTable from "../public/rollTable/index.vue";
import { buildingUtilizationRate, statisticsEnterprises, utilizationRate } from '@/api/park'

let alarmRateData = reactive<AlarmRate>({
  proportion: 0,
  deviceTotal: "",
  alarmNum: "",
  chainRatio: "",
});
const dataList = reactive([
  {
    title: "总面积",
    value: 0,
    unit: "㎡",
  },
  {
    title: "可用面积",
    value: 0,
    unit: "㎡",
  },
]);
const buildUtilization = reactive({
  xData: ['1','2','3','4','5','6','7'],
  yData: [
    {
      name:'使用面积',
      data:[1,2,3,4,5,6,7]
    },{
      name:'停用面积',
      data:[10,12,3,4,15,16,7]
    },
  ],
})
const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
const levelPieData = ref([])
const columns = ref([
  {
    title: "行业类型",
    dataIndex: "industry",
    width: 120,
  },
  {
    title: "使用",
    dataIndex: "num",
  },
  {
    title: "占比",
    dataIndex: "rate",
  },
]);
const industryStatistics = ref([])
const throughNum = ref(0)
const getUtilizationRate =async()=>{
  const res = await utilizationRate()
  dataList[0].value = res.total
  dataList[1].value = res.useArea
  alarmRateData.proportion = res.utilizationRate
}
const getBuildingUtilizationRate = async () => {  
  const res = await buildingUtilizationRate()
  buildUtilization.xData = res.map(item=>{
    return item.areaName
  })
  buildUtilization.yData[0].data = res.map(item=>{
    return item.useArea
  })
  buildUtilization.yData[1].data = res.map(item=>{
    return item.disabledArea
  })
}
const getStatisticsEnterprises = async () => {  
  const res = await statisticsEnterprises()
  throughNum.value = res.total
  industryStatistics.value = res.industryStatisticsEnterprises.map(e=>{
    return {
      ...e,
      rate: e.rate + '%'
    }
  })
  levelPieData.value = res.industryStatisticsEnterprises.map((item,index)=>{
    return {
      name:item.industry,
      color:colors[index],
      value:item.num
    }
  })
}
onMounted(()=>{
  getUtilizationRate()
  getBuildingUtilizationRate()
  getStatisticsEnterprises()
})
</script>
<style lang="less" scoped>
.equipmentInfo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  .deviceList {
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 100%;
    margin-bottom: 10px;

    .device-box {
      margin-top: 10px;
      min-width: 140px;
      height: 60px;
      padding: 0 10px;
      background: rgba(108, 128, 151, 0.1);
      color: #fff;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .unit {
        font-size: 12px;
      }
    }
  }
}

.charts {
  width: 100%;
  height: 250px;
}

.mg-10 {
  :deep(.policeList) {
    height: auto;
  }

  .content {
    color: #fff;
    text-align: center;
    font-size: 12px;
  }
}</style>