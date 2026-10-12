<!-- 停车管理 -->
<template>
  
  <div >
    <SubPanelTemplate title="收费总览">
      <template #extra>
        <DateInlineForm
        v-model:modelValue="collectFees"
        @search="getChargingOverviewInfo"
        ></DateInlineForm>
      </template>
      <div class="chargingModuleBox" style="min-height: 150px">
        <chargingModule
          :collectFeesData="item"
          v-for="(item, index) in collectFeesList.arr"
          :key="index"
        >
        </chargingModule>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="支付方式占比">
      <!-- <template #bar>
                <div class="right-bar">查看更多》</div>
                            </template> -->
      <template #extra>
      <DateInlineForm
        v-model:modelValue="pay"
        @search="paymentProportion"
      ></DateInlineForm>
      </template>
      <OperateDays
        style="margin-top: 10px"
        :value="total"
        title="实收总金额"
        :unit="moneyUnit"
        :decimals="2"
      >
      </OperateDays>
      <div class="equipmentAlarm">
        <RoundPie :data="roundPieData.arr">
          <div>
            <img width="25" height="25" :src="getAssetsImage('money1.png')" alt="" />
          </div>
        </RoundPie>
        <pieList :roundPieData="roundPieData.arr"></pieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="收费趋势" class="collect">
      <template #extra>
      <DateInlineForm
        v-model:modelValue="trend"
        @search="chargingTrendsInfo"
      ></DateInlineForm>
      </template>
      <div class="chart">
        <LineChart :x-data="xData.arr" :series="series.arr" :title="'元'"></LineChart>
      </div>
    </SubPanelTemplate>
  </div>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import changeBar from "../public/changeBar.vue";
import chargingModule from "../public/chargingModule.vue";
import OperateDays from "../public/operateDays.vue";
import RoundPie from "../public/charts/roundPie/roundPie.vue";
import pieList from "../public/pieList.vue";
import LineChart from "../public/lineChart.vue";
import { getAssetsImage } from "../../../utils/getImage";
import {
  chargingOverview,
  paymentMethod,
  chargingTrends,
} from "@/utils/requestData/parkingSpaceManage";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useStateStore } from "@/pages/state/use-state-store";
const { globalState } = useStateStore()

watch(
  () => globalState.business.currentAreaId,
  () => {
    clearInterval(timer);
    timer = setInterval(() => {
      init();
    }, (window as any).config.pageLoopRequestTime);
    init();
  }
);
let collectFees = ref();
let pay = ref();
let trend = ref();
let timer: any = reactive(null);
let total = ref(0);
let colorList = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A", "#CBE2FF"];
const moneyUnit = ref<string>("元");
let roundPieData = reactive({
  arr: [],
});
let xData = reactive({
  arr: [],
});

const series = reactive({
  arr: [
    {
      data: [0, 0, 0, 0, 0, 0, 0, 0],
      linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
    },
  ],
});
let collectFeesList: any = reactive({
  arr: [],
});

// 收费总览
const getChargingOverviewInfo = async () => {
  collectFeesList.arr = await chargingOverview({ dimension: collectFees.value.timeType });
};
// 支付方式占比
const paymentProportion = async () => {
  let res = await paymentMethod({ dimension: pay.value.timeType });
  roundPieData.arr = res.arr.map((item, index) => {
    item.color = colorList[index];
    return item;
  });
  if (res.total > 100000) {
    total.value = res.total / 10000;
    moneyUnit.value = "万元";
  } else {
    total.value = res.total;
    moneyUnit.value = "元";
  }
};
// 收费趋势
const chargingTrendsInfo = async () => {
  let res = await chargingTrends({ dimension: trend.value.timeType });
  xData.arr = res.xdata;
  series.arr[0].data = res.series[0].value;
};
const init = () => {
  getChargingOverviewInfo();
  paymentProportion();
  chargingTrendsInfo();
};

onMounted(() => {
  timer = setInterval(() => {
    init();
  }, (window as any).config.pageLoopRequestTime);
});
onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>
<style lang="less" scoped>
.chargingModuleBox {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 30px;
}

.ringRatio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin-left: 6px;
}

.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 10px;
}
.collect {
  .chart {
    height: 220px;
  }
}
</style>
