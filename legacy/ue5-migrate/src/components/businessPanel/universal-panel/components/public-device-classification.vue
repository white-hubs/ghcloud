<template>
  <SubPanelTemplate title="设备分类统计">
    <div class="appointment-data">
      <PlanPie :pieData="monitorSituationPieData">
        <img :src="getAssetsImage('business-icon/triage-queue-appointment.png')" />
      </PlanPie>
      <elevatorAnalysisList :contentList="monitorSituationPieData" style="margin-left: 10px"> </elevatorAnalysisList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import PlanPie from "../../public/charts/pie/planePie.vue";
import elevatorAnalysisList from "../../public/elevator-analysis-list.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import useCommon from "@/components/hooks/useCommon";
import { getAssetsImage } from "@/utils/getImage";

const { getEquipmentNumber } = useCommon();
const colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
const monitorSituationPieData = ref<{ name: string; value: number; color: string }[]>([]);

const getEquipmentInfo = async () => {
  monitorSituationPieData.value.length = 0;
  let res: any = await getEquipmentNumber();
  if (!res.deviceNum) {
    return;
  }
  res.deviceGenreNums.forEach((item: any, index: number) => {
    monitorSituationPieData.value.push({
      name: item.genreName,
      value: item.num,
      color: colorList[index],
    });
  });
};

onMounted(() => {
  getEquipmentInfo();
});
</script>

<style lang="less" scoped>
.appointment-data {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
</style>
