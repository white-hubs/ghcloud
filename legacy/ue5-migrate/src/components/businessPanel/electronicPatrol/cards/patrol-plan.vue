<template>
  <SubPanelTemplate title="巡更计划">
    <GridContainer :data="deviceStatistic"></GridContainer>
    <div class="flex-between mg-10">
      <PlanPie :pieData="monitorSituationPieData">
        <div class="content">
          <div class="total-num">{{ total }}</div>
          <div>计划总数</div>
        </div>
      </PlanPie>
      <PieList :roundPieData="monitorSituationPieData"></PieList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import PlanPie from "../../public/charts/pie/planePie.vue";
import GridContainer from "../../public/gridContainer.vue";
import PieList from "../../public/pieList.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { getPalnStatus } from "@/api/maintain";

const total = ref(0);
const deviceStatistic = ref([
  {
    alarmStatusName: "执行中",
    code: "ENABLE",
    alarmNum: 0,
    color: "#328BF7",
  },
  {
    alarmStatusName: "已停用",
    code: "STOP",
    alarmNum: 0,
    color: "#FFC700",
  },
  {
    alarmStatusName: "已结束",
    code: "END",
    alarmNum: 0,
    color: "#EF424A",
  },
]);

const monitorSituationPieData = ref<{ label: string; value: number; color: string }[]>([
  {
    label: "执行中",
    value: 0,
    color: "#328BF7",
  },
  {
    label: "已停用",
    value: 0,
    color: "#FFC700",
  },
  {
    label: "已结束",
    value: 0,
    color: "#EF424A",
  },
]);

const guardTourPlan = async () => {
  const res = await getPalnStatus();
  total.value = 0;
  deviceStatistic.value.forEach((item, index) => {
    total.value += res[index].value;
  });
  deviceStatistic.value.forEach((item, index) => {
    res.forEach((data) => {
      if (item.code === data.name) {
        item.alarmNum = data.value;
        monitorSituationPieData.value[index].value = data.value;
      }
    });
  });
};

onMounted(() => {
  guardTourPlan();
});
</script>

<style lang="less" scoped>
.content {
  text-align: center;
  color: #fff;
  font-size: 14px;

  .total-num {
    font-size: 16px;
  }
}
.mg-10 {
  margin-top: 10px;
  :deep(.policeList) {
    height: auto;
  }
}
</style>
