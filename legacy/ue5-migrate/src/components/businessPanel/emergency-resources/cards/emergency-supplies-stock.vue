<template>
  <SubPanelTemplate title="应急物资在库统计">
    <div class="equipmentAlarm">
      <RoundPie :data="roundPieData" :eventNum="devicesNum"> </RoundPie>
      <pieList :roundPieData="roundPieData1"></pieList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import { emergencySuppliesStock } from "@/api/emergency";
import RoundPie from "@/components/businessPanel/public/charts/roundPie/roundPie.vue";
import pieList from "@/components/businessPanel/public/pieList.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
const roundPieData = ref([
  {
    value: 10,
    label: "生活物资",
    color: "#328BF7",
  },
  {
    value: 10,
    label: "医疗物资",
    color: "#19F8F7",
  },
  {
    value: 10,
    label: "救援物资",
    color: "#FFC700",
  },
  {
    value: 10,
    label: "能耗物资",
    color: "#EF424A",
  },
]);
const roundPieData1 = ref([]);
const devicesNum = ref(0);

const getMaterialStatistics = async () => {
  const res = await emergencySuppliesStock();
  roundPieData.value = res.map((item, index) => {
    return {
      value: item.percentage,
      label: item.name,
      color: colorList[index],
    };
  });
  roundPieData1.value = res.map((item, index) => {
    return {
      value: item.percentage + "%",
      label: item.name,
      color: colorList[index],
    };
  });
};

onMounted(() => {
  getMaterialStatistics();
});
</script>

<style lang="less" scoped>
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;
  .content {
    font-size: 12px;
  }
  .policeList {
    height: auto;
  }
}
</style>
