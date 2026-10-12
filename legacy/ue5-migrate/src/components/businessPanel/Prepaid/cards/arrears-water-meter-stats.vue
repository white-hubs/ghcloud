<template>
  <SubPanelTemplate title="欠费水表占比">
    <div class="equipmentAlarm">
      <PlanPie :pieData="roundPieData">
        <div class="content">
          <div class="total-num">{{ arrearsData[1].value + arrearsData[0].value }}</div>
          <div>水表总数</div>
        </div>
      </PlanPie>
      <pieList :roundPieData="roundPieData"></pieList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import { waterMeterPage } from "@/api/prepaid";
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import pieList from "@/components/businessPanel/public/pieList.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const roundPieData = ref([
  {
    value: 0,
    label: "未失联",
    color: "rgba(3, 182, 21, 1)",
  },
  {
    value: 0,
    label: "已失联",
    color: "rgba(245, 154, 35, 1)",
  },
]);
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

const getArrearsOfFeesPage = async () => {
  const contact = await waterMeterPage({ oweMoney: true, pageSize: 1, pageNumber: 1 });
  const noContact = await waterMeterPage({ oweMoney: false, pageSize: 1, pageNumber: 1 });
  arrearsData.value[1].value = contact.total || 0;
  arrearsData.value[0].value = noContact.total || 0;
};

onMounted(() => {
  getArrearsOfFeesPage();
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
