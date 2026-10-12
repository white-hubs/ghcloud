<template>
  <SubPanelTemplate :title="props.title" zoomable :zoom-title="`${props.title}详情`" :zoom-width="600">
    <template #extra>
      <DateInlineForm v-model:modelValue="timeType" @search="timeDate" data-no-zoom></DateInlineForm>
    </template>
    <div class="barChart" data-no-zoom>
      <overviewChartBar
        @clickbar="alarmClickBar"
        :bottom="'0%'"
        :title="''"
        :xData="barData.xData"
        :yData="barData.yData"
      ></overviewChartBar>
    </div>
    <template #zoom-content>
      <div class="zoom-alarm-content">
        <div class="zoom-barChart" data-no-zoom>
          <overviewChartBar
            @clickbar="alarmClickBarZoom"
            :bottom="'0%'"
            :title="''"
            :xData="barData.xData"
            :yData="barData.yData"
            :height="360"
          ></overviewChartBar>
        </div>
      </div>
    </template>
  </SubPanelTemplate>
  <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="parameter"></modal-alarm-table>
</template>
<script lang="ts" setup>
import { reactive, ref } from "vue";

import { alarmEventTypeStatisticsc } from "@/api/alarm";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import { useStateStore } from "@/pages/state/use-state-store";

const props = withDefaults(
  defineProps<{
    title?: string;
  }>(),
  {
    title: "报警情况统计",
  },
);
const { globalState } = useStateStore();
const alarmModalShow = ref<boolean>(false);
let eventDataList = [];
let timeType = ref({
  timeType: "THIS_YEAR",
  dateRange: [],
});
const parameter = reactive({
  alarmEventTypeId: "",
  dateRange: [],
});
const closeModal = () => {
  alarmModalShow.value = false;
};
const timeDate = async () => {
  const data = await alarmEventTypeStatisticsc({
    areaId: globalState.business.currentAreaId,
    period: timeType.value.dateRange.join(","),
    sceneType: globalState.business.currentMenu,
    type: timeType.value.timeType,
  });
  barData.xData = data.map((res) => {
    return res.name;
  });
  barData.yData[0].data = data.map((res) => {
    return res.totalNum;
  });
  eventDataList = data;
};

const barData = reactive({
  xData: ["1", "2", "3"],
  yData: [
    {
      data: [],
      name: "",
      color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
    },
  ],
});
const alarmClickBar = (value) => {
  const { name } = value;
  const findItem = eventDataList.find((item) => item.name === name);
  if (findItem) {
    parameter.alarmEventTypeId = findItem.id;
    parameter.dateRange = timeType.value.dateRange;
    alarmModalShow.value = true;
  }
};

// 放大模式下的点击处理（复用原有逻辑）
const alarmClickBarZoom = (value: any) => {
  alarmClickBar(value);
};
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
  box-shadow:
    inset 0px 0px 10px 0px rgba(41, 137, 255, 0.6),
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
.barChart {
  height: 250px;
  margin: 20px 0;
}

// 放大弹窗内的样式
.zoom-alarm-content {
  padding: 20px;
  min-height: 400px;

  .zoom-barChart {
    height: 360px;
  }
}
</style>
