<template>
    <SubPanelTemplate
      image="bj.png"
      title="报警事件分析"
    >
      <template #extra>
        <DateInlineForm
          v-model:modelValue="alarmAnalysisTime"
          @search="changeAlarmAnalysisTime"
          menuPage="securityMonitoring"
        ></DateInlineForm>
      </template>
        <EventAnalysis
        :data="alarmStatisticsData"
        @clickTotal="handleClickTotal"
        @clickRow="(item)=>{clickAlarmAnalysisBar(item)}" 
        />
    </SubPanelTemplate>
    <modal-alarm-table
    :show-modal="alarmModalShow"
    @close="closeModal"
    :parameter="alarmParameter"
  ></modal-alarm-table>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import DateInlineForm from "../../common/dateInlineForm.vue";
import SubPanelTemplate from "../../common/snPanelTemplate.vue";
import EventAnalysis from "../../common/event-analysis.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { alarmHandleAnalysisStat,alarmSituationStat,alarmRecordPage } from "@/api/shennong/alarm";
import { storeMarket } from '@/piniaStore/other'
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import bus from "@/utils/bus";
import { TopParams } from "../../common/alarmlist-event";

const props = withDefaults(
  defineProps<{
    applicationCode: string;
  }>(),
  {
    applicationCode: "SECURITY_MONITORING",
  }
);
const piniaStoreMarket = storeMarket();
const alarmAnalysisTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const alarmStatisticsData = ref({
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
        width:0,
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
        width:0,
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
        width:0,
        rank:1,
        lineColor:['rgba(75,134,255,0.00)','#4b86ff']
      },
  ]
});
const alarmParameter = ref<Record<string, any>>({
  applicationCode: props.applicationCode,
  alarmTypeCode: props.applicationCode,
});
const changeAlarmAnalysisTime = async () => {
  alarmParameter.value.dateRange = alarmAnalysisTime.value.dateRange;
  let param = {
    period: alarmAnalysisTime.value.dateRange.join(","),
    type: alarmAnalysisTime.value.timeType,
    pageSize: 5,
    pageNumber: 1,
    applicationCode: props.applicationCode,
    marketTenant: '',
  };
  const totalStat=await alarmSituationStat(param)
  let result = await alarmHandleAnalysisStat(param);
  const { confirmedChainRatio,unConfirmedNum, unConfirmedChainRatio, timeoutNum, timeoutChainRatio, timeoutUnHandlerNum, timeoutUnHandlerChainRatio } = result;
  const {totalNum,chainRatio} = totalStat
  alarmStatisticsData.value.totalNum = totalNum
  alarmStatisticsData.value.totalRatio = chainRatio
  alarmStatisticsData.value.statList[0].count = unConfirmedNum
  alarmStatisticsData.value.statList[0].ratio = unConfirmedChainRatio
  alarmStatisticsData.value.statList[0].width = unConfirmedNum? unConfirmedNum / totalNum : 0
  alarmStatisticsData.value.statList[1].count = timeoutNum
  alarmStatisticsData.value.statList[1].ratio = timeoutChainRatio
  alarmStatisticsData.value.statList[1].width = timeoutNum? timeoutNum / totalNum : 0
  alarmStatisticsData.value.statList[2].count = timeoutUnHandlerNum
  alarmStatisticsData.value.statList[2].ratio = timeoutUnHandlerChainRatio
  alarmStatisticsData.value.statList[2].width = timeoutUnHandlerNum? timeoutUnHandlerNum / totalNum : 0
};
const alarmModalShow = ref<boolean>(false);

const clickAlarmAnalysisBar = (record) => {
  alarmParameter.value = {
    applicationCode: props.applicationCode,
    alarmTypeCode: props.applicationCode,
    dateRange: alarmAnalysisTime.value.dateRange,
    alarmHandlerTimeoutStatus:["timeoutNum",'timeoutUnHandlerNum'].includes(record.key)?'TIMED_OUT':'',
    filterAlarmStatus: record.key==="timeoutUnHandlerNum"?'ALARM_HANDLER':'',
    alarmStatus:["handlerNum"].includes(record.key)  ? "ALARM_HANDLER" : record.key == "unConfirmedNum" ? "ALARM_UN_CONFIRMED" : null,
  }
  alarmModalShow.value = true;
};

bus.on("topPanelClick", (item: TopParams): void => {
  if (item?.key === "totalNum") {
    alarmParameter.value = {
      applicationCode: props.applicationCode,
      alarmTypeCode: props.applicationCode,
      dateRange: item?.period?.split(','),
    }
    alarmModalShow.value = true;
  } else if (item?.key === "handlerNum") {
    alarmParameter.value = {
      applicationCode: props.applicationCode,
      alarmTypeCode: props.applicationCode,
      dateRange: item?.period?.split(','),
      alarmStatus: "ALARM_HANDLER",
    }
    alarmModalShow.value = true;
  }
});
const handleClickTotal = (record) => {
  alarmParameter.value = {
    applicationCode: props.applicationCode,
    alarmTypeCode: props.applicationCode,
    dateRange: alarmAnalysisTime.value.dateRange,
  }
  alarmModalShow.value = true;
};
const closeModal = () => {
  alarmModalShow.value = false;
};
</script>
<style lang="less" scoped>
</style>