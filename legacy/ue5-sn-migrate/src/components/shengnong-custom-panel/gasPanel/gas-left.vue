<template>
  <div class="panel">
    <SubPanelTemplate title="报警统计" image="fire.png">
      <template #extra>
        <DateInlineForm v-model:modelValue="riskTime" @search="changeTimeRisk" :data="risk" menuPage="gas" />
      </template>
      <EventStatistics :data="risk" @clickRow="(item)=>{clickRow(item)}" @changeTabs="changeRask" @moreClick="moreClick"
        :isScroll="isScroll" />
    </SubPanelTemplate>
    <SubPanelTemplate title="报警情况分析" image="bj.png">
      <template #extra>
        <DateInlineForm v-model:modelValue="pieTime" @search="changePieTime" menuPage="gas"></DateInlineForm>
      </template>
      <SituationAnalysis :data="morePieData"  @click="clickAlarmAnalysisBar"/>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警高发时段" image="fire.png" style="margin-top: 10px">
      <template #extra>
        <DateInlineForm v-model:modelValue="RecordTime" @search="changeReceptionRecordTime" menuPage="gas">
        </DateInlineForm>
      </template>
      <div class="chart" v-if="gasChartData.xData.length > 0">
        <LineChart :legendFontSize="calcFontSize(16)" :x-data="gasChartData.xData" :series="gasChartData.yData" :showLegend="true" gridTop="15"
          :showBackground="true" :axisPointer="true" :titles="['报警数']" :unit="{ x: '', y: '' }" />
      </div>
      <noData v-else />
    </SubPanelTemplate>
    <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="alarmParameter" />
    <AlarmStatisticsModal @close="showAbnormalModal = false" :modalTitle="'用气安全报警统计-各市场对应事件报警数'" :showModal="showAbnormalModal" :parameter="moreParameter"></AlarmStatisticsModal>
    <Alarm v-if="alarmDetailModalShow" @close="() => {
        alarmDetailModalShow = false
        removeMarketToken()
      }" :isalarm="true" :alarmDetailData="alarmDetailParameter" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from "vue";
import noData from "@/components/businessPanel/public/noData.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "../common/snPanelTemplate.vue";
import DateInlineForm from "../common/dateInlineForm.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import { autoPage, getXDataByType, getcurrentData, getallNumber } from "@/utils/common";
import EventStatistics from '../common/event-statistics.vue'
import SituationAnalysis from '../common/situation-analysis.vue'
import AlarmStatisticsModal from "../security-monitoring/components/alarm-statistics-modal.vue";
import { storeMarket } from "@/piniaStore/other";
import { calcFontSize } from "@/utils/common";
import {
  alarmStatistics,
  alarmStatisticsRank,
  alarmTrendAnalysis,
  alarmHighFrequencyPeriodStat,
} from "@/api/shennong/alarm";
import { removeMarketToken } from '@/components/hooks/useAlarm'
import Alarm from "@/components/alarmdetails/equipmentModesn.vue";
import { filterMarket } from "@/utils/common";

const applicationCode = "GAS_MANAGEMENT";
const piniaStoreMarket = storeMarket();
const activeKey = ref("ALARM_ALL");
const isScroll=ref(false)
const showAbnormalModal = ref(false)
const alarmDetailModalShow = ref<boolean>(false);
const alarmDetailParameter = ref<Record<string, any>>({
  applicationCode: applicationCode,
  alarmTypeCode: applicationCode,
});
const clickRow = (data) => {
  alarmModalShow.value = true;
  alarmParameter.value = {
    applicationCode: applicationCode,
    alarmTypeCode: applicationCode,
    dateRange: riskTime.value.dateRange
  }
  alarmModalShow.value = true;
  alarmParameter.value = Object.assign(alarmParameter.value, data);
  alarmParameter.value.dateRange = riskTime.value.dateRange
  alarmParameter.value.alarmStatus = activeKey.value == "ALARM_ALL" ? "" : "ALARM_HANDLER";
};

const alarmModalShow = ref<boolean>(false);
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
const closeModal = () => {
  alarmModalShow.value = false;
};
const RecordTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const pieTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const riskTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const risk = ref([]);
const changePieTime = async () => {
  let param = {
    period: pieTime.value.dateRange.join(","),
    type: pieTime.value.timeType,
    marketTenant: '',
    applicationCode: applicationCode,
  };
  let res: any = await alarmStatistics(param);
  let {
    confirmedRatio,
    handlerRatio,
    timeoutRatio,
  } = res;
  morePieData.value = [
    {
      name: "报警响应率",
      value: Number(confirmedRatio),
      color: "#DCFFD6",
      key: "confirmedNum"
    },
    {
      name: "报警处理率",
      value: Number(handlerRatio),
      color: "#D6E4FF",
      key:'handlerNum',
    },
    {
      name: "报警超时率",
      value: Number(timeoutRatio),
      color: "#FFD6D6",
      key:'timeoutNum',
    },
  ];
};
const riskPage = reactive({
  total: 0,
  pageSize: 50,
  pageNumber: 1,
  pages: 0,
});
const changeRask=(val)=>{
  activeKey.value=val
  changeTimeRisk()
}
const changeTimeRisk = async () => {
  alarmParameter.value.dateRange = riskTime.value.dateRange;
  let param = {
    period: riskTime.value.dateRange.join(","),
    type: riskTime.value.timeType,
    stateRange: activeKey.value,
    pageSize: riskPage.pageSize,
    pageNumber: riskPage.pageNumber,
    applicationCode: applicationCode,
  };
  let { records, total, pages } = await alarmStatisticsRank(param);
  risk.value = [];
  if (Array.isArray(records) && records.length > 0) {
    const newRecords = filterMarket(records)
    const totalNum=getallNumber(newRecords, "totalNum")
    risk.value = newRecords
      .sort((a, b) => b.totalNum - a.totalNum)
      .map((item, index) => {
        return {
          ...item,
          rank: index + 1,
          name: item.marketName,
          count: item.totalNum,
          ratio: item.chainRatio,
          width:totalNum? item.totalNum / totalNum * 100 :0,
        };
      }).slice(0, 3);
  }
};
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
const morePieData = ref();

const moreClick = ()=>{
  moreParameter.value = Object.assign(moreParameter.value, {
    dateRange: riskTime.value.dateRange,
    type: riskTime.value.timeType,
    alarmStatus: activeKey.value == "ALARM_ALL" ? "" : "ALARM_HANDLER",
    stateRange: activeKey.value,
  });
  showAbnormalModal.value = true
}
const clickAlarmAnalysisBar = (record) => {
  alarmParameter.value = {
    applicationCode: '',
    alarmTypeCode: '',
    dateRange: pieTime.value.dateRange,
    alarmHandlerTimeoutStatus:["timeoutNum",'timeoutUnHandlerNum'].includes(record.key)?'TIMED_OUT':'',
    filterAlarmStatus: record.key==="confirmedNum"?'ALARM_UN_CONFIRMED':'',
    alarmStatus:["handlerNum"].includes(record.key)  ? "ALARM_HANDLER" : record.key == "unConfirmedNum" ? "ALARM_UN_CONFIRMED" : null,
  }
  alarmModalShow.value = true;
};
</script>
<style scoped lang="less">
.chart {
  flex: 1;
  height: 220px !important;
}
</style>
