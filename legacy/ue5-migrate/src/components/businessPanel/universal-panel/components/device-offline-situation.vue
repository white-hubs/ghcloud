<template>
  <SubPanelTemplate title="设备离线情况" class="product-table">
    <DeviceStatistics @handel-click-itemize="openModal" imgPath="overView21.png" :statistic="deviceStatisticsData" />
    <RollTable :column="product.column" :data="product.tableData">
      <template #offLineNum="{ record }">
        <div style="display: flex; align-items: center; justify-content: center">
          <span class="offlineBox" style="background-color: #35d93d"></span>
          <span class="os1">{{ record.offLineNum }}</span>
        </div>
      </template>
      <template #normalNum="{ record }">
        <div style="display: flex; align-items: center; justify-content: center">
          <span class="offlineBox"></span>
          <span class="os1">{{ record.normalNum }}</span>
        </div>
      </template>
    </RollTable>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";

import { deviceStatusNum } from "@/api/securitymanagement";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DeviceStatistics from "@/components/businessPanel/universal-panel/components/equipment-overview/device-statistics.vue";
import useCommon from "@/components/hooks/useCommon";
import { useStateStore } from "@/pages/state/use-state-store";

const emit = defineEmits(["open-device-modal"]);
const { globalState } = useStateStore();
const { getEquipmentNumber } = useCommon();

const colorList = ["#2AE8BD", "#2989FF", "#FFC700", "#EF424A"];
const deviceStatisticsData = reactive({
  title: "设备数",
  total: 0,
  itemize: [
    {
      name: "离线率",
      label: "离线",
      value: 0,
      key: "OFFLINE",
    },
  ],
});

const product = reactive({
  column: [
    {
      title: "系统名称",
      dataIndex: "applicationName",
    },
    {
      title: "在线",
      dataIndex: "normalNum",
      slots: { customRender: "normalNum" },
    },
    {
      title: "离线",
      dataIndex: "offLineNum",
      slots: { customRender: "offLineNum" },
    },
  ],
  tableData: [],
});

const openModal = () => {
  emit("open-device-modal");
};

const loadData = async () => {
  const res: any = await getEquipmentNumber();
  deviceStatisticsData.total = res.deviceNum || 0;
  if (res?.deviceStatusNums) {
    res.deviceStatusNums.forEach((item: any) => {
      if (item.name === "OFFLINE") {
        deviceStatisticsData.itemize[0].value = item.num;
      }
    });
  }
  const params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
  } as any;
  product.tableData = await deviceStatusNum(params);
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="less">
.offlineBox {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #d0deee;
  border-radius: 50%;
}
.product-table {
  height: 360px;
}
.os1 {
  margin-left: 4px;
  font-size: 14px !important;
}
</style>
