<template>
  <div class="panel">
    <SubPanelTemplate title="电表日用能趋势图">
      <template #extra>
        <DateInlineForm v-model:modelValue="through" @search="abnormalPassageInfo"></DateInlineForm>
      </template>
      <div class="chart">
        <LineChart :x-data="charsData.xData" :series="[
            {
              data: charsData.yData,
              linearGradientColor: ['rgb(255, 162, 0.1)', 'rgb(255, 222, 165,1)'],
            },
          ]" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="失联电表实时统计">
      <div class="equipmentAlarm">
        <PlanPie :pieData="roundPieData">
          <div class="content">
            <div class="total-num">{{ roundPieData[1].value + roundPieData[0].value }}</div>
            <div>设备总数</div>
          </div>
        </PlanPie>
        <pieList :roundPieData="roundPieData"></pieList>
      </div>
      <div class="footer">
        <div class="header">
          失联电表明细
        </div>
        <RollTable :column="column" :data="listData">
        </RollTable>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="欠费电表占比">
      <div class="equipmentAlarm">
        <PlanPie :pieData="arrearsData">
          <div class="content">
            <div class="total-num">{{ arrearsData[1].value + arrearsData[0].value }}</div>
            <div>电表总数</div>
          </div>
        </PlanPie>
        <pieList :roundPieData="arrearsData"></pieList>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "../public/lineChart.vue";
import PlanPie from "../public/charts/pie/planePie.vue";
import pieList from "../public/pieList.vue";
import RollTable from "../public/rollTable/index.vue";
import { ammeterPage, ammeterStatStatus, powerUserDayStat } from '@/api/prepaid';
import moment from 'moment';
const through = ref();
const roundPieData = ref([
  {
    value:0,
    label:'未失联',
    color:"rgba(3, 182, 21, 1)"
  },
  {
    value:0,
    label:'已失联',
    color:"rgba(245, 154, 35, 1)"
  }
]);
const arrearsData = ref([
  {
    value:0,
    label:'未欠费',
    color:"rgba(3, 182, 21, 1)"
  },
  {
    value:0,
    label:'已欠费',
    color:"rgba(245, 154, 35, 1)"
  }
]);
const column = reactive([
  {
    title: "电表编号",
    dataIndex: "meterId",
    width: 120,
  },
  {
    title: "商铺号",
    dataIndex: "roomId",
  },
  {
    title: "型号",
    dataIndex: "model",
  },
]);
const listData = ref([]);
const charsData = reactive({
  xData: [],
  yData: [],
});

const abnormalPassageInfo = async () => {
  const time = {
    'TODAY':'day',
    'THIS_WEEK':'week',
    'THIS_MONTH':'month',
    'THIS_YEAR':'year'
  }
 const res = await powerUserDayStat({period:through.value.dateRange.join(","), type:time[through.value.timeType]})
  charsData.xData = []
  charsData.yData = []
  res.forEach(item=>{
    charsData.xData.push(moment(item.useDate).format(through.value.timeType !== 'THIS_YEAR'?'YYYY-MM-DD':'YYYY-MM'))
    charsData.yData.push(item.pv)
  })
};
const getAmmeterPage =async () => {
 const res = await ammeterStatStatus()
  listData.value = res.unConnectList
  roundPieData.value[1].value = res.unConnect
  roundPieData.value[0].value = res.connect
  arrearsData.value[1].value = res.oweMoney || 0
  arrearsData.value[0].value = res.unOweMoney || 0
}
onMounted(() => {
  getAmmeterPage()
})
</script>
<style lang="less" scoped>
.chart {
  height: 200px;
  display: flex;
}

.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;

  .content {
    font-size: 16px;
    text-align: center;
    color: #fff;
  }

  .policeList {
    height: auto;
  }
}
.header {
    padding:0 10px;
    width: 100%;
    height: 30px;
    color: #ffffff;
    font-size: 14px;
    background: rgba(97, 148, 247, 0.20);
    text-align: center;
  }
  .footer{
    height: 250px;
  }
</style>