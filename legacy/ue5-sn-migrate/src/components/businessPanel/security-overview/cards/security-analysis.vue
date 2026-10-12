<template>
  <SubPanelTemplate :title="props.title">
    <template #extra>
      <DateInlineForm v-model:modelValue="overviewTime" @search="changeHandleOverviewTime">
      </DateInlineForm>
    </template>
    <DeviceStatistics @handel-click-itemize="handelClickAlarm" imgPath="overView21.png"
      :statistic="alarmStatisticsData"></DeviceStatistics>
    <div class="chart">
      <LineChart :x-data="trendsData.xData" :series="trendsData.yData" :showLegend="false" gridTop="15" />
    </div>
  </SubPanelTemplate>
  <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="alarmParameter"></modal-alarm-table>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import DeviceStatistics from "../components/device-statistics.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
import { statisticsTrend, statistics } from "@/api/alarm";
import { applicationCode } from '@/api/saftsecurity/overview'

const props = withDefaults(defineProps<{
  title?: string;
}>(), {
  title: '安全分析'
})
const overviewTime = ref<ModelValueItf>({
  timeType:'THIS_YEAR',
  dateRange:[]
});

const alarmModalShow = ref<boolean>(false);
const alarmParameter = ref({
  dateRange:[],
  alarmHandlerResult:'',
  deviceTags:[...applicationCode.keys()].join(',')
});
const trendsData = reactive({
  xData: [],
  yData: [
    { 
      data: [],
      linearGradientColor: ['rgba(47, 141, 255, 0.50)', 'rgba(47, 141, 255, 0.02)'],
      lineColor: 'rgba(47, 141, 255, 0.50)' 
    }
  ]
})
// 报警状态统计&报警趋势折线图统计
async function changeHandleOverviewTime() {
  const { timeType, dateRange } = overviewTime.value
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: dateRange.join(","),
    type: timeType,
  };
  trendsData.yData[0].data.length = 0;
  let Status = await statistics({...params,deviceTags:[...applicationCode.keys()]});
  let Trend = await statisticsTrend({...params,deviceTags:[...applicationCode.keys()].toString()});
  alarmStatisticsData.total = Status.totalNum
  alarmStatisticsData.ratio = Status.ratio
  alarmStatisticsData.itemize[0].value = Status.actualNum
  alarmStatisticsData.itemize[0].ratio = Status.actualRatio
  alarmStatisticsData.itemize[1].value = Status.impracticalNum
  alarmStatisticsData.itemize[1].ratio = Status.impracticalRatio
  trendsData.xData = [];
  Trend.forEach((item) => {
    let time = "";
    if (params.type === "TODAY") {
      time = "时";
    } else if (params.type === "THIS_YEAR") {
      time = "月";
    } else {
      time = "号";
    }
    trendsData.xData.push(item.period + time);
    trendsData.yData[0].data.push(item.alarmNum);
  });
}

const alarmStatisticsData = reactive({
  title: "报警总量",
  total: 0,
  ratio:0,
  itemize: [
    {
      label: "真实报警数：",
      value: 0,
      ratio:0,
      color: '#2AE8BD',
      alarmHandlerResult:'ALARM_ACTUAL'
    },
    {
      label: "误报数：",
      value: 0,
      ratio:0,
      color: '#FFAB10',
      alarmHandlerResult:'ALARM_IMPRACTICAL'
    },
  ],
  list: [],
});

const handelClickAlarm = (item?:any) => {
  if(item.alarmHandlerResult){
    alarmParameter.value.alarmHandlerResult = item.alarmHandlerResult
  }else{
    alarmParameter.value.alarmHandlerResult = undefined
  }
  alarmParameter.value.dateRange = overviewTime.value.dateRange

  alarmModalShow.value = true;
};
const closeModal = () => {
  alarmModalShow.value = false;
};
const init = () => {
  changeHandleOverviewTime()
};
onMounted(() => {
  init()
});
</script>
<style scoped lang="less">
.monitorPanelBox {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  align-items: center;
  .alarm-analysis{
    height: auto;
  }
}

.chart {
  height: 220px;
}

:deep(.LightingBox) {
  &.round-wrap .monitorBox {
    flex-direction: column;
    width: 90px;
  }

  .monitor .monitorBox .monitorValue {
    font-size: 16px;
    font-family: D-DIN, D-DIN;
    font-weight: 700;
  }

  .monitor .monitorBox .monitorList .monitorColor {
    display: none !important;
  }

  .monitor {
    width: 180px !important;
    justify-content: space-between;
    margin-top: 15px;
  }

  .info {
    position: relative;
    justify-content: space-around;
    flex-direction: row;

    &::after {
      content: '';
      display: inline-block;
      height: 1px;
      border-top: 1px solid rgba(255, 255, 255, 0.3);
      position: absolute;
      width: 200px;
      top: 92px;
      left: 121px;
    }

    &::before {
      content: '';
      display: inline-block;
      height: 1px;
      border-top: 1px solid rgba(255, 255, 255, 0.3);
      position: absolute;
      top: 80px;
      left: 90px;
      width: 35px;
      transform: rotateZ(40deg);
    }
  }

  .roate {
    width: 67px !important;
    height: 67px !important;
  }

  .r1 {
    width: 90px !important;
    height: 90px !important;
  }

  .r2 {
    width: 80px !important;
    height: 80px !important;
  }

  .r3 {
    width: 80px !important;
    height: 80px !important;
    border-radius: 100%;
  }

  .item {
    height: 110px !important;
  }

  .icon {
    width: 30px !important;
    height: 30px !important;
  }
}
</style>
