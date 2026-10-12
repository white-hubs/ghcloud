<template>
  <div class="panel">
  <SubPanelTemplate title="各市场车辆违规/违停数" image="tj.png">
    <template #extra>
      <DateInlineForm
        class="shengNongColor"
        v-model:modelValue="alarmTime"
        @search="handleTime"
      ></DateInlineForm>
    </template>
    <div class="chart" v-if="alarmStatisticsData.chartData.xData.length > 0">
      <StackedBar
        @clickbar="clickbar"
        :sn="true"
        :xData="alarmStatisticsData.chartData.xData"
        :yData="alarmStatisticsData.chartData.yData"
        style="width: 100%;"
      />
    </div>
    <div style="width: 100%; margin-top: 30px" v-else>
      <noData />
    </div>
  </SubPanelTemplate>
  </div>
  <modal-table
    v-if="alarmModalShow"
    :show="alarmModalShow"
    title="车辆违规/违停记录"
    @close="closeModal"
  >
    <inspect-record :parameter="alarmParameter"></inspect-record>
  </modal-table>
</template>
<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, onUnmounted, watch } from "vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import SubPanelTemplate from "@/components/businessPanel/public/snPanelTemplate.vue";
import StackedBar from "@/components/businessPanel/public/charts/stacked-bar/stacked-bar.vue";
import { TwoArray } from "@/utils/common";
import { storeMarket } from "@/piniaStore/other";
import { storeArea } from "@/piniaStore/area";
import { inspectVehicleViolation } from "@/api/shennong/alarm";
import noData from "@/components/businessPanel/public/noData.vue";
import modalTable from "@/components/modal-table/modal.vue";
import inspectRecord from "./inspect-record.vue";

const piniaStoreArea = storeArea();
const piniaStoreMarket = storeMarket();
const props = withDefaults(
  defineProps<{
    chartHeight?: number;
    applicationCode: string;
  }>(),
  {
    chartHeight: 300,
    applicationCode: "",
  }
);

const alarmModalShow = ref<boolean>(false);
const marketData = ref(piniaStoreArea.marketDataCN ?? []);
const marketId = ref('');
const alarmParameter = ref<Record<string, any>>({
  applicationCode: props.applicationCode,
  period: [],
  tagName: [],
  marketTenant: ""
});
const closeModal = () => {
  alarmModalShow.value = false;
};
const clickbar = (record) => {
  alarmParameter.value = Object.assign(alarmParameter.value, {
    ...record,
    marketTenant: marketData.value.find(e => e.marketName === record.name)?.marketTenant,
    period: alarmTime.value.dateRange,
    tagName: record.seriesName,
  });
  alarmModalShow.value = true;
};
const alarmStatisticsData = reactive({
  chartData: {
    xData: [],
    yData: [],
  },
  page: {
    total: 0,
    pages: 0,
    pageSize: 5,
    pageNumber: 1,
  },
});
const alarmTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const handleColors = ["#C5A98C", "#6194F7"];
const currentindex = ref(0);
const Xdata = ref([]);
const changealarmTime = async () => {
  currentindex.value += 1;
  let param = {
    period: alarmTime.value.dateRange.join(","),
    type: alarmTime.value.timeType,
    pageSize: alarmStatisticsData.page.pageSize,
    pageNumber: alarmStatisticsData.page.pageNumber,
  };
  let { records, total, pages } = await inspectVehicleViolation(param);
  let { xdata, ydata } = records[0];
  if (!xdata || !ydata) return;
  const xlist = TwoArray(xdata, alarmStatisticsData.page.pageSize);
  let page = xdata.length / alarmStatisticsData.page.pageSize;
  if (currentindex.value >= Math.ceil(page)) {
    currentindex.value = 0;
  }
  alarmStatisticsData.chartData.xData =
    xlist.length > 0 ? xlist[currentindex.value].map((item) => item.marketName) : [];
  alarmStatisticsData.chartData.yData = ydata.map((item, index) => {
    return {
      name: item.name,
      value: TwoArray(item.value, alarmStatisticsData.page.pageSize)[currentindex.value],
      datavalue: item.value,
      color: handleColors[index % handleColors.length],
      marketlist: {
        xdata: xlist,
        ydata: TwoArray(item.value, alarmStatisticsData.page.pageSize),
      },
    };
  });
  Xdata.value = records[0].xdata;
};
const handleTime = () => {
  alarmStatisticsData.chartData.xData = []
  changealarmTime()
}
let timer = null;
// 报警处理情况 每15秒轮播
onMounted(() => {
  timer = setInterval(() => {
    changealarmTime()
  }, (window as any).config.pageLoopRequestTime);
});

watch(
  () => piniaStoreMarket.currentMarketName,
  (n) => {
    if (n) {
      clearInterval(timer);
      changealarmTime();
    } else {
      // alarmStatisticsData.chartData.xData = [];
      changealarmTime();
      timer = setInterval(() => {
        changealarmTime();
      }, (window as any).config.pageLoopRequestTime);
    }
  },
  { deep: true }
);
onUnmounted(() => {
  clearInterval(timer);
});
</script>
<style lang="less" scoped>
.chart {
  width: 1.80917rem;
  height: 260px;
  margin-bottom: 30px;
}
</style>
