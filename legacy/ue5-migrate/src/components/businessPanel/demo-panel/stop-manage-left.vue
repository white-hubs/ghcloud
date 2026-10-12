<!-- 停车管理 -->
<template>
  <div>
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
function changeDate() {
  trafficFlowTrendData();
}
// 获取车位信息
const parkingLotInfo = async () => {
  parkingLotTotal.total = 545;
  circlePieData.percent = 123;
  dataList = [
    {
      title:'使用中',
      value:'320',
      color:"#328BF7"
    },
    {
      title:'空闲',
      value:'225',
      color:"#19F8F7"
    },
  ]
};
// 获取车流趋势信息
const trafficFlowTrendData = async () => {
  const res = [
    {
      name:'TODAY',
      xdata:[
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24"
      ],
      series:[
        {
          total:3900,
          value:[3, 7, 1, 0, 5, 9, 2, 4, 6, 8, 1, 3, 0, 7, 5, 2, 4, 9, 6, 8, 3, 1, 0, 2, 5, 7, 4, 6, 8, 9]
        },
        {
          total:3800,
          value:[2, 6, 4, 3, 8, 1, 0, 5, 7, 9, 3, 2, 1, 4, 6, 0, 8, 5, 7, 9, 2, 3, 8, 1, 0, 4, 6, 7, 5, 9]
        },
      ]
  },
     {
      name:'THIS_WEEK',
      xdata:[
  "周一",
  "周二",
  "周三",
  "周四",
  "周五",
  "周六",
  "周天"
        ],
      series:[
        {
          total:3900,
          value:[12, 45, 23, 6, 19, 38, 4, 27, 31, 10, 49, 22, 1, 36, 14, 5, 29, 41, 8, 33, 16, 47, 20, 39, 3, 25, 18, 7, 30, 44]
        },
        {
          total:3800,
          value:[9, 35, 2, 48, 15, 24, 11, 40, 32, 13, 46, 0, 21, 42, 17, 37, 28, 50, 34, 43, 26, 39, 8, 3, 45, 10, 20, 14, 1, 22]
        },
      ]
   },
     {
      name:'THIS_MONTH',
      xdata:[
  "8-1",
  "8-2",
  "8-3",
  "8-4",
  "8-5",
  "8-6",
  "8-7",
  "8-8",
  "8-9",
  "8-10",
  "8-11",
  "8-12",
  "8-13",
  "8-14",
  "8-15",
  "8-16",
  "8-17",
  "8-18",
  "8-19",
  "8-20",
  "8-21",
  "8-22",
  "8-23",
  "8-24",
  "8-25",
  "8-26",
  "8-27",
  "8-28",
  "8-29",
  "8-30",
  "8-31"
        ],
        series:[
        {
          total:3900,
          value:[34, 7, 92, 15, 78, 23, 61, 49, 88, 2, 54, 10, 39, 41, 67, 85, 11, 90, 27, 76, 4, 99, 32, 29, 18, 56, 73, 83, 46, 38]
        },
        {
          total:3800,
          value:[21, 95, 3, 60, 74, 9, 44, 50, 86, 12, 37, 65, 80, 30, 68, 1, 55, 94, 25, 42, 70, 14, 48, 82, 22, 77, 97, 36, 64, 91]
        },
      ]
 },
     {
      name:'THIS_YEAR',
      xdata:[
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12"
      ],
      series:[
        {
          total:3900,
          value:[123, 456, 78, 234, 345, 12, 89, 299, 400, 150, 67, 512]
        },
        {
          total:3800,
          value:[45, 212, 367, 89, 478, 23, 199, 305, 410, 56, 134, 287]
        },
      ]
  },
  ]
  const data = res.find(e=>e.name === timeType.value.timeType)
  lineData.xData = data.xdata;
  trafficList[0].value = data.series[0].total;
  trafficList[1].value = data.series[1].total;
  lineData.yData[0].data = data.series[0].value;
  lineData.yData[1].data = data.series[1].value;
};
// 滞留车辆分析
const vehicleAnalysisInfo = async () => {
  lineAndPillarData.xdata = ["周一", "周二", "周三", "周四", "周五", "周六", "周天"]
  lineAndPillarData.yData[0].data = [34, 7, 92, 15, 78, 23, 61, 49, 88, 2, 54, 10, 39, 41, 67, 85, 11, 90, 27, 76, 4, 99, 32, 29, 18, 56, 73, 83, 46, 38]
  lineAndPillarData.yData[1].data = [21, 95, 3, 60, 74, 9, 44, 50, 86, 12, 37, 65, 80, 30, 68, 1, 55, 94, 25, 42, 70, 14, 48, 82, 22, 77, 97, 36, 64, 91]
};

onMounted(() => {
  parkingLotInfo();
  vehicleAnalysisInfo();
  
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
.chart{
  height: 220px;
}
</style>
