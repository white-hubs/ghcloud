<template>
  <div class="panel">
    <SubPanelTemplate title="设备报警趋势" class="alarm-event">
      <template #extra>
        <DateInlineForm
        v-model:modelValue="trend"
        @search="alarmTrendInfo"
        ></DateInlineForm>
      </template>
      <OperateDays :value="alarmNum" title="报警总数">
        <div class="ringRatio">
          <span>环比</span>
          <!-- uptriangle 向上三角根据Prop改变 -->
          <div :class="['downtriangle', chainRatio > 0 && 'uptriangle']"></div>
          <div :class="[chainRatio > 0 ? 'up' : 'down']">{{ chainRatio + "%" }}</div>
        </div>
      </OperateDays>
      <GridContainer style="margin-top: 12px" :data="alarmStatusData"></GridContainer>
      <LineChart :x-data="xData.arr" :series="series" :title="'次'"></LineChart>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备类型分布">
      <div class="equipmentAlarm">
        <RoundPie :data="roundPieData" :eventNum="eventNum">
          <div class="content">
            <span>{{ eventNum }}</span> <br />设备总数
          </div>
        </RoundPie>
        <pieList :roundPieData="roundPieData"></pieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备异常统计">
      <template #extra>
        <DateInlineForm v-model:modelValue="receptionTrendsTime" @search="getAbnormalStatistics"></DateInlineForm>
      </template>
      <div class="alarmInfo">
        <deviceModule :data-list="alarmAbnormal"></deviceModule>
      </div>
      <RollTable :column="alarmColumn" :data="listData">
        <template #situation="{ record }">
          <span v-if="record.situation === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待处理</span>
          <span v-else-if="record.situation === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
          <span v-else="record.situation === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
        </template>
      </RollTable>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted, onBeforeUnmount} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import OperateDays from "../public/operateDays.vue";
import GridContainer from "../public/gridContainer.vue";
import LineChart from "../public/lineChart.vue";
import { ModelValueItf } from '../public/types'
import { storeArea } from "@/piniaStore/area";
import RoundPie from "../public/charts/roundPie/roundPie.vue";
import deviceModule from "../public/deviceModule.vue";
import pieList from "../public/pieList.vue";
import { storeMenu } from "@/piniaStore/menu";
import RollTable from "../public/rollTable/index.vue";
import { alarmTrend, equipmentNumber } from '../../../utils/requestData/alarm'
import useCommon from '@/components/hooks/useCommon'
import { abnormalStatistics } from '@/api/alarm'
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();

interface RoundPie {
  label: string;
  value: number;
  color: string;
}
const { getEquipmentNumber } = useCommon();
const alarmColumn = [
  {
    title: "日期",
    dataIndex: "timeFlag",
    width: 120,
  },
  {
    title: "异常设备数量",
    dataIndex: "equipmentNum",
  },
  {
    title: "报警次数",
    dataIndex: "alarmNum",
    width: 140,
  }
];
const listData = ref([])
const receptionTrendsTime = ref<ModelValueItf>();
const trend = ref<ModelValueItf>();
const colors = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A"];
const series = reactive([
  {
    data: [0],
    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
  },
]);
const roundPieData = ref<RoundPie[]>([]);
const alarmNum = ref<number>(0);
const eventNum = ref<number>(0);
const chainRatio = ref<number>(0);
let alarmStatusData = reactive([]);
let alarmAbnormal = reactive([
  {
    title:'异常设备数量',
    value:0
  },
  {
    title:'报警次数',
    value:0
  },
]);
const timer = ref<any>(null);
const xData = reactive({
  arr: ["1时", "2时", "3时", "4时", "5时"],
});
// 设备报警趋势
const alarmTrendInfo = async () => {
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: trend.value.dateRange.join(","),
    type: trend.value.timeType,
  };
  let res: any = await alarmTrend(param);
  let data: any = await equipmentNumber(param);
  alarmStatusData = data.alarmStatusStatistics;
  alarmNum.value = data.alarmNum;
  chainRatio.value = data.chainRatio;
  xData.arr = res.xdata;
  series[0].data = res.ydata;
};
/**
 * 设备类型分布
 */
 const equipmentStatistic = async () => {
  const res = await getEquipmentNumber();
  if (JSON.stringify(res) === "{}") {
    return;
  }
  eventNum.value = res.deviceNum;
  roundPieData.value.length = 0;
  res.deviceGenreNums.forEach((item, index) => {
    let obj = {
      label: `${item.genreName}(${
        Math.round((item.num / res.deviceNum) * 10000) / 100.0
      }%)`,
      color: colors[index],
      value: item.num,
    };
    roundPieData.value.push(obj);
  });
};
const getAbnormalStatistics=async()=>{
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: receptionTrendsTime.value.dateRange.join(","),
    type: receptionTrendsTime.value.timeType,
  };
  const res = await abnormalStatistics(param)
  alarmAbnormal[0].value=res.equipmentDeviceTotal
  alarmAbnormal[1].value=res.equipmentTotal
  listData.value=res.equipmentList
  if(receptionTrendsTime.value.timeType==='THIS_YEAR'){
    listData.value.forEach(x=>{
      x.timeFlag=x.timeFlag+'月'
    })
  }
  if(receptionTrendsTime.value.timeType==='TODAY'){
    res.equipmentList.forEach(x=>{
      x.timeFlag=x.timeFlag+'时'
    })
  }
}
const init = () => {
  equipmentStatistic();
};
onMounted(() => {
  init();
  timer.value = setInterval(() => {
    init();
  }, (window as any).config.pageLoopRequestTime);
});
onBeforeUnmount(()=>{
  clearInterval(timer.value);
})
</script>
<style lang="less" scoped>
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;
  .content {
    font-size: 12px;
  }
}

.ringRatio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin-left: 6px;
}

.chart {
  height: 140px;
  display: flex;
}
:deep(.policeList){
  height: auto;
}
:deep(.deviceList){
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

</style>