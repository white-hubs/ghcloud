<template>
  <SubPanelTemplate title="消防设备分布情况" class="alarm-event">
    <DeviceStatistics @handelClickItemize="handelClickItemize" imgPath="business-icon/triage-queue/12.png" :statistic="deviceStatusData">
    </DeviceStatistics>
    <div class="chart">
      <elevator-analysis-pie @clickbar="handleClickPie" style="width: 50%" :pieData="pieData" :radius="'75'">
        <div style="color: #fff; text-align: center; font-size: calc(var(--font-size-scale) * 0.072rem)">
          {{ deviceStatusData.total }}
        </div>
        <div style="color: #fff; text-align: center; font-size: calc(var(--font-size-scale) * 0.0625rem)">设备总数</div>
      </elevator-analysis-pie>
      <elevatorAnalysisList @handlecurrent="handleClickPie" :contentList="pieData" style="width: 50%"> </elevatorAnalysisList>
    </div>
  </SubPanelTemplate>
  <modal-equipmentAll-table
    :show-modal="deviceModalShow"
    @close="deviceModalShow = false"
    :parameter="deviceParameter"
  ></modal-equipmentAll-table>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DeviceStatistics from "../../security-monitoring-safty/device-statistics.vue";
import { getDeviceBuyArea, getDeviceNumber } from "@/api/device";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue";
import modalEquipmentAllTable from "@/components/modal-table/modal-equipmentAll-table.vue";
import { useStateStore } from "@/pages/state/use-state-store";
import { setDeviceData } from "@/utils/common";

const { globalState } = useStateStore();

const pieData = ref([]);
const deviceModalShow = ref<boolean>(false);
const deviceParameter = reactive({
  anyAreaId: "",
  deviceState: undefined,
  filterAreaIds: [],
  tagCodes: [`custom.app::visual.${globalState.business.currentMenu}`],
  dateRange: [],
});

const deviceStatusData = reactive({
  title: "设备数",
  total: 48,
  itemize: [
    {
      name: "离线",
      label: "在线",
      value: 23,
      offline: 15,
      key: "OFFLINE",
    },
  ],
});
const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];

const getDeviceDistribution = async () => {
  const res = await getDeviceNumber({
    tagCodes: `custom.app::visual.${globalState.business.currentMenu}`,
  });
  deviceStatusData.total = res.totalNumber;
  deviceStatusData.itemize[0].value = res.normalNumber;
  deviceStatusData.itemize[0].offline = res.offlineNumber;
  const data = await getDeviceBuyArea({
    tagCodes: [`custom.app::visual.${globalState.business.currentMenu}`],
    areaLevel: globalState.business.currentAreaLeave,
  });
  pieData.value = setDeviceData(data, colors);
};
const handelClickItemize = (value) => {
  if (value === "离线") {
    deviceParameter.deviceState = false;
  } else if (value === "在线") {
    deviceParameter.deviceState = true;
  } else {
    deviceParameter.deviceState = undefined;
  }
  deviceParameter.anyAreaId = globalState.business.currentAreaId;
  deviceModalShow.value = true;
};
const handleClickPie = async (value) => {
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
onMounted(() => {
  getDeviceDistribution();
});
</script>

<style lang="less" scoped>
.chart {
  height: calc(150px / var(--font-size-scale));
  display: flex;
  align-items: center;
}
</style>
