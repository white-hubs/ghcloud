<template>
  <SubPanelTemplate title="欠费电表占比">
    <div class="equipmentAlarm">
      <PlanPie :pieData="arrearsData">
        <div class="content">
          <div class="total-num">{{ arrearsData[1].value + arrearsData[0].value }}</div>
          <div>电表总数</div>
        </div>
      </PlanPie>
      <pieList :roundPieData="arrearsData"></pieList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import { ammeterStatStatus } from "@/api/prepaid";
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import pieList from "@/components/businessPanel/public/pieList.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const arrearsData = ref([
  {
    value: 0,
    label: "未欠费",
    color: "rgba(3, 182, 21, 1)",
  },
  {
    value: 0,
    label: "已欠费",
    color: "rgba(245, 154, 35, 1)",
  },
]);

const getAmmeterPage = async () => {
  const res = await ammeterStatStatus();
  arrearsData.value[1].value = res.oweMoney || 0;
  arrearsData.value[0].value = res.unOweMoney || 0;
};

onMounted(() => {
  getAmmeterPage();
});
</script>

<style lang="less" scoped>
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;

  .content {
    font-size: 16px;
    text-align: center;
    color: #fff;
  }

  .policeList {
    height: auto;
  }
}
</style>
