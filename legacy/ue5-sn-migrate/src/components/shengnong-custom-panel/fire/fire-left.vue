<template>
  <div class="panel">
    <SubPanelTemplate
      image="bj.png"
      title="报警事件分析"
    >
      <template #extra>
        <DateInlineForm
          v-model:modelValue="alarmAnalysisTime"
          @search="changePieTime"
          menuPage="fire"
        ></DateInlineForm>
      </template>
        <EventAnalysis
        :data="alarmListData"
        @clickTotal="handleClickTotal"
        @clickRow="(item)=>{clickAlarmAnalysisBar(item)}" 
        />
    </SubPanelTemplate>
    <SubPanelTemplate title="报警高发时段" image="xf-2.png" style="margin-top: 10px">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="RecordTime"
          @search="changeReceptionRecordTime"
          menuPage="fire"
        >
        </DateInlineForm>
      </template>
      <div class="chart" v-if="gasChartData.xData.length > 0">
        <LineChart
          :x-data="gasChartData.xData"
          :series="gasChartData.yData"
          :showLegend="true"
          gridTop="15"
          :showBackground="true"
          :axisPointer="true"
          :titles="['报警数']"
          :unit="{ x: '', y: '' }"
        />
      </div>
      <noData v-else />
    </SubPanelTemplate>
    <SubPanelTemplate
      title="报警统计"
      image="xf-2.png"
    >
      <template #extra>
        <DateInlineForm
          v-model:modelValue="alarmEventTime"
          @search="changeTimeAlarmEvent"
          menuPage="fire"
        />
      </template>
      <EventStatistics
        :data="alarmStatisticsData"
        @clickRow="(item)=>{clickRowAlarmEvent(item)}"
        @changeTabs="changeAlarmEvent"
         @moreClick="moreClick"
        :isScroll="false"
        />
    </SubPanelTemplate>
  </div>
  <AlarmStatisticsModal @close="showAbnormalModal = false" :modalTitle="'消防事件报警统计-各市场对应事件报警数'" :showModal="showAbnormalModal" :parameter="moreParameter"></AlarmStatisticsModal>
  <modal-alarm-table
    :show-modal="alarmModalShow"
    v-if="alarmModalShow"
    @close="closeModal"
    :parameter="alarmParameter"
   />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted} from "vue";
import noData from "@/components/businessPanel/public/noData.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "../common/snPanelTemplate.vue";
import DateInlineForm from "../common/dateInlineForm.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import { autoPage, getXDataByType, getcurrentData, getallNumber, filterMarket } from "@/utils/common";
import EventStatistics from '../common/event-statistics.vue'
import EventAnalysis from "../common/event-analysis.vue";
import AlarmStatisticsModal from "@/components/shengnong-custom-panel/security-monitoring/components/alarm-statistics-modal.vue";
import { storeMarket } from "@/piniaStore/other";
import {
  alarmHandleAnalysisStat,
  alarmHighFrequencyPeriodStat,
  alarmSituationStat,
  alarmStatisticsRank,
} from "@/api/shennong/alarm";
import bus from "@/utils/bus";
import { TopParams } from "../common/alarmlist-event";

const applicationCode = "FIRECONTROL";
const showAbnormalModal = ref(false)

//报警事件分析================================
const alarmAnalysisTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const alarmListData =  ref({
  totalNum: 0,//报警总数
  totalRatio: 0,//报警环比
  statList:[
        {
        sort:1,
        name:'未响应报警数',
        key:'unConfirmedNum',
        count:0,
        ratio:'1',
        ratioKey:'unConfirmedChainRatio',
        modes:'1',
        linkRatio:1,
        code:1,
        sn:true,
        width:0.1,
        rank:1,
        lineColor:['rgba(247,160,59,0.00)','#f7a03b']
      },
      {
        sort:2,
        name:'超时报警数',
        key:'timeoutNum',
        count:0,
        ratio:'1',
        ratioKey:'timeoutChainRatio',
        modes:'1',
        linkRatio:1,
        code:1,
        sn:true,
        width:0.1,
        rank:1,
        lineColor:['rgba(250,78,78,0.00)','#fa4e4e']
      },
      {
        sort:3,
        name:'超时未处理报警数',
        key:'timeoutUnHandlerNum',
        count:0,
        ratio:'1',
        ratioKey:'timeoutUnHandlerChainRatio',
        modes:'1',
        linkRatio:1,
        code:1,
        sn:true,
        width:0.1,
        rank:1,
        lineColor:['rgba(75,134,255,0.00)','#4b86ff']
      },
  ]
});

const clickAlarmAnalysisBar = (record) => {
  alarmParameter.value = {
    applicationCode: applicationCode,
    alarmTypeCode: applicationCode,
    dateRange: alarmAnalysisTime.value.dateRange,
    alarmHandlerTimeoutStatus:["timeoutNum",'timeoutUnHandlerNum'].includes(record.key)?'TIMED_OUT':'',
    filterAlarmStatus: record.key==="timeoutUnHandlerNum"?'ALARM_HANDLER':'',
    alarmStatus:["handlerNum"].includes(record.key)  ? "ALARM_HANDLER" : record.key == "unConfirmedNum" ? "ALARM_UN_CONFIRMED" : null,
  }
  alarmModalShow.value = true;
};

const handleClickTotal = (record) => {
  alarmParameter.value = {
    applicationCode: applicationCode,
    alarmTypeCode: applicationCode,
    dateRange: alarmAnalysisTime.value.dateRange,
  }
  alarmModalShow.value = true;
};

bus.on("topPanelClick", (item: TopParams): void => {
  if (item?.key === "totalNum") {
    alarmParameter.value = {
      applicationCode: applicationCode,
      alarmTypeCode: applicationCode,
      dateRange: item?.period?.split(','),
    }
    alarmModalShow.value = true;
  } else if (item?.key === "handlerNum") {
    alarmParameter.value = {
      applicationCode: applicationCode,
      alarmTypeCode: applicationCode,
      dateRange: item?.period?.split(','),
      alarmStatus: "ALARM_HANDLER",
    }
    alarmModalShow.value = true;
  }
});
const closeModal = () => {
  alarmModalShow.value = false;
};
const changePieTime = async () => {
  alarmParameter.value.dateRange = alarmAnalysisTime.value.dateRange;
  let param = {
    period: alarmAnalysisTime.value.dateRange.join(","),
    type: alarmAnalysisTime.value.timeType,
    pageSize: 5,
    pageNumber: 1,
    applicationCode: applicationCode,
    marketTenant: '',
  };
  const totalStat=await alarmSituationStat(param)
  let result = await alarmHandleAnalysisStat(param);
  const { unConfirmedNum, unConfirmedChainRatio, timeoutUnHandlerNum, timeoutUnHandlerChainRatio, timeoutNum, timeoutChainRatio } = result;
  const {totalNum,chainRatio} = totalStat
  alarmListData.value.totalNum = totalNum
  alarmListData.value.totalRatio = chainRatio
  alarmListData.value.statList[0].count = unConfirmedNum
  alarmListData.value.statList[0].ratio = unConfirmedChainRatio
  alarmListData.value.statList[0].width = unConfirmedNum? unConfirmedNum / totalNum : 0
  alarmListData.value.statList[1].count = timeoutNum
  alarmListData.value.statList[1].ratio = timeoutChainRatio
  alarmListData.value.statList[1].width = timeoutNum ? timeoutNum / totalNum : 0
  alarmListData.value.statList[2].count = timeoutUnHandlerNum
  alarmListData.value.statList[2].ratio = timeoutUnHandlerChainRatio
  alarmListData.value.statList[2].width = timeoutUnHandlerNum? timeoutUnHandlerNum / totalNum : 0
};
//消防报警高发时段=========================
const RecordTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const gasChartData = reactive({
  xData: [],
  yData: [
    {
      name: "报警数",
      data: [],
      lineColor: '#1A57CA',
      linearGradientColor: ['rgba(26,87,202,0.6)', 'rgba(26,87,202,0.0)'],
    },
  ],
});
const changeReceptionRecordTime = async () => {
  alarmDetailParameter.value.dateRange = RecordTime.value.dateRange;
  let param = {
    period: RecordTime.value.dateRange.join(","),
    type: RecordTime.value.timeType,
    marketTenant: '',
    applicationCode: applicationCode,
  };
  let result = await alarmHighFrequencyPeriodStat(param);
  let xData = result.map((item) => {
    return item.period;
  });
  gasChartData.xData = getXDataByType("TODAY", xData);
  gasChartData.yData[0].data = result.map((item) => {
    return item.totalNum;
  });
};

const activeKey = ref("ALARM_ALL");
const alarmStatisticsData = ref([]);
const alarmModalShow = ref<boolean>(false);
const riskPage = reactive({
  total: 0,
  pageSize: 50,
  pageNumber: 1,
  pages: 0,
});
const alarmParameter = ref<Record<string, any>>({
  applicationCode: applicationCode,
  alarmStatus: "",
  alarmTypeCode: applicationCode,
});
const moreParameter = ref<Record<string, any>>({
  applicationCode: applicationCode,
  alarmStatus: "",
  alarmTypeCode: applicationCode,
});
const pieTime=ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const changeAlarmEvent=(val)=>{
  activeKey.value=val
  changeTimeAlarmEvent()
}
const changeTimeAlarmEvent = async () => {
  alarmParameter.value.dateRange = alarmEventTime.value.dateRange;
  let param = {
    period: alarmEventTime.value.dateRange.join(","),
    type: alarmEventTime.value.timeType,
    stateRange: activeKey.value,
    pageSize: riskPage.pageSize,
    pageNumber: riskPage.pageNumber,
    applicationCode: applicationCode,
  };
  let { records, total, pages } = await alarmStatisticsRank(param);
  autoPage(riskPage, total, pages)
  alarmStatisticsData.value = [];
  const newRecords = filterMarket(records)
  const totalNum = newRecords.reduce((pre,cur)=>pre+cur.totalNum,0)
  if (Array.isArray(newRecords) && newRecords.length > 0) {
    alarmStatisticsData.value = newRecords
      .sort((a, b) => b.totalNum - a.totalNum)
      .map((item, index) => {
        return {
          ...item,
          rank: index + 1,
          name: item.marketName,
          count: item.totalNum,
          value: item.totalNum,
          ratio: item.chainRatio,
          width:totalNum? item.totalNum / totalNum * 100 :0,
        };
      }).slice(0, 3);
  }
};
const clickRowAlarmEvent = (record) => {
  alarmParameter.value = {
    applicationCode: applicationCode,
    alarmTypeCode: applicationCode,
    dateRange: alarmEventTime.value.dateRange
  }
  alarmParameter.value = Object.assign(alarmParameter.value, record);

  alarmParameter.value.alarmStatus =
  activeKey.value == "ALARM_ALL" ? "" : "ALARM_HANDLER";
  alarmModalShow.value = true;
};
const moreClick = ()=>{
  moreParameter.value = Object.assign(moreParameter.value, {
    dateRange: alarmEventTime.value.dateRange,
    type: alarmEventTime.value.timeType,
    applicationCode: applicationCode,
    alarmTypeCode: applicationCode,
    stateRange: activeKey.value,
  });
  showAbnormalModal.value = true
}












const alarmEventTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});






const alarmDetailParameter = ref<Record<string, any>>({
  applicationCode: applicationCode,
  alarmTypeCode: applicationCode,
});
// 报警事件排名 报警记录 每15秒轮播
onMounted(() => {
  changeReceptionRecordTime();
  changePieTime()
  changeTimeAlarmEvent()
});

</script>
<style scoped lang="less">
.chart {
  flex: 1;
  height: 260px !important;
}

</style>
