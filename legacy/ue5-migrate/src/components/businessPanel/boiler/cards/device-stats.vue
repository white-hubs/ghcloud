<template>
  <SubPanelTemplate title="设备统计">
    <a-radio-group v-model:value="deviceFlag" button-style="solid">
      <a-radio-button value="overview">设备总览</a-radio-button>
      <a-radio-button value="monitor">设备状态监测</a-radio-button>
    </a-radio-group>
    <div v-show="deviceFlag === 'overview'">
      <OperateDays title="设备总数" :value="alarmTotal"></OperateDays>
      <div class="flex-between">
        <PlanPie :pieData="roundPieData">
          <div class="content">
            <div class="total-num">{{ alarmTotal }}</div>
            <div>设备总数</div>
          </div>
        </PlanPie>
        <PieList :roundPieData="roundPieData"></PieList>
      </div>
    </div>
    <div v-show="deviceFlag === 'monitor'">
      <GridContainer :data="deviceStatistic"></GridContainer>
      <div class="chart">
        <PlanPie :pieData="pieData">
          <div class="content">
            <div class="total-num">{{ alarmTotal }}</div>
            <div>设备总数</div>
          </div>
        </PlanPie>
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import { equipmentTotal } from "@/api/equipment";
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import GridContainer from "@/components/businessPanel/public/gridContainer.vue";
import OperateDays from "@/components/businessPanel/public/operateDays.vue";
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

const deviceStatistic = ref<any[]>([]);
const monitorSituationPieData = ref<{ label: string; value: number; color: string }[]>([]);
const roundPieData = ref<any[]>([]);
const alarmTotal = ref(0);
const pieData = ref<any[]>([]);
const deviceFlag = ref("overview");

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
  monitorSituationPieData.value.length = 0;
  deviceStatistic.value.length = 0;
  roundPieData.value.length = 0;
  alarmTotal.value = 0;
  res.deviceStatusNums.forEach((item: any, index: number) => {
    alarmTotal.value += item.num;
    let obj = {
      label: deviceStatusType[item.name],
      color: colorList[index],
      value: item.num,
    };
    pieData.value.push(obj);
    deviceStatistic.value.push({
      alarmStatusName: deviceStatusType[item.name],
      color: colorList[index],
      alarmNum: item.num,
    });
  });
  res.deviceGenreNums.forEach((item: any, index: number) => {
    let obj = {
      label: `${item.genreName}(${Math.round((item.num / res.deviceNum) * 10000) / 100.0}%)`,
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
.chart {
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  text-align: center;
  color: #fff;
  font-size: 14px;

  .total-num {
    font-size: 16px;
  }
}

:deep(.ant-radio-button-wrapper) {
  background: none;
  border: none;
  color: #fff;
}

:deep(.ant-radio-button-wrapper-checked) {
  background: linear-gradient(180deg, rgba(41, 137, 255, 0.4) 0%, rgba(41, 137, 255, 0.8) 100%) !important;
}

:deep(.policeList) {
  height: auto;
}
</style>
