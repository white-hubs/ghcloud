<template>
  <SubPanelTemplate title="报警情况分析" image="bj.png" class="gz">
    <template #extra>
    <DateInlineForm v-model:modelValue="pieTime" :showCustom="true" menuPage="comprehensive" @search="changePieTime"></DateInlineForm>
  </template>
  <SituationAnalysis :data="morePieData" @click="clickAlarmAnalysisBar"/>
</SubPanelTemplate>
<modal-alarm-table
  :show-modal="alarmModalShow"
  @close="closeModal"
  :parameter="alarmParameter"
></modal-alarm-table>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted} from 'vue'
import SubPanelTemplate from "../../common/snPanelTemplate.vue";
import DateInlineForm from "../../common/dateInlineForm.vue";
import { ModelValueItf } from "../../../businessPanel/public/types";
import { storeMarket } from "@/piniaStore/other";
import { alarmHandleAnalysisStat, alarmSituationStat, alarmStatistics } from '@/api/shennong/alarm';
import SituationAnalysis from './situation-analysis.vue'
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";

const props = withDefaults(
  defineProps<{
    applicationCode: string;
  }>(),
  {
    applicationCode: "",
  }
);
const piniaStoreMarket = storeMarket();
const pieTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const morePieData = ref();
const changePieTime = async () => {
  let param = {
    period: pieTime.value.dateRange.join(","),
    type: pieTime.value.timeType,
    marketTenant: '',
    applicationCode: props.applicationCode,
  };

  const totalStat=await alarmSituationStat(param)
  let result = await alarmHandleAnalysisStat(param);
  const { handlerNum, handlerChainRatio, timeoutNum, timeoutChainRatio, timeoutUnHandlerNum, timeoutUnHandlerChainRatio } = result;
  const {totalNum, chainRatio} = totalStat
  morePieData.value = [
    {
      name: "已处理报警数",
      value: Number(handlerNum),
      key:'handlerNum',
      color: "#DCFFD6",
      ratioTit: '环比',
      ratio: Math.round(Number(handlerChainRatio)),
      icon: 'pie-03.png'
    },
    {
      name: "报警总数",
      value: Number(totalNum),
      key:'totalNum',
      color: "#D6E4FF",
      ratioTit: '环比',
      ratio: Math.round(Number(chainRatio)),
      icon: 'pie-01.png'
    },
    {
      name: "超时报警数",
      value: Number(timeoutNum),
      key:'timeoutNum',
      color: "#FFD6D6",
      ratioTit: '环比',
      ratio: Math.round(Number(timeoutChainRatio)),
      icon: 'pie-02.png'
    },
  ];
};
const alarmModalShow = ref<boolean>(false);
const alarmParameter = ref<Record<string, any>>({});
const clickAlarmAnalysisBar = (record) => {
  alarmParameter.value = {
    applicationCode: '',
    alarmTypeCode: '',
    dateRange: pieTime.value.dateRange,
    alarmHandlerTimeoutStatus:["timeoutNum",'timeoutUnHandlerNum'].includes(record.key)?'TIMED_OUT':'',
    filterAlarmStatus: record.key==="timeoutUnHandlerNum"?'ALARM_HANDLER':'',
    alarmStatus:["handlerNum"].includes(record.key)  ? "ALARM_HANDLER" : record.key == "unConfirmedNum" ? "ALARM_UN_CONFIRMED" : null,
  }
  alarmModalShow.value = true;
};
const closeModal = () => {
  alarmModalShow.value = false;
};
</script>
<style lang="less" scoped>
.chart {
  flex: 1;
  height: 260px !important;
}
</style>