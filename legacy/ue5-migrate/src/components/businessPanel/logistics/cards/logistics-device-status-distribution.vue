<template>
  <SubPanelTemplate title="物流系统设备状态分布">
    <div class="flex-between">
      <PlanPie :pieData="roundPieData">
        <div class="content">
          <div class="total-num">{{ alarmTotal }}</div>
          <div>设备总数</div>
        </div>
      </PlanPie>
      <PieList :roundPieData="roundPieData"></PieList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import { equipmentTotal } from "@/api/equipment";
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import PieList from "@/components/businessPanel/public/pieList.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();
const deviceStatusType: Record<string, string> = {
  ALARM: "报警",
  TROUBLE: "故障",
  OFFLINE: "离线",
  NORMAL: "正常",
};
const colorList = ["#2F8DFF", "#D0DEEE", "#FFAB10", "#F14545"];
const roundPieData = ref<any[]>([]);
const alarmTotal = ref(0);

// 设备实时数据
const deviceDataInfo = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
  };
  let res: any = await equipmentTotal(params);
  if (!res.deviceNum) {
    return;
  }
  roundPieData.value.length = 0;
  alarmTotal.value = 0;
  res.deviceStatusNums.forEach((item: any, index: number) => {
    alarmTotal.value += item.num;
    let obj = {
      label: deviceStatusType[item.name],
      color: colorList[index],
      value: item.num,
    };
    roundPieData.value.push(obj);
  });
};

onMounted(() => {
  deviceDataInfo();
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
</style>
