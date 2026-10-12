<template>
  <div class="panel">
    <SubPanelTemplate title="报警等级统计">
      <template #extra>
        <DateInlineForm
        v-model:modelValue="timeFrame"
        @search="getAlarmLevel"
        ></DateInlineForm>
      </template>
      <div class="equipmentAlarm">
        <RoundPie :data="roundPieData" :eventNum="devicesNum">
          <div class="content">
            <span>{{ devicesNum }}</span> <br />报警总数
          </div>
        </RoundPie>
        <pieList :roundPieData="roundPieData"></pieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备报警趋势">
      <template #extra>
        <DateInlineForm v-model:modelValue="topTimeFrame" @search="getAlarmsNumber"></DateInlineForm>
      </template>
      <div class="body">
        <OperateDays title="报警数" :value="alarmCon.count" class="body-num">
          <div class="extra flex-start">
            <div class="mode">环比</div>
            <div :class="['downtriangle', alarmCon.ratio > 0 && 'uptriangle']"></div>
            <div :class="[alarmCon.ratio < 0 ? 'down' : 'up']">{{ alarmCon.ratio }}%</div>
          </div>
        </OperateDays>
        <div class="chart">
          <LineChart :x-data="xData" :series="[
              {
                data: yData,
                linearGradientColor: ['rgb(86, 142, 255)', 'rgb(86, 142, 255,0)'],
              },
            ]" />
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="最新五方通话">
      <template #extra>
        <div class="dataTitle">
          <div class="dataTitle-right" style="color: #5EA6FF;" @click="handleAll">查看更多>></div>
        </div>
      </template>
      <RollTable :column="columns" :data="tableData" :showLength="8"> </RollTable>
    </SubPanelTemplate>
  </div>
  <liftModal :showModal="showModal" @close="showModal = false"></liftModal>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { statisticsLevel, statisticsStatus, statisticsTrend } from '@/api/alarm'
import RoundPie from "../public/charts/roundPie/roundPie.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import RollTable from "../public/rollTable/index.vue";
import OperateDays from "../public/operateDays.vue";
import LineChart from "../public/lineChart.vue";
import { ModelValueItf } from '../public/types'
import { storeMenu } from "@/piniaStore/menu";
import { storeArea } from "@/piniaStore/area";
import pieList from "../public/pieList.vue";
import { liftFiveCallLogPage } from "@/api/securitymanagement";
import liftModal from "./lift-modal.vue";

const colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
const showModal = ref(false);
const roundPieData = ref([]);
const devicesNum = ref(0);
const topTimeFrame = ref<ModelValueItf>();
let timeFrame = ref<ModelValueItf>();
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const xData = ref<string[]>([]);
const yData = ref<number[]>([]);
const alarmCon = ref({
  count: 0,
  ratio: 0,
});
const columns = ref([
  {
    title: "电梯编号",
    dataIndex: "liftNumber",
    width: 120,
  },
  {
    title: "处理内容",
    dataIndex: "callContent",
  },
  {
    title: "处理状态",
    dataIndex: "handlingSituation",
  },
]);
const tableData = ref([])
// 报警状态统计&报警趋势折线图统计
async function getAlarmsNumber() {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: topTimeFrame.value.dateRange.join(","),
    type: topTimeFrame.value.timeType,
  };
  xData.value.length = 0;
  yData.value.length = 0;
  let Status = await statisticsStatus(params);
  let Trend = await statisticsTrend(params);
  alarmCon.value = {
    count: Status.alarmNum,
    ratio: Status.chainRatio,
  };
  Trend.forEach((item) => {
    let time = "";
    if (params.type === "TODAY") {
      time = "时";
    } else if (params.type === "THIS_YEAR") {
      time = "月";
    } else {
      time = "号";
    }
    xData.value.push(item.period + time);
    yData.value.push(item.alarmNum);
  });
}
const handleAll = () => {
  showModal.value = true
}
// 获取报警级别分布数据
async function getAlarmLevel() {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: timeFrame.value.dateRange.join(","),
    type: timeFrame.value.timeType,
  };
  let res = await statisticsLevel(params);
  devicesNum.value = 0
  roundPieData.value = res.map((item,index) => {
    devicesNum.value += item.alarmNum;
    return {
      label:item.name += "报警",
      color:colorList[index],
      value:item.alarmNum
    };
  });
}
// 获取五方通话数据
const getLiftFiveCallLogPage = async () => {
  const res = await liftFiveCallLogPage({
    pageNumber:1,
    pageSize:10,
  })
  tableData.value = res.records.map(e=>{
    return {
      liftNumber:e.liftNumber,
      callContent:e.handlingSituation?e.callContent:'--',
      handlingSituation:e.handlingSituation?'已处理':'未处理', 
    }
  })
}
onMounted(()=>{
  getLiftFiveCallLogPage()
  getAlarmLevel()
})
</script>
<style lang="less" scoped>
.chart {
  height: 300px;
}
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;
  .content {
    font-size: 12px;
  }
}
.dataTitle {
  color: #ABB8CB;
  font-size: 14px;
  text-align: right;

  .dataTitle-right {
    cursor: pointer;
  }
}
</style>