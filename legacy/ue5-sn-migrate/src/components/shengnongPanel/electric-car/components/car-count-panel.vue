<template>
  <div class="panel">
    <SubPanelTemplate title="各市场电动车辆数" image="tj.png">
      <!-- <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="alarmTime"
          @search="handleTime"
        ></DateInlineForm>
      </template> -->
      <div class="chart" v-if="alarmStatisticsData.chartData.xData.length > 0">
        <StackedBar
          @clickbar="clickbar"
          :sn="true"
          :xData="alarmStatisticsData.chartData.xData"
          :yData="alarmStatisticsData.chartData.yData"
          class="bar-chart"
        />
      </div>
      <div style="width: 100%; margin-top: 30px" v-else>
        <noData />
      </div>
    </SubPanelTemplate>
  </div>
  <modal-table :show="alarmModalShow" title="电动车建档记录" @close="closeModal">
    <modal-record
      :periodtime="''"
      type="ELECTRO_MOBILE"
      :marketid="marketId"
      :marketName="marketName"
      v-if="alarmModalShow"
      :showClass="false"
    ></modal-record>
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
import { propertyVehicleBar } from "@/api/shennong/alarm";
import noData from "@/components/businessPanel/public/noData.vue";
import modalTable from "@/components/modal-table/modal.vue";
import ModalRecord from "../../gasPanel/gastable.vue";

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
const marketName = ref('');
const closeModal = () => {
  alarmModalShow.value = false;
};
const clickbar = (record) => {
  marketName.value = record.name
  marketId.value = marketData.value.find(e => e.marketName === record.name)?.marketTenant
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
const handleColors = ["#6194F7", "#2F78F1"];
const currentindex = ref(0);
const Xdata = ref([]);
const changealarmTime = async () => {
  currentindex.value += 1;
  let param = {
    pageSize: alarmStatisticsData.page.pageSize,
    pageNumber: alarmStatisticsData.page.pageNumber,
  };
  let { records, total, pages } = await propertyVehicleBar(param);
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
const handleTime = () => {
  alarmStatisticsData.chartData.xData = []
  changealarmTime()
}
let timer = null;
// 报警处理情况 每15秒轮播
onMounted(() => {
  changealarmTime()
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
  height: 300px;
  margin-bottom: 30px;
}
</style>
