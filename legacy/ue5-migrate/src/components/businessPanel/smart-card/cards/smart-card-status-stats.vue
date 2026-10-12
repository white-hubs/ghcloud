<template>
  <SubPanelTemplate title="智能卡状态统计">
    <div class="equipmentAlarm">
      <PlanPie :pieData="roundPieData">
        <div class="content">
          <div class="total-num">{{ deviceTotal }}</div>
          <div>智能卡总数</div>
        </div>
      </PlanPie>
      <pieList :roundPieData="roundPieData"></pieList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import { useStatusStat } from "@/api/door";
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import pieList from "@/components/businessPanel/public/pieList.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const roundPieData = ref([
  {
    value: 10,
    label: "正常",
    color: "rgba(3, 182, 21, 1)",
  },
  {
    value: 10,
    label: "挂失",
    color: "rgba(245, 154, 35, 1)",
  },
]);
const deviceTotal = ref(0);

const getUseStatusStat = async () => {
  const res = await useStatusStat();
  roundPieData.value[0].value = res.normalNum;
  roundPieData.value[1].value = res.lossNum;
  deviceTotal.value = res.normalNum + res.lossNum;
};

onMounted(() => {
  getUseStatusStat();
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
