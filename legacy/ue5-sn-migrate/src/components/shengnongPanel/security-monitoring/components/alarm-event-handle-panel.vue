<template>
  <SubPanelTemplate title="报警处理情况分析" image="cl.png">
    <template #extra>
      <DateInlineForm
        class="shengNongColor"
        v-model:modelValue="alarmTime"
        @search="changealarmTime"
      ></DateInlineForm>
    </template>
    <div class="chart" v-if="alarmStatisticsData.chartData.xData.length > 0">
      <StackedBar
        @clickbar="clickbar"
        :sn="true"
        :xData="alarmStatisticsData.chartData.xData"
        :yData="alarmStatisticsData.chartData.yData"
      />
    </div>
    <div style="width: 100%; margin-top: 30px" v-else>
      <noData />
    </div>
  </SubPanelTemplate>
  <modal-alarm-table
    :show-modal="alarmModalShow"
    @close="closeModal"
    :parameter="alarmParameter"
  ></modal-alarm-table>
</template>
<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, onUnmounted, watch } from "vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import SubPanelTemplate from "@/components/businessPanel/public/snPanelTemplate.vue";
import StackedBar from "@/components/businessPanel/public/charts/stacked-bar/stacked-bar.vue";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import { autoPage, HData, TwoArray } from "@/utils/common";
import { storeMarket } from "@/piniaStore/other";
import { alarmHandlerAnalysis } from "@/api/shennong/alarm";
import noData from "@/components/businessPanel/public/noData.vue";

const piniaStoreMarket = storeMarket();
const props = withDefaults(
  defineProps<{
    chartHeight?: number;
    applicationCode: string;
  }>(),
  {
    chartHeight: 300,
    applicationCode: "SECURITY_MONITORING",
  }
);

const alarmModalShow = ref<boolean>(false);
const alarmParameter = ref<Record<string, any>>({
  applicationCode: props.applicationCode,
  alarmStatus: "",
  alarmTypeCode: props.applicationCode,
});
const closeModal = () => {
  alarmModalShow.value = false;
};
const clickbar = (record) => {
  alarmModalShow.value = true;
  record.marketTenant = Xdata.value.find((res) => res.marketName == record.name)?.marketTenant;
  alarmParameter.value = Object.assign(alarmParameter.value, record);
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
const handleColors = ["#6AE0E4", "#95BCF9", "#6194F7", "#2F78F1"];
const currentindex = ref(0);
const Xdata = ref([]);
const changealarmTime = async () => {
  currentindex.value += 1;
  alarmParameter.value.dateRange = alarmTime.value.dateRange;
  let param = {
    period: alarmTime.value.dateRange.join(","),
    type: alarmTime.value.timeType,
    pageSize: alarmStatisticsData.page.pageSize,
    pageNumber: alarmStatisticsData.page.pageNumber,
    // marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: "SECURITY_MONITORING",
  };
  let { records, total, pages } = await alarmHandlerAnalysis(param);
  let { xdata, ydata } = records[0];
  const xlist = TwoArray(xdata, alarmStatisticsData.page.pageSize);
  let page = xdata.length / alarmStatisticsData.page.pageSize;
  if (currentindex.value >= Math.ceil(page)) {
    currentindex.value = 0;
  }
  if (!xdata || !ydata) return;
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
  height: 300px;
  margin-bottom: 30px;
}
</style>
