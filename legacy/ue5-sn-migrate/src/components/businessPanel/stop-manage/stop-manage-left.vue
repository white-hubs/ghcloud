<!-- 停车管理 -->
<template>
  <div class="panel">
    <SubPanelTemplate title="车位总览">
      <OperateDays :value="parkingLotTotal.total" title="车位总数" :unit="'个'">
      </OperateDays>
      <div class="parkingLot">
        <circlePie :percent="circlePieData.percent" :selectedColor="circlePieData.selectedColor"
          :blgColor="circlePieData.blgColor">
          <div class="backgroundBox">
            <img :src="getAssetsImage('vehicle.png')" />
          </div>
        </circlePie>
        <deviceModule :data-list="dataList"></deviceModule>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="车流趋势">
      <template #extra>
        <DateInlineForm v-model:modelValue="timeType" @search="changeDate"></DateInlineForm>
      </template>
      <div class="trafficBox">
        <traffic v-for="item in trafficList" :key="item.color" :trafficInfo="item"></traffic>
      </div>
      <div class="chart">
        <stackedLine :title="lineData.title" :yData="lineData.yData" :xData="lineData.xData"
          :color="['#2989FF', '#FF6E23']"></stackedLine>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="滞留车辆分析">
      <div class="chart">
        <lineAndPillar :title="lineAndPillarData.title" :xData="lineAndPillarData.xdata" :yData="lineAndPillarData.yData">
        </lineAndPillar>
      </div>
    </SubPanelTemplate>
  </div>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import OperateDays from "../public/operateDays.vue";
import changeBar from "../public/changeBar.vue";
import traffic from "../public/traffic.vue";
import stackedLine from "../public/charts/stackedLine/stackedLine.vue";
import lineAndPillar from "../public/charts/lineAndPillar/lineAndPillar.vue";
import circlePie from "../public/charts/circlePie/circlePie.vue";
import deviceModule from "../public/deviceModule.vue";
import { getAssetsImage } from "../../../utils/getImage";
import { GetParkingOverview } from "@/api/models/park-management";
import {
  parkingData,
  trafficFlowTrend,
  vehicleAnalysisData,
} from "@/utils/requestData/parkingSpaceManage";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { storeArea } from "@/piniaStore/area";
const piniaStoreArea = storeArea();
let parkingLotTotal = reactive<GetParkingOverview>({
  empty: 0,
  total: 0,
  used: 0,
});
let dataList = reactive([]);
let timeType = ref();
let timer: any = reactive(null);

const trafficList = reactive([
  {
    color: "#2989FF",
    label: "驶入",
    value: 0,
  },
  {
    color: "#FF6E23",
    label: "驶出",
    value: 0,
  },
]);
const lineData = reactive({
  title: "辆",
  xData: [],
  yData: [
    {
      data: [],
      name: "驶入",
      colors: [
        {
          offset: 0,
          color: "rgba(41, 137, 255, 1)",
        },
        {
          offset: 1,
          color: "rgba(41, 137, 255, 0.20)",
        },
      ],
    },
    {
      data: [],
      name: "驶出",
      colors: [
        {
          offset: 0,
          color: "rgba(255, 110, 35, 1)",
        },
        {
          offset: 1,
          color: "rgba(255, 110, 35, 0.02)",
        },
      ],
    },
  ],
});
const lineAndPillarData = reactive({
  title: "辆",
  xdata: [],
  yData: [
    {
      name: "滞留车辆数",
      data: [],
      color: "#FFC700",
    },
    {
      name: "滞留车辆占比",
      data: [],
      color: "#2981EA",
    },
  ],
});
const circlePieData = reactive({
  percent: 0,
  selectedColor: "#2989FF",
  blgColor: "#19F8F7",
});
watch(
  () => piniaStoreArea.currentAreaId,
  () => {
    clearInterval(timer);
    timer = setInterval(() => {
      init();
    }, (window as any).config.pageLoopRequestTime);
    init();
  }
);
function changeDate() {
  trafficFlowTrendData();
}
// 获取车位信息
const parkingLotInfo = async () => {
  let res = await parkingData();
  parkingLotTotal = res.parkingLotTotal;

  circlePieData.percent = res.circlePieData;
  dataList = res.dataList;
};
// 获取车流趋势信息
const trafficFlowTrendData = async () => {
  let res = await trafficFlowTrend({ dimension: timeType.value.timeType });
  lineData.xData = res.xdata;
  trafficList[0].value = res.series[0].total;
  trafficList[1].value = res.series[1].total;
  lineData.yData[0].data = res.series[0].value;
  lineData.yData[1].data = res.series[1].value;
};
// 滞留车辆分析
const vehicleAnalysisInfo = async () => {
  let res = await vehicleAnalysisData();
  lineAndPillarData.xdata = res.xdata;
  lineAndPillarData.yData[0].data = res.series[0].value;
  lineAndPillarData.yData[1].data = res.series[1].value;
};
const init = () => {
  trafficFlowTrendData();
};

onMounted(() => {
  parkingLotInfo();
  vehicleAnalysisInfo();
  timer = setInterval(() => {
    init();
  }, (window as any).config.pageLoopRequestTime);
});
onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>
<style lang="less" scoped>
.panel {
  .chart {
    height: 220px;
  }
}

.trafficBox {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 12px;
}

.parkingLot {
  display: flex;
  justify-content: space-around;
  margin-top: 30px;
}

.backgroundBox {
  width: 86px;
  height: 86px;
  background: rgba(41, 137, 255, 0.302);
  box-shadow: inset 0px 0px 10px 0px rgba(41, 137, 255, 0.6),
    inset 0px 0px 6px 0px rgba(41, 137, 255, 0.8);
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  transform: translate(-50%, -50%);

  img {
    width: 36px;
    height: 28px;
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
