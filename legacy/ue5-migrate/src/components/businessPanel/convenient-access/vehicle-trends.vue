<template>
  <SubPanelTemplate title="车流趋势" zoomable zoom-title="车流趋势详情">
    <template #extra>
      <div class="dataTitle-box" data-no-zoom>
        <DateInlineForm v-model:modelValue="timeType" @search="changeDate"></DateInlineForm>
        <div class="dataTitle">
          <div class="dataTitle-right" style="color: #5ea6ff" @click="handleAll">查看更多>></div>
        </div>
      </div>
    </template>
    <div class="trafficBox" data-no-zoom>
      <traffic v-for="item in trafficList" :key="item.color" :trafficInfo="item"></traffic>
    </div>
    <div class="chart" data-no-zoom>
      <stackedLine :title="lineData.title" :yData="lineData.yData" :xData="lineData.xData" :color="['#2989FF', '#FF6E23']"> </stackedLine>
    </div>
    <template #zoom-content>
      <div class="zoom-content">
        <div class="zoom-trafficBox" data-no-zoom>
          <traffic v-for="item in trafficList" :key="item.color" :trafficInfo="item"></traffic>
        </div>
        <div class="zoom-chart" data-no-zoom>
          <stackedLine
            :title="lineData.title"
            :yData="lineData.yData"
            :xData="lineData.xData"
            :color="['#2989FF', '#FF6E23']"
            :height="380"
          >
          </stackedLine>
        </div>
      </div>
    </template>
  </SubPanelTemplate>
  <vehicleTrendsModal :params="vehicleParams" :showModal="showModal" @close="showModal = false"></vehicleTrendsModal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import vehicleTrendsModal from "./vehicle-trends-modal.vue";
import stackedLine from "@/components/businessPanel/public/charts/stackedLine/stackedLine.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import traffic from "@/components/businessPanel/public/traffic.vue";
import { trafficFlowTrend } from "@/utils/requestData/parkingSpaceManage";

let timeType = ref();
const showModal = ref(false);
const vehicleParams = reactive({
  period: [],
});
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
const handleAll = () => {
  vehicleParams.period = timeType.value.dateRange;
  showModal.value = true;
};
async function changeDate() {
  let res = await trafficFlowTrend({ dimension: timeType.value.timeType });
  lineData.xData = res.xdata;
  trafficList[0].value = res.series[0].total;
  trafficList[1].value = res.series[1].total;
  lineData.yData[0].data = res.series[0].value;
  lineData.yData[1].data = res.series[1].value;
}
</script>
<style lang="less" scoped>
.trafficBox {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 12px;
}

.chart {
  height: 220px;
}

.dataTitle-box {
  display: flex;

  .dataTitle {
    color: #abb8cb;
    font-size: 14px;
    text-align: right;

    .dataTitle-right {
      cursor: pointer;
    }
  }
}

.zoom-content {
  padding: 20px;
  min-height: 400px;
}

.zoom-trafficBox {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 20px 0;
}

.zoom-chart {
  height: 380px;
}
</style>
