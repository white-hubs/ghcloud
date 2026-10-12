<template>
  <SubPanelTemplate title="动环设备" class="alarm-event">
    <DeviceStatistics @handelClickItemize="deviceOpen" imgPath="overView16.png" :statistic="deviceStatisticsData"> </DeviceStatistics>
    <div class="elevator-analysis">
      <div class="chart">
        <elevator-analysis-pie @clickbar="alarmRegion" :pieData="detectionData">
          <div style="color: #fff; text-align: center; font-size: calc(var(--font-size-scale) * 0.082rem)">{{ alarmTotal }}</div>
          <div style="color: #fff; text-align: center; font-size: calc(var(--font-size-scale) * 0.087rem)">设备总数</div>
        </elevator-analysis-pie>
      </div>
      <elevatorAnalysisList
        @handlecurrent="alarmRegion"
        :showRatio="false"
        :contentList="detectionData"
        class="pie_list"
      ></elevatorAnalysisList>
    </div>
  </SubPanelTemplate>
  <modal-equipmentAll-table
    :show-modal="deviceModalShow"
    @close="deviceModalShow = false"
    :parameter="deviceParameter"
  ></modal-equipmentAll-table>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";

import elevatorAnalysisPie from "../../public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "../../public/elevator-analysis-list.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DeviceStatistics from "../../security-monitoring-safty/device-statistics.vue";
import { getDeviceBuyArea, getDeviceNumber } from "@/api/device";
import modalEquipmentAllTable from "@/components/modal-table/modal-equipmentAll-table.vue";
import { useStateStore } from "@/pages/state/use-state-store";
import { setDeviceData } from "@/utils/common";

const { globalState } = useStateStore();

const alarmTotal = ref(0);
const deviceModalShow = ref<boolean>(false);
const detectionData = ref([]);
const colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];

const deviceParameter = reactive({
  areaId: "",
  status: "",
  filterAreaIds: [],
  tagCodes: [`custom.app::visual.${globalState.business.currentMenu}`],
  dateRange: [],
});

const deviceStatisticsData = reactive({
  title: "设备总数",
  total: 48,
  itemize: [
    {
      name: "在线设备数",
      label: "离线设备数",
      value: 23,
      offline: 15,
      key: "OFFLINE1",
    },
  ],
});

watch(
  () => globalState.business.currentAreaId,
  () => {
    init();
  },
);

const deviceOpen = (value) => {
  if (value === "离线设备数") {
    deviceParameter.status = "OFFLINE";
  } else if (value === "在线设备数") {
    deviceParameter.status = "ONLINE";
  } else {
    deviceParameter.status = "";
  }
  deviceParameter.areaId = globalState.business.currentAreaId;
  deviceModalShow.value = true;
};

const alarmRegion = (value) => {
  deviceParameter.status = "";
  if (value.name === "其他") {
    deviceParameter.areaId = undefined;
    deviceParameter.filterAreaIds = detectionData.value.map((e) => e.areaId);
  } else {
    deviceParameter.areaId = detectionData.value.find((e) => e.name === value.name).areaId;
    deviceParameter.filterAreaIds = [];
  }
  deviceModalShow.value = true;
};

const alarmEventTop = async () => {
  const data = await getDeviceNumber({
    tagCodes: `custom.app::visual.${globalState.business.currentMenu}`,
    areaId: globalState.business.currentAreaId,
  });
  deviceStatisticsData.total = data.totalNumber;
  deviceStatisticsData.itemize[0].value = data.offlineNumber;
  deviceStatisticsData.itemize[0].offline = data.normalNumber;
  const res = await getDeviceBuyArea({
    tagCodes: [`custom.app::visual.${globalState.business.currentMenu}`],
    areaLevel: globalState.business.currentAreaLeave + 1,
  });
  alarmTotal.value = 0;
  detectionData.value = setDeviceData(res, colorList);
  detectionData.value.forEach((item) => {
    alarmTotal.value += item.value;
  });
};

function init() {
  alarmEventTop();
}

onMounted(() => {
  init();
});
</script>

<style lang="less" scoped>
.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 10px 10px;
  align-items: center;

  .pie_list {
    width: 150px;
    margin-left: 10px;
  }
}

.chart {
  flex: 1;
  height: 180px;
}
</style>
