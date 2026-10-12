<template>
  <div >
    <SubPanelTemplate title="安全运营天数">
      <OperateDays :value="monitorDays" title="监测天数"> </OperateDays>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警态势">
      <template #extra>
        <DateInlineForm v-model:modelValue="handleAlarmTime" @search="changeHandleAlarmTime"></DateInlineForm>
      </template>
      <div class="statistic flex-between">
        <div class="statistic-item flex-center" v-for="item in alarmSituationStatistic"
          @click="handelClickAlarmNum(item)">
          <div class="left">
            <img :src="getAssetsImage(item.img)" />
          </div>
          <div class="right">
            <count-to :startVal="0" :endVal="item.value" :duration="4000" class="scroll-number"
              :style="{ color: item.color }"></count-to>
            <div style="white-space: nowrap;">{{ item.label }}</div>
          </div>
        </div>
      </div>
      <div class="flex-between">
        <PlanPie :pieData="alarmSituationPieData" class="alarm-total-pie" pie-class="alarm-total-pie-chart">
          <div class="content">
            <div class="total-num">{{ alarmTotal }}</div>
            <div>报警总数</div>
          </div>
        </PlanPie>
        <PieList :roundPieData="alarmSituationPieData" @handel-click-itemize="handelClickItemize"
          class="alarm-total-list">
        </PieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备态势" class="alarm-event">
      <DeviceStatistics @handelClickItemize="deviceOpen" imgPath="overView5.png" :statistic="deviceStatisticsData">
      </DeviceStatistics>
      <div class="elevator-analysis">
        <div class="chart">
          <elevator-analysis-pie @clickbar="alarmRegion" :pieData="detectionData">
            <div style="color: #fff;text-align: center;font-size: 14px;">{{ alarmTotal }}</div>
            <div style="color: #fff;text-align: center;font-size: 14px;">设备总数</div>
          </elevator-analysis-pie>
        </div>
        <elevatorAnalysisList @handlecurrent="alarmRegion" :showRatio="false" :contentList="detectionData"
          class="pie_list">
        </elevatorAnalysisList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="巡查态势">
      <PatrolSituation :statistic="inspectionSituationAnalysis"></PatrolSituation>
      <!-- <PatrolSituation :statistic="patrolSituationAnalysis"></PatrolSituation> -->
    </SubPanelTemplate>
  </div>
  <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="alarmParameter"></modal-alarm-table>

    <modal-equipmentAll-table :show-modal="deviceModalShow" @close="deviceModalShow = false"
      :parameter="deviceParameter"></modal-equipmentAll-table>
</template>
<script setup lang="ts">
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import OperateDays from "../public/operateDays.vue";
import elevatorAnalysisPie from "../public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "../public/elevator-analysis-list.vue"
import PlanPie from "../public/charts/pie/planePie.vue";
import PieList from "../public/pieList.vue";
import PatrolSituation from "../overview/patrol-situation.vue";
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import DeviceStatistics from "../security-monitoring-safty/device-statistics.vue";
import modalEquipmentAllTable from "@/components/modal-table/modal-equipmentAll-table.vue";
import { CountTo } from "vue3-count-to";
import { getAssetsImage } from "../../../utils/getImage";
import { onMounted, reactive, ref } from "vue";
import { ModelValueItf } from "../public/types";
import { getDeviceBuyArea, getDeviceNumber } from "@/api/device";
import { getAlarmSituation } from "@/api/alarm";
import moment from 'moment'
import { depTaskExecutionAnalysis } from '@/api/maintain'
import { setDeviceData } from '@/utils/common'
import { useStateStore } from "@/pages/state/use-state-store";
interface Itemize {
  color: string;
  value: number;
  label: string;
  ratio: number;
  applicationCode: string;
}
const { globalState } = useStateStore();
const monitorDays = ref<number>(Math.abs(moment('2023-09-18').diff(moment(), 'days')));
const handleAlarmTime = ref<ModelValueItf>();
const alarmParameter = ref<Record<string, any>>({});
const deviceParameter = reactive({
  areaId:'',
  status:'',
  filterAreaIds:[],
  tagCodes:[`custom.app::visual.${globalState.business.currentMenu}`],
  dateRange:[],
})
const deviceStatisticsData = reactive({
  title: "设备总数",
  total: 48,
  itemize: [
    {
      name: "在线设备数",
      label: "离线设备数",
      value: 23,
      offline: 15,
      key: "OFFLINE1",
    }
  ],
});
const detectionData = ref([])
const alarmModalShow = ref<boolean>(false);
const deviceModalShow = ref<boolean>(false);
const alarmTotal = ref<number>(0);
const alarmSituationStatistic = ref<
  {
    label: string;
    value: number;
    img: string;
    color: string;
    key: string;
    alarmHandleResult: string;
  }[]
>([
  {
    label: "报警总数",
    value: 0,
    img: "overView1.png",
    color: "#D0DEEE",
    key: "alarmNum",
    alarmHandleResult: "",
  },
  {
    label: "真实数",
    value: 0,
    img: "overView2.png",
    color: "#F14545",
    key: "alarmActualNum",
    alarmHandleResult: "ALARM_ACTUAL",
  },
  {
    label: "误报数",
    value: 0,
    img: "overView3.png",
    color: "#FFC700",
    key: "alarmImpracticalNum",
    alarmHandleResult: "ALARM_IMPRACTICAL",
  },
]);
const alarmSituationColors = ref<string[]>(["#FFAB10", "#2F8DFF", "#F14545", "#19F8F7"]);
const alarmSituationPieData = ref<Itemize[]>([]);
const deviceSituationAnalysis = reactive({
  title: "设备总数",
  total: 0,
  itemize: [
    {
      label: "在线",
      value: 0,
      color: "#35D93D",
      key: "NORMAL",
    },
    {
      label: "离线",
      value: 0,
      color: "#D0DEEE",
      key: "OFFLINE",
    },
    {
      label: "故障",
      value: 0,
      color: "#FFC700",
      key: "TROUBLE",
    },
    {
      label: "报警",
      value: 0,
      color: "#F14545",
      key: "ALARM",
    },
  ],
});
const deviceSituationColors = ref<string[]>(["#FFAB10", "#2F8DFF", "#F14545", "#19F8F7"]);
const deviceSituationPieData = ref<Itemize[]>([]);
const inspectionSituationAnalysis = reactive({
  title: "巡检总数",
  total: 0,
  itemize: [
    {
      label: "任务总数",
      value: 0,
      color: "#7268FA",
    },
    {
      label: "超时任务数",
      value: 0,
      color: "#20E8E7",
    },
    {
      label: "过期任务数",
      value: 0,
      color: "#2F8DFF",
    },
    {
      label: "异常任务数",
      value: 0,
      color: "#35D93D",
    },
  ],
});
const patrolSituationAnalysis = reactive({
  title: "巡更总数",
  total: 0,
  itemize: [
    {
      label: "待接收",
      value: 0,
      color: "#7268FA",
    },
    {
      label: "执行中",
      value: 0,
      color: "#20E8E7",
    },
    {
      label: "已结束",
      value: 0,
      color: "#2F8DFF",
    },
  ],
});
const handelClickAlarmNum = (item: Record<string, any>) => {
  alarmModalShow.value = true;
  alarmParameter.value = {
    alarmHandleResult: item.alarmHandleResult,
    dateRange: handleAlarmTime.value?.dateRange,
  };
};
const deviceOpen = (value)=>{
    if (value === '离线设备数') {
        deviceParameter.status = 'OFFLINE'
    }else if( value === '在线设备数'){
        deviceParameter.status = 'ONLINE'
    }else{
        deviceParameter.status = ''
    }
    deviceParameter.areaId = globalState.business.currentAreaId
    deviceModalShow.value = true
}
const alarmRegion = (value) =>{
deviceParameter.status = ''
    if (value.name === '其他') {
        deviceParameter.areaId = undefined
        deviceParameter.filterAreaIds = detectionData.value.map(e=>e.areaId)
    }else{
        deviceParameter.areaId = detectionData.value.find(e=>e.name === value.name).areaId
        deviceParameter.filterAreaIds = []
    }
deviceModalShow.value = true
}
const alarmEventTop =async () => {
let colorList = ['#328BF7', '#19F8F7', '#FFC700', '#EF424A']
    const data =await getDeviceNumber({tagCodes:`custom.app::visual.${globalState.business.currentMenu}`,areaId:globalState.business.currentAreaId})
    deviceStatisticsData.total = data.totalNumber
    deviceStatisticsData.itemize[0].value = data.offlineNumber
    deviceStatisticsData.itemize[0].offline = data.normalNumber
    const res = await getDeviceBuyArea({
        tagCodes: [`custom.app::visual.${globalState.business.currentMenu}`],
        areaLevel: globalState.business.currentAreaLeave+1,
    });
    alarmTotal.value = 0
    detectionData.value = setDeviceData(res,colorList)
    detectionData.value.forEach(item=>{
        alarmTotal.value += item.value
    })
}
const closeModal = () => {
  alarmModalShow.value = false;
  deviceModalShow.value = false;
};
const changeHandleAlarmTime = () => {
  rquesestAlarmSituation();
};

const rquesestAlarmSituation = async () => {
  const res = await getAlarmSituation({
    period: handleAlarmTime.value.dateRange.join(","),
    type: handleAlarmTime.value.timeType,
  });
  alarmTotal.value = res.alarmBimStatistics.alarmNum;
  alarmSituationStatistic.value.map((item) => {
    item.value = res.alarmBimStatistics[item.key];
    return item;
  });
  alarmSituationPieData.value = res.alarmBimStatisticsTopChains.map((item, index) => {
    return {
      label: `${item.name}(${Math.round(item.ratio * 100) / 100}%)`,
      value: item.alarmNum,
      ratio: item.ratio,
      color: alarmSituationColors.value[index % 4],
      id: item.id,
    };
  });
  //排序
  alarmSituationPieData.value = alarmSituationPieData.value.sort(function (a, b) {
    if (a.value > b.value) {
      return -1;
    } else {
      return 1;
    }
  });
};
const handelClickItemize = (item) => {
  alarmModalShow.value = true;
  alarmParameter.value = {
    dateRange: handleAlarmTime.value?.dateRange,
    alarmTypeId: item.id,
  };
};
const getDepTaskExecutionAnalysis = async() =>{
 const res = await depTaskExecutionAnalysis({period:[moment().format('YYYY-MM-DD 00:00:00'), moment().format("YYYY-MM-DD HH:mm:ss")].join(",")})
  inspectionSituationAnalysis.itemize[0].value = res.totalTaskNum
  inspectionSituationAnalysis.itemize[1].value = res.overTimeTaskNum
  inspectionSituationAnalysis.itemize[2].value = res.expiredTaskNum
  inspectionSituationAnalysis.itemize[3].value = res.abnormalTaskNum
  inspectionSituationAnalysis.total = res.totalTaskNum
}
onMounted(() => {
  getDepTaskExecutionAnalysis()
  alarmEventTop()
});
</script>
<style lang="less" scoped>
.panel {
  font-size: 16px;

  .statistic {
    width: 100%;
    height: 68px;
    background: rgba(0, 0, 0, 0.15);
    padding: 0 10px;
  }

  .statistic-item {
    flex: 1;
    color: #d0deee;
    font-size: 12px;
    cursor: pointer;

    .left {
      margin-right: 10px;
    }

    .scroll-number {
      font-size: 22px;
    }
  }

  .content {
    text-align: center;
    color: #fff;
    font-size: 14px;

    .total-num {
      font-size: 16px;
    }
  }
}

.device-total-pie,
.device-total-list,
.device-total-pie-chart,
.alarm-total-pie,
.alarm-total-list,
.alarm-total-pie-chart {
  height: 140px !important;
}

:deep(.device-total-pie-chart),
:deep(.alarm-total-pie-chart) {
  height: 140px !important;
}
.elevator-analysis {
    display: flex;
    justify-content: space-between;
    padding: 10px 10px;
    align-items: center;

    .pie_list {
        width: 150px;
        margin-left: 10px;
    }
}
.chart {
    flex: 1;
    height: 180px;
}
</style>
