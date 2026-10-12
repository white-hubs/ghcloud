<template>
  <SubPanelTemplate title="报警情况统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="alarmtimeType" @search="changeDate"></DateInlineForm>
    </template>
    <displayPanel :bg-img="'overView16.png'" :content-list="contentList" :showimg="false"></displayPanel>
  </SubPanelTemplate>
  <SubPanelTemplate title="报警事件占比" class="alarm-event">
    <template #extra>
      <DateInlineForm v-model:modelValue="eventTime" @search="alarmEventTop"></DateInlineForm>
    </template>
    <div v-if="deviceStatisticsData.total !== 0">
      <DeviceStatistics @handelClickItemize="handelClickItemize" imgPath="business-icon/triage-queue/10.png"
        :statistic="deviceStatisticsData"></DeviceStatistics>
      <div class="elevator-analysis">
        <div class="chart">
          <elevator-analysis-pie @clickbar="alarmOpen" :pieData="detectionData">
            <div style="color: #fff;text-align: center;font-size: 14px;">{{ deviceStatisticsData.total }}</div>
            <div style="color: #fff;text-align: center;font-size: 14px;">报警总量</div>
          </elevator-analysis-pie>
        </div>
        <elevatorAnalysisList @handlecurrent="clickRow" :contentList="detectionData" class="pie_list">
        </elevatorAnalysisList>
      </div>
    </div>
    <div class="body" style="min-height: 150px;" v-else>
      <noData></noData>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="报警趋势" class="alarm-event">
    <template #extra>
      <DateInlineForm v-model:modelValue="trend" @search="alarmTrendInfo"></DateInlineForm>
    </template>
    <LineChart v-if="!series[0].data.every(value => value === 0)" class="line_char" :x-data="xData.arr" :series="series" :title="'次'"></LineChart>
    <div class="body" style="min-height: 150px;" v-else>
      <noData></noData>
    </div>
  </SubPanelTemplate>
  <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="parameter"></modal-alarm-table>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import displayPanel from "@/components/businessPanel/public/display-panelsafty.vue";
import noData from '@/components/businessPanel/public/noData.vue'
import elevatorAnalysisPie from "../public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "../public/elevator-analysis-list.vue"
import DeviceStatistics from "../security-monitoring-safty/device-statistics.vue";
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import { ModelValueItf } from '../public/types'
import LineChart from "../public/lineChart.vue";
import { alarmTrend } from '@/utils/requestData/alarm'
import { getstatus, groupTotalSearch, statisticsSituation } from '@/api/alarm'
import { useStateStore } from '@/pages/state/use-state-store';

const { globalState } = useStateStore();
const alarmModalShow = ref<boolean>(false);
let alarmtimeType = ref({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const trend = ref<ModelValueItf>({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const parameter = reactive({
  alarmEventTypeId:'',
  dateRange:[],
  alarmStatus:''
})
const eventTime = ref({
  timeType:'THIS_YEAR',
  dateRange:[]
})
const detectionData = ref([
  {
    name: "报警",
    value: 0,
    color: "#FFC947", // 黄色
  }
])
const contentList = ref([
  {
    name: "报警超时率",
    value: 0,
  },
  {
    name: "报警正确率",
    value: 0,
  },
  {
    name: "动环报警占比",
    value: 0,
  },
  {
    name: "报警处理率",
    value: 0,
  },
]);
const deviceStatisticsData = reactive({
  title: "报警总数",
  total: 48,
  itemize: [
    {
      name: "处理中",
      label: "已挂起",
      value: 23,
      offline: 15,
      key: "OFFLINE1",
    },
    {
      name: "已处理",
      label: "待确认",
      value: 23,
      offline: 15,
      key: "OFFLINE2",
    },
  ],
});
const xData = reactive({
  arr: ["1时", "2时", "3时", "4时", "5时"],
});
const series = reactive([
  {
    data: [0],
    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
  },
]);
const changeDate =async () => {
  const data = await statisticsSituation({
    areaId: globalState.business.currentAreaId,
    period: alarmtimeType.value.dateRange.join(","),
    sceneType: globalState.business.currentMenu,
  });
  contentList.value[0].value = Number(data.timeoutRatio);
  contentList.value[1].value = Number(data.actualRatio);
  contentList.value[2].value = Number(data.ratio);
  contentList.value[3].value = Number(data.handlerRatio);
}
const handelClickItemize = (value)=>{
  const obj={
    '挂起':"ALARM_SUSPEND",
    '处理中':"ALARM_PROGRESS_CONFIRMED",
    '待确认':"ALARM_UN_CONFIRMED",
    '已处理':"ALARM_HANDLER",
  }
  parameter.alarmStatus = obj[value]
  parameter.alarmEventTypeId = undefined
  parameter.dateRange = eventTime.value.dateRange
  alarmModalShow.value = true;
}
const alarmEventTop =async () => {
const res = await getstatus({
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: eventTime.value.dateRange.join(","),
    type: eventTime.value.timeType
  })
  deviceStatisticsData.total = res.alarmNum
  deviceStatisticsData.itemize[0].value = res.alarmStatusStatistics.find(e=>e.alarmStatus==="ALARM_SUSPEND").alarmNum
  deviceStatisticsData.itemize[0].offline = res.alarmStatusStatistics.find(e=>e.alarmStatus==="ALARM_PROGRESS_CONFIRMED").alarmNum
  deviceStatisticsData.itemize[1].value = res.alarmStatusStatistics.find(e=>e.alarmStatus==="ALARM_UN_CONFIRMED").alarmNum
  deviceStatisticsData.itemize[1].offline = res.alarmStatusStatistics.find(e=>e.alarmStatus==="ALARM_HANDLER").alarmNum
  const data = await groupTotalSearch({
    areaId: globalState.business.currentAreaId,
    period: eventTime.value.dateRange.join(","),
    sceneType:globalState.business.currentMenu
  })
const colors = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A","#29C2FF", "#74AEE7", "#655DD1", "#B9D9FF", "#6EE3E1"];
  detectionData.value = data.map((item,index)=>{
    return {
      id:item.id,
      name:item.name,
      value:item.totalNum,
      color:colors[index]
    }
  })
}
// 设备报警趋势
const alarmTrendInfo = async () => {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: trend.value.dateRange.join(","),
    type: trend.value.timeType,
  };
  let res: any = await alarmTrend(param);
  xData.arr = res.xdata;
  series[0].data = res.ydata;
};
const closeModal = () => {
  alarmModalShow.value = false;
};
const alarmOpen = (value)=>{
  //@ts-ignore
   parameter.alarmEventTypeId = detectionData.value.find(e=>e.name===value.data.name).id 
   parameter.alarmStatus = undefined
   parameter.dateRange = eventTime.value.dateRange
   alarmModalShow.value = true;
}
const clickRow = (value)=>{
  parameter.alarmEventTypeId = value.id
   parameter.dateRange = eventTime.value.dateRange
  alarmModalShow.value = true;
}
</script>
<style lang="less" scoped>
.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 10px 10px;
  align-items: center;

  .pie_list {
    width: 175px;
    margin-left: 10px;
    overflow: hidden;
  }
}

.chart {
  flex: 1;
  height: 180px;
}

.line_char {
  width: 100%;
  height: 250px;
}
</style>