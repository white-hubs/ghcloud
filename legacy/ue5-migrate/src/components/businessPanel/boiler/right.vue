<template>
  <div >
    <SubPanelTemplate title="设备统计">
      <a-radio-group v-model:value="deviceFlag" button-style="solid">
        <a-radio-button value="overview">设备总览</a-radio-button>
        <a-radio-button value="monitor">设备状态监测</a-radio-button>
      </a-radio-group>
      <div v-show="deviceFlag==='overview'">
        <OperateDays title="设备总数" :value="alarmTotal"></OperateDays>
        <div class="flex-between">
          <PlanPie :pieData="roundPieData">
            <div class="content">
              <div class="total-num">{{ alarmTotal }}</div>
              <div>设备总数</div>
            </div>
          </PlanPie>
          <PieList :roundPieData="roundPieData"></PieList>
        </div>
      </div>
      <div v-show="deviceFlag==='monitor'">
        <GridContainer :data="deviceStatistic"></GridContainer>
        <div class="chart">
          <PlanPie :pieData="pieData">
            <div class="content">
              <div class="total-num">{{ alarmTotal }}</div>
              <div>设备总数</div>
            </div>
          </PlanPie>
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="超温统计">
      <template #extra>
        <DateInlineForm v-model:modelValue="transactionTime" @search="changeTransactionTime"></DateInlineForm>
      </template>
      <div class="flex-between">
        <PlanPie :pieData="overTemperData">
          <div class="content">
            <div class="total-num">{{ temperatureAlarmTotal }}</div>
            <div>设备总数</div>
          </div>
        </PlanPie>
        <PieList :roundPieData="overTemperData"></PieList>
      </div>
      <div class="barChart">
        <overviewChartBar :bottom="'0%'" :title="''" :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备报警">
      <template #extra>
        <span class="more" @click="handelClickDeviceNum">
          查看更多>>
        </span>
      </template>
      <RollTable style="height: 200px;" :column="column" :data="listData">
        <template #alarmStatus="{ record }">
          <span v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待处理</span>
          <span v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
          <span v-else="record.alarmStatus === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
        </template>
      </RollTable>
    </SubPanelTemplate>
  </div>
  <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="alarmParameter"></modal-alarm-table>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted, computed} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import OperateDays from "../public/operateDays.vue";
import RollTable from "../public/rollTable/index.vue";
import PlanPie from "../public/charts/pie/planePie.vue";
import modalAlarmTable from "@/components/modal-table/modal-alarm-tableNew.vue";
import GridContainer from "../public/gridContainer.vue";
import PieList from "../public/pieList.vue";
import overviewChartBar from "../hospital/overview-chartBar.vue"
import { ModelValueItf } from '../public/types'
import DateInlineForm from "../public/dateInlineForm.vue";
import { equipmentTotal } from '@/api/equipment'
import { alarmStatisticsList } from '@/api/alarm'
import {getBoilerOverTemperStatistics} from '@/api/securitymanagement'
import moment from 'moment'
import { useStateStore } from '@/pages/state/use-state-store';

const { globalState } = useStateStore();

const transactionTime = ref<ModelValueItf>({
        timeType: 'TODAY',
        dateRange: []
    }
);
const deviceStatusType = {
    ALARM: "报警",
    TROUBLE: "故障",
    OFFLINE: "离线",
    NORMAL: "正常",
}
const colorList = [
  "#2F8DFF",
  "#D0DEEE",
  "#FFAB10",
  "#F14545",
]
const column = reactive([
  {
    title: "报警时间",
    dataIndex: "alarmTime",
    width: 120,
  },
  {
    title: "报警级别",
    dataIndex: "alarmLevelName",
    width: 120,
  },
  {
    title: "报警事件",
    dataIndex: "alarmEventName",
    width: 140,
  },
  {
    title: "状态",
    dataIndex: "alarmStatus",
    slots: {
      customRender: "alarmStatus",
    },
  },
]);
const listData = ref([]);
const barData = reactive({
    xData: ['1','2','3'],
    yData: [
        {
            data: [],
            name: '',
            color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
        }
    ]
})
const deviceStatistic = ref([]);
const monitorSituationPieData = ref<{ label: string; value: number; color: string }[]>([]);
const roundPieData = ref([])
const overTemperData=ref([])
const alarmTotal = ref(0)
const temperatureAlarmTotal = ref(0)
const pieData = ref([]);
const deviceFlag = ref('overview')
const alarmModalShow = ref<boolean>(false);
  const alarmParameter = ref<Record<string, any>>({});
const handelClickDeviceNum = (item) => {
	alarmModalShow.value = true
}
const closeModal = () => {
  alarmModalShow.value = false;
};
// 设备实时数据
const deviceDataInfo = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
  }
    let res: any = await equipmentTotal(params);
    if (!res.deviceNum) {
        return;
    }
    monitorSituationPieData.value.length = 0;
    deviceStatistic.value.length = 0
    roundPieData.value.length = 0
    alarmTotal.value = 0;
    res.deviceStatusNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
            label: deviceStatusType[item.name],
            color: colorList[index],
            value: item.num,
        };
        pieData.value.push(obj);
        deviceStatistic.value.push({
          alarmStatusName: deviceStatusType[item.name],
            color: colorList[index],
            alarmNum: item.num,
        })
    });
    res.deviceGenreNums.forEach((item, index) => {
    let obj = {
      label: `${item.genreName}(${
        Math.round((item.num / res.deviceNum) * 10000) / 100.0
      }%)`,
      color: colorList[index],
      value: item.num,
    };
    roundPieData.value.push(obj);
  });
};
// 获取报警列表
async function getAlarmTakeNotes() {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    pageSize: 50,
    pageNumber: 1,
  };
  let res: any = await alarmStatisticsList(params);
  
  listData.value = res.records.map((item) => {
    return {
      ...item,
      alarmTime: moment(item.alarmTime).format("YYYY-MM-DD"),
    };
  });
}
const changeTransactionTime =async ()=>{
  let param = {
    sceneType: globalState.business.currentMenu,
    period: transactionTime.value.dateRange.join(","),
    type: transactionTime.value.timeType,
  };
 const result= await getBoilerOverTemperStatistics(param)
 barData.xData = result.xtitle
 temperatureAlarmTotal.value = 0
 barData.yData[0].data = result.xtitle.map(xItem=>{
  return result.timeGroupStatistics.find(item=>item.dateFlag===xItem)?result.timeGroupStatistics.find(item=>item.dateFlag===xItem)?.alarmNum:0
 })
 overTemperData.value = result.deviceStatistics.map((item,index)=>{
  temperatureAlarmTotal.value+=item.alarmNum
  return {
   label:item.deviceName,
   value:item.alarmNum,
   color: colorList[index]
  }
 })
}
onMounted(()=>{
  deviceDataInfo()
  getAlarmTakeNotes()
})
</script>
<style lang="less" scoped>
.chart {
  display: flex;
  align-items: center;
  justify-content: center;
}

.barChart {
  height: 200px;
}

.content {
  text-align: center;
  color: #fff;
  font-size: 14px;

  .total-num {
    font-size: 16px;
  }
}

:deep(.ant-radio-button-wrapper) {
  background: none;
  border: none;
  color: #fff;
}

:deep(.ant-radio-button-wrapper-checked) {
  background: linear-gradient(180deg, rgba(41, 137, 255, 0.4) 0%, rgba(41, 137, 255, 0.8) 100%) !important;
}

:deep(.policeList) {
  height: auto;
}
.more{
  color: #2F8DFF;
  cursor: pointer;
  font-size: 16px;
}
</style>