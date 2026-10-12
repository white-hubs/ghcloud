<template>
  <div class="panel">
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
      <DeviceStatistics @handelClickItemize="handelClickItemize" imgPath="business-icon/triage-queue/10.png" :statistic="deviceStatisticsData"></DeviceStatistics>
      <div class="elevator-analysis">
        <elevator-analysis-pie @clickbar="alarmClickBar" :pieData="detectionData" style="width: 50%;height: 1.14583rem;">
          <div style="color: #fff;text-align: center;font-size: 0.072rem;">{{ deviceStatisticsData.total }}</div>
          <div style="color: #fff;text-align: center;font-size: 0.052rem;">报警总数（个）</div>
        </elevator-analysis-pie>
        <elevatorAnalysisList @handlecurrent="alarmClickBar" :showRatio="true" :contentList="detectionData" class="pie_list"></elevatorAnalysisList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备报警趋势" class="alarm-event">
      <template #extra>
        <DateInlineForm
        v-model:modelValue="trend"
        @search="alarmTrendInfo"
        ></DateInlineForm>
      </template>
      <LineChart class="line_char" :x-data="xData.arr" :series="series" :title="'次'"></LineChart>
    </SubPanelTemplate>
  </div>
  <modal-alarm-table :alarmLevelCode="alarmLevelCode"  :show-modal="alarmModalShow" @close="closeModal" :parameter="parameter"></modal-alarm-table>

</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import displayPanel from "@/components/businessPanel/public/display-panelsafty.vue";
import elevatorAnalysisPie from "../public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "../public/elevator-analysis-list.vue"
import DeviceStatistics from "../security-monitoring-safty/device-statistics.vue";
import { ModelValueItf } from '../public/types'
import LineChart from "../public/lineChart.vue";
import { alarmTrend } from '@/utils/requestData/alarm'
import { storeMenu } from '@/piniaStore/menu'
import { storeArea } from '@/piniaStore/area'
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import { getstatus, groupTotalSearch, recordStatus, statisticsLevel, statisticsSituation } from '@/api/alarm'

const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const alarmtimeType = ref<ModelValueItf>({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const trend = ref<ModelValueItf>({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const eventTime = ref({
  timeType:'THIS_YEAR',
  dateRange:[]
})
const alarmLevelCode = ref('');
const alarmModalShow = ref<boolean>(false);
const detectionData = ref([
  {
    name: '正常',
    color: '#2AE8BD',
    value: 317
  }, {
    name: '故障',
    color: '#FFC700',
    value: 23
  }, {
    name: '关闭',
    color: '#3590FF',
    value: 30
  },
])
const contentList = ref([
  {
    name: "报警超时率",
    field:"timeoutRatio",
    value: 0,
  },
  {
    name: "报警正确率",
    field:"actualRatio",
    value: 0,
  },
  {
    name: "电气报警占比",
    field:"ratio",
    value: 0,
  },
  {
    name: "报警处理率",
    field:"handlerRatio",
    value: 0,
  },
]);
const deviceStatisticsData = reactive({
  title: "报警总数",
  total: 48,
  itemize: [
    {
      name: "处理中",
      label: "挂起",
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
const parameter = reactive({
  alarmEventTypeId:'',
  dateRange:[],
  alarmStatus:''
})
const closeModal = () => {
  alarmModalShow.value = false;
};
const alarmEventTop =async () => {
  const res = await getstatus({
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: eventTime.value.dateRange.join(","),
    type: eventTime.value.timeType
  })
  deviceStatisticsData.total = res.alarmNum
  deviceStatisticsData.itemize[0].value = res.alarmStatusStatistics.find(e=>e.alarmStatus==="ALARM_SUSPEND").alarmNum
  deviceStatisticsData.itemize[0].offline = res.alarmStatusStatistics.find(e=>e.alarmStatus==="ALARM_PROGRESS_CONFIRMED").alarmNum
  deviceStatisticsData.itemize[1].value = res.alarmStatusStatistics.find(e=>e.alarmStatus==="ALARM_UN_CONFIRMED").alarmNum
  deviceStatisticsData.itemize[1].offline = res.alarmStatusStatistics.find(e=>e.alarmStatus==="ALARM_HANDLER").alarmNum
  const data = await groupTotalSearch({
    areaId: piniaStoreArea.currentAreaId,
    period: eventTime.value.dateRange.join(","),
    sceneType:piniaStoreMenu.currentMenu
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
const changeDate = async () => {
  getAlarmSituation()
}
// 获取报警情况统计
const getAlarmSituation=async ()=>{
  let params = {
      sceneType: piniaStoreMenu.currentMenu,
      areaId: piniaStoreArea.currentAreaId,
      period: alarmtimeType.value.dateRange.join(","),
    };
  let res = await statisticsSituation(params);
  contentList.value = contentList.value.map(item=>{
    return {
      ...item,
      value: +res[item.field]
    }
  })
}
// 设备报警趋势
const alarmTrendInfo = async () => {
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: trend.value.dateRange.join(","),
    type: trend.value.timeType,
  };
  let res: any = await alarmTrend(param);
  xData.arr = res.xdata;
  series[0].data = res.ydata;
};
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
const alarmClickBar = (value)=>{
 parameter.alarmStatus = undefined
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
    width: 50%;
  }
}
.chart {
  flex: 1;
  height: 180px;
}
.line_char{
  width: 100%;
  height: 200px;
}
</style>