<template>
  <div class="panel overview-left">
    <SubPanelTemplate :title="props.title" class="device-count" zoomable :zoom-title="`${props.title}详情`" :zoom-width="600">
      <!-- 面板内容：同时在面板和弹窗中展示 -->
      <DeviceStatistics
        @handelClickItemize="handelClickItemize"
        imgPath="business-icon/triage-queue/6.png"
        :statistic="deviceStatisticsData"
      ></DeviceStatistics>
      <div class="device-count-chart">
        <div class="chart">
          <elevator-analysis-pie @clickbar="handelClickDeviceItemize" class="elevator-analysis-left" :radius="'75'" :pieData="pieData">
            <div style="color: #fff; text-align: center; font-size: 14px">{{ deviceStatisticsData.total }}</div>
            <div style="color: #fff; text-align: center; font-size: 14px">设备总数</div>
          </elevator-analysis-pie>
        </div>
        <elevatorAnalysisList :contentList="pieData" style="margin-left: 10px" @handlecurrent="handelClickDeviceItemize">
        </elevatorAnalysisList>
      </div>
    </SubPanelTemplate>
  </div>
  <ModalEquipmentAllTable :show-modal="deviceModalShow" @close="closeModal" :parameter="deviceParameter"> </ModalEquipmentAllTable>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";

import DeviceStatistics from "../components/device-statistics.vue";
import { getDeviceBuyArea, getDeviceNumber } from "@/api/device";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import ModalEquipmentAllTable from "@/components/modal-table/modal-equipmentAll-table.vue";
import { useStateStore } from "@/pages/state/use-state-store";
import { setDeviceData } from "@/utils/common";

const props = withDefaults(
  defineProps<{
    title?: string;
  }>(),
  {
    title: "设备统计",
  },
);

const { globalState } = useStateStore();
const pieData = ref([]);
const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
const deviceStatisticsData = reactive({
  title: "设备总数",
  total: 0,
  itemize: [
    {
      label: "在线设备数",
      value: 0,
      color: "#2AE8BD",
    },
    {
      label: "离线设备数",
      value: 0,
      color: "#FFAB10",
    },
  ],
});

const getDeviceDistribution = async () => {
  const res = await getDeviceNumber({ tagCodes: `custom.app::visual.${globalState.business.currentMenu}` });
  deviceStatisticsData.total = res.totalNumber;
  deviceStatisticsData.itemize[0].value = res.normalNumber;
  deviceStatisticsData.itemize[1].value = res.offlineNumber;
  const data = await getDeviceBuyArea({
    tagCodes: [`custom.app::visual.${globalState.business.currentMenu}`],
    areaLevel: globalState.business.currentAreaLeave,
  });
  pieData.value = setDeviceData(data, colors);
};

const deviceModalShow = ref<boolean>(false);
const deviceParameter = reactive({
  anyAreaId: "",
  deviceState: undefined,
  filterAreaIds: [],
  tagCodes: [`custom.app::visual.${globalState.business.currentMenu}`],
  dateRange: [],
});
const handelClickDeviceItemize = (value?: any) => {
  const { name } = value;
  if (value.name === "其他") {
    deviceParameter.anyAreaId = undefined;
    deviceParameter.filterAreaIds = pieData.value.map((e) => e.areaId);
    deviceModalShow.value = true;
  } else {
    deviceParameter.filterAreaIds = [];
    const findItem = pieData.value.find((res) => res.name === name);
    if (findItem) {
      deviceParameter.anyAreaId = findItem.areaId;
      deviceModalShow.value = true;
    }
  }
};
const handelClickItemize = (value) => {
  if (value.label === "在线设备数") {
    deviceParameter.deviceState = true;
  } else if (value.label === "离线设备数") {
    deviceParameter.deviceState = false;
  } else {
    deviceParameter.deviceState = undefined;
  }
  deviceParameter.anyAreaId = globalState.business.currentAreaId;
  deviceModalShow.value = true;
};
const closeModal = () => {
  deviceModalShow.value = false;
};

const init = () => {
  getDeviceDistribution();
};
onMounted(() => {
  init();
});
</script>
<style lang="less" scoped>
@import url("./device.less");
.device-count-chart {
  display: flex;
  align-items: center;
  .elevator-analysis-left {
    width: 140px;
    height: 200px;
  }
}
</style>
