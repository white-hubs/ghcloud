<template>
  <div class="panel">
    <SubPanelTemplate title="当日值班人员" class="monitor">
      <div class="body">
        <div class="person-statistic">
        <div class="view-statistic flex-center">
          <div class="bg">
            <img :src="getAssetsImage('overView4.png')" />
            <img class="rotate" :src="getAssetsImage('overView13.png')" alt="" />
          </div>
          <div class="view-content view-left flex-center">
            <div class="icon">
              <img :src="getAssetsImage('overView9.png')" alt="" />
            </div>
            <div class="content">
              <count-to
                :startVal="0"
                :endVal="personStatistic.onDutyNum"
                :duration="4000"
                class="scroll-number"
              ></count-to>
              <div class="title">在岗人员</div>
            </div>
          </div>
          <div class="view-content view-right flex-center">
            <div class="content">
              <count-to
                :startVal="0"
                :endVal="personStatistic.leaveNum" 
                :duration="4000"
                class="scroll-number"
              ></count-to>
              <div class="title">离岗人员</div>
            </div>
            <div class="icon">
              <img :src="getAssetsImage('overView11.png')" alt="" />
            </div>
          </div>
        </div>
      </div>
        <DutyPersonList class="operatorDuty" :arrive="personnelInfo.obj.arrive" :total="personnelInfo.obj.total" :list="personnelInfo.list" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="应急广播使用情况" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="eventTime" @search="alarmEventTop"></DateInlineForm>
      </template>
      <DeviceStatistics @handelClickItemize="openBroadcast(false)" imgPath="business-icon/triage-queue/11.png" :statistic="deviceStatisticsData"></DeviceStatistics>
      <div class="elevator-analysis">
        <div class="chart">
          <elevator-analysis-pie @clickbar="openBroadcast" :pieData="detectionData">
            <div style="color: #fff;text-align: center;font-size: 14px;">{{ deviceStatisticsData.total }}</div>
            <div style="color: #fff;text-align: center;font-size: 14px;">广播记录</div>
          </elevator-analysis-pie>
        </div>
        <elevatorAnalysisList @handlecurrent="openBroadcast" :contentList="detectionData" class="pie_list"></elevatorAnalysisList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警事件处理情况">
      <template #extra>
        <DateInlineForm v-model:modelValue="alarmEventTime" @search="alarmEventTimetTop"></DateInlineForm>
      </template>
      <RollTable @clickRow="clickRow" :column="columns" :data="alarmEventData" :showLength="6"> </RollTable>
    </SubPanelTemplate>
  </div>
  <modal-alarm-table  :show-modal="alarmModalShow" @close="closeModal" :parameter="parameter"></modal-alarm-table>
  <modalBroadcastTable :showModal="BroadcastShow" @close="BroadcastShow = false" :parameter="parameterBroadcast"></modalBroadcastTable>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import DateInlineForm from '@/components/businessPanel/public/dateInlineForm.vue'
import DeviceStatistics from "../security-monitoring-safty/device-statistics.vue";
import { getAssetsImage } from "../../../utils/getImage";
import { CountTo } from "vue3-count-to";
import DutyPersonList from '../public/dutyPersonList.vue'
import elevatorAnalysisPie from "../public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "../public/elevator-analysis-list.vue"
import RollTable from "../public/rollTable/index.vue";
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import modalBroadcastTable from "./components/modal-broadcast-table.vue"
import { eventTypeHandlerSearch } from "@/api/alarm"
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue"
import { arrangeTodayStat } from '@/api/attendance'
import moment from 'moment'
import { playStatistics } from '@/api/broadcast'
import { useStateStore } from "@/pages/state/use-state-store";
const { globalState } = useStateStore();

const parameter = reactive({
  alarmEventTypeId:'',
  dateRange:[],
  deviceTags: ['builtin.app::SECURITY_MONITORING','builtin.app::ELECTRICMANAGE','builtin.app::FIRECONTROL','builtin.app::GAS_MANAGEMENT','builtin.app::ROTATINGMANAGE'].toString()
})
const parameterBroadcast = reactive({
  templateId:'',
  period:[],
})
let timer: any = reactive(null)
const personStatistic = reactive({
  total: 0,
  onDutyNum: 0,
  leaveNum: 0,
});
const detectionData = ref([])
const alarmModalShow = ref<boolean>(false);
const BroadcastShow = ref<boolean>(false);
const deviceStatisticsData = reactive({
  title: "广播记录数",
  total: 0,
});
const eventTime = ref({
  timeType:'THIS_YEAR',
  dateRange:[]
})
const alarmEventTime = ref({
  timeType:'THIS_YEAR',
  dateRange:[]
}) 
const alarmEventData = ref<any>([]);
const columns = ref([
  {
    title: "报警事件",
    dataIndex: "name",
    width: 120,
  },
  {
    title: "报警数",
    dataIndex: "totalNum",
  },
  {
    title: "平均处理时长（分钟）",
    dataIndex: "processingTime",
  },
]);
let personnelInfo = reactive({
  obj: {
    arrive: 0,
    total: 0
  },
  list: []
})
const closeModal = () => {
  alarmModalShow.value = false;
};
const openBroadcast = (value)=>{
  //@ts-ignore
  parameterBroadcast.period = eventTime.value.dateRange.join(",")
  if (value) {
    parameterBroadcast.templateId = detectionData.value.find(e=>e.name===value.name).id
  }
  BroadcastShow.value = true
}
const requestStateTotal = async () => {
  const res = await arrangeTodayStat();
  personStatistic.onDutyNum = 0
  personStatistic.leaveNum = 0
  personStatistic.total = 0
  personStatistic.onDutyNum = res.workCount
  personStatistic.leaveNum = res.totalCount - res.workCount
  personStatistic.total = res.totalCount
};
const alarmEventTop =async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: eventTime.value.dateRange.join(','),
  };
 const res = await playStatistics(params)
const colorList = ["#328BF7","#FFC700", "#74AEE7", "#00F27B", "#29C2FF", "#EF424A"];
deviceStatisticsData.total = 0
 detectionData.value = res.map((item,index)=>{
  deviceStatisticsData.total += item.totalNum
  return {
    id:item.id,
    name:item.name,
    value:item.totalNum,
    color:colorList[index]
  }
 })
}
const alarmEventTimetTop =async () => {
  let params = {
    areaId: globalState.business.currentAreaId,
    period: alarmEventTime.value.dateRange.join(','),
    deviceTags:['builtin.app::SECURITY_MONITORING','builtin.app::ELECTRICMANAGE','builtin.app::FIRECONTROL','builtin.app::GAS_MANAGEMENT','builtin.app::ROTATINGMANAGE']
  };
  const res = await eventTypeHandlerSearch(params)
  alarmEventData.value = res.map(item=>{
    return {
      ...item,
      processingTime:item.processingTime?(item.processingTime/3600).toFixed(2)+'时':'0时'
    }
  })
}
const clickRow = (row: any)=>{
  parameter.alarmEventTypeId = row.id
  parameter.dateRange = alarmEventTime.value.dateRange
  alarmModalShow.value = true;
}
watch(() => globalState.business.currentAreaId, () => {
  clearInterval(timer)
  timer = setInterval(() => {
    init()
  }, (window as any).config.pageLoopRequestTime)
  init()
})
const getDutyPersonnel = async () => {
  let res = await arrangeTodayStat()
  personnelInfo.obj.arrive = res.workCount
  personnelInfo.obj.total = res.totalCount
  personnelInfo.list = res.staffResultList.map(item=>{
    return {
      ...item,
      startWorkTime:item.startWorkTime?moment(item.startWorkTime).format('DD日HH:mm'):null,
      endWorkTime:item.endWorkTime?moment(item.endWorkTime).format('DD日HH:mm'):null,
    }
  })
}
function init() {
  getDutyPersonnel()
}
onMounted(() => {
  requestStateTotal()
  getDutyPersonnel()
  timer = setInterval(() => {
    init()
  }, (window as any).config.pageLoopRequestTime)
})
onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<style lang="less" scoped>
.panel {
  padding: 8px;
  display: flex;
  flex-direction: column;
}

.chart {
  flex: 1;
  height: 140px;
}

.monitor {
  .title {
    color: #fff;
  }

  .group {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    img {
      width: 160px;
      height: 90px;
      margin-top: 10px;
    }
  }
}

.alarm-event {
  .body {
    margin-top: 20px;
  }

  .footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
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
.operatorDuty{
  height: 200px;
}
.person-statistic {
  width: 100%;
  text-align: center;
  margin-bottom: 10px;
  .view-statistic {
    width: 100%;
    position: relative;

    .bg {
      position: relative;

      img {
        width: 154px;
        height: 130px;
      }

      .rotate {
        position: absolute;
        top: 10px;
        left: 47px;
        width: 60px;
        height: 60px;
      }
    }

    .view-content {
      width: 98px;
      height: 60px;

      .icon img {
        width: 18px;
        height: 18px;
      }
    }

    .view-left {
      background-image: url("/resource/v1/ue5-migrate/assets/images/overView10.png");
      background-size: contain;
      position: absolute;
      left: 0;
      bottom: 0;
    }

    .view-right {
      background-image: url("/resource/v1/ue5-migrate/assets/images/overView8.png");
      background-size: contain;
      position: absolute;
      right: 0;
      bottom: 0;
    }
  }
  .scroll-number {
    font-size: 24px;
    margin-left: 8px;
  }
  .content {
    text-align: center;
    color: #fff;
    font-size: 14px;

    .total-num {
      font-size: 16px;
    }
    .title{
      font-size: 12px;
    }
  }
}
</style>