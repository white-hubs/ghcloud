<template>
  <SubPanelTemplate title="设备情况总览">
    <div class="monitorPanelBox">
      <monitorPanel
        v-for="(item, index) in monitorPanelData"
        :key="item.name"
        :monitorPanelData="item"
        @handel-click-itemize="onClickItemize(index)"
      />
    </div>
    <div class="elevator-analysis">
      <div class="chart">
        <elevator-analysis-pie :pieData="pieData">
          <div style="color: #fff; text-align: center; font-size: 14px">{{ alarmTotal }}</div>
          <div style="color: #fff; text-align: center; font-size: 14px">总量</div>
        </elevator-analysis-pie>
      </div>
      <elevatorAnalysisList :contentList="pieData" class="analysisList" />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import monitorPanel from "./monitor-panel.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import useCommon from "@/components/hooks/useCommon";
import { useStateStore } from "@/pages/state/use-state-store";

const emit = defineEmits(["open-device-modal"]);
const { getEquipmentNumber } = useCommon();
const { globalState } = useStateStore();

const colorList = ["#2AE8BD", "#2989FF", "#FFC700", "#EF424A"];
const deviceStatusType = {
  ALARM: "报警",
  TROUBLE: "故障",
  OFFLINE: "离线",
  NORMAL: "正常",
};

const monitorPanelData = ref([
  {
    imgPath: "overView5.png",
    value: 0,
    name: "系统总量",
  },
  {
    imgPath: "overView29.png",
    value: 0,
    name: "设备总量",
  },
]);
const pieData = ref([
  { name: "正常", value: 0, color: "#2AE8BD" },
  { name: "离线", value: 0, color: "#2989FF" },
  { name: "故障", value: 0, color: "#FFC700" },
  { name: "告警", value: 0, color: "#F14545" },
]);
const alarmTotal = ref<number>(0);

const onClickItemize = (index: number) => {
  if (index !== 0) {
    emit("open-device-modal");
  }
};

const loadOverview = async () => {
  const res: any = await getEquipmentNumber();
  if (!res?.deviceNum) return;
  pieData.value.length = 0;
  res.deviceStatusNums.forEach((item: any, idx: number) => {
    pieData.value.push({
      name: deviceStatusType[item.name as keyof typeof deviceStatusType] || item.name,
      value: item.num,
      color: colorList[idx],
    });
  });
  monitorPanelData.value[0].value = res.equipmentOverview;
  monitorPanelData.value[1].value = res.deviceNum;
  alarmTotal.value = res.deviceNum;
};

onMounted(() => {
  loadOverview();
});
</script>

<style scoped lang="less">
.monitorPanelBox {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  align-items: center;
}

.chart {
  flex: 1;
  height: 220px;
}

.analysisList {
  width: 150px;
  margin-left: 10px;
}
</style>
