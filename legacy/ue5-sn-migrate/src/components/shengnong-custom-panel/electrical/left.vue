<template>
  <div class="panel">
    <SubPanelTemplate
      title="报警统计"
      image="icon-5.png"
    >
      <template #extra>
        <DateInlineForm
          v-model:modelValue="riskTime"
          @search="changeTimeRisk"
          :data="risk"
          menuPage="electrical"
        />
      </template>
      <EventStatistics
        :data="risk"
        @clickRow="(item)=>{clickRow(item)}"
        @changeTabs="changeRask"
        @moreClick="clickMore"
        :isScroll="isScroll"
        />
    </SubPanelTemplate>
    <SubPanelTemplate title="报警情况分析" image="bj.png">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="pieTime"
          @search="changePieTime"
          menuPage="electrical"
        ></DateInlineForm>
      </template>
      <SituationAnalysis
      :data="morePieData"
      @click="clickAlarmAnalysisBar"
      />
    </SubPanelTemplate>
    <SubPanelTemplate title="报警高发时段" image="icon-6.png" style="margin-top: 10px">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="RecordTime"
          @search="changeReceptionRecordTime"
          menuPage="electrical"
        >
        </DateInlineForm>
      </template>
      <div class="chart" v-if="gasChartData.xData.length > 0">
        <LineChart 
          :legendFontSize="calcFontSize(16)" 
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
    <modal-alarm-table
      :show-modal="alarmModalShow"
      @close="closeModal"
      :parameter="alarmParameter"
    />
    <Alarm
      v-if="alarmDetailModalShow"
      @close="() => {
        alarmDetailModalShow = false
        removeMarketToken()
      }"
      :isalarm="true"
      :alarmDetailData="alarmDetailParameter"
    />
    <AlarmStatisticsModal @close="showAbnormalModal = false" :modalTitle="'电气报警统计-各市场对应事件报警数'" :showModal="showAbnormalModal" :parameter="moreParameter"></AlarmStatisticsModal>
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
import { storeMarket } from "@/piniaStore/other";
import AlarmStatisticsModal from "../security-monitoring/components/alarm-statistics-modal.vue";
import { calcFontSize, filterMarket } from "@/utils/common";
import {
  alarmStatistics,
  alarmStatisticsRank,
  alarmTrendAnalysis,
} from "@/api/shennong/alarm";
import { removeMarketToken } from '@/components/hooks/useAlarm'
import Alarm from "@/components/alarmdetails/equipmentModesn.vue";

const applicationCode = "ELECTRICMANAGE";
const piniaStoreMarket = storeMarket();
const activeKey = ref("ALARM_ALL");
const isScroll=ref(false)

const alarmDetailModalShow = ref<boolean>(false);
const alarmDetailParameter = ref<Record<string, any>>({
  applicationCode: applicationCode,
  alarmTypeCode: applicationCode,
});

const showAbnormalModal = ref(false)

const clickRow = (record) => {
  alarmModalShow.value = true;
  alarmParameter.value = Object.assign(alarmParameter.value, record);
  alarmParameter.value.dateRange = riskTime.value.dateRange
  alarmParameter.value.alarmStatus = activeKey.value == "ALARM_ALL" ? "" : "ALARM_HANDLER";
};

const clickMore = () => {
  moreParameter.value = Object.assign(moreParameter.value, {
    dateRange: riskTime.value.dateRange,
    type: riskTime.value.timeType,
    alarmStatus: activeKey.value == "ALARM_ALL" ? "" : "ALARM_HANDLER",
    stateRange: activeKey.value,
  });
  showAbnormalModal.value = true
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
  const res  = await alarmStatistics(param);
  let { confirmedRatio, handlerRatio, timeoutRatio } = res
  morePieData.value = [
    {
      name: "报警响应率",
      value: Math.round(Number(confirmedRatio)),
      color: "#DCFFD6",
      key: "confirmedNum"
    },
    {
      name: "报警处理率",
      value: Math.round(Number(handlerRatio)),
      key:'handlerNum',
      color: "#D6E4FF",
    },
    {
      name: "报警超时率",
      value: Math.round(Number(timeoutRatio)),
      key:'timeoutNum',
      color: "#FFD6D6",
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
  autoPage(riskPage, total, pages)
  risk.value = [];
  if (Array.isArray(records) && records.length > 0) {
    const newRecords = filterMarket(records)
    const totalCount = getallNumber(newRecords, "totalNum")
    risk.value = newRecords
      .sort((a, b) => b.totalNum - a.totalNum)
      .map((item, index) => {
        return {
          ...item,
          rank: index + 1,
          name: item.marketName,
          count: item.totalNum,
          ratio: item.chainRatio,
          width: item.totalNum / totalCount * 100,
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
  let {alarmTrends } = await alarmTrendAnalysis(param);
  let xData = alarmTrends.map((item) => {
    return item.period;
  });

  gasChartData.xData = getXDataByType('TODAY', xData);
  gasChartData.yData[0].data = alarmTrends.map((item) => {
    return item.totalNum;
  });
};
const morePieData = ref();

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
