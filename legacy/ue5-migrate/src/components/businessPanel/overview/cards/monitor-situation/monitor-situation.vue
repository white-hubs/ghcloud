<template>
  <SubPanelTemplate title="监控态势">
    <div class="monitor-statistic">
      <SituationAnalysis imgPath="overView5.png" :statistic="monitorSituationAnalysis" @click-num="showDeviceTable">
      </SituationAnalysis>
      <div class="flex-between">
        <PlanPie :pieData="monitorSituationPieData">
          <div class="content">
            <div class="total-num">{{ monitorSituationAnalysis.total }}</div>
            <div>设备总数</div>
          </div>
        </PlanPie>
        <PieList :roundPieData="monitorSituationPieData" @handel-click-itemize="handleClickItemize"></PieList>
      </div>
    </div>
  </SubPanelTemplate>
  <modal-equipment-table :show-modal="deviceModalShow" :parameter="deviceParameter"
    @close="closeModal"></modal-equipment-table>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import SubPanelTemplate from "../../../public/subPanelTemplate.vue";
import SituationAnalysis from "../../situation-analysis.vue";
import PlanPie from "../../../public/charts/pie/planePie.vue";
import PieList from "../../../public/pieList.vue";
import modalEquipmentTable from "@/components/modal-table/modal-equipment-table.vue";
import { getMonitorSituation } from "@/api/device";

const monitorSituationAnalysis = reactive({
  title: "设备总数",
  total: 0,
  itemize: [
    {
      label: "在线",
      value: 0,
      color: "#35D93D",
      key: "NORMAL",
    },
    {
      label: "离线",
      value: 0,
      color: "#D0DEEE",
      key: "OFFLINE",
    },
    {
      label: "故障",
      value: 0,
      color: "#FFC700",
      key: "TROUBLE",
    },
    {
      label: "报警",
      value: 0,
      color: "#F14545",
      key: "ALARM",
    },
  ],
});
const monitorSituationColors = ref<string[]>([
  "#FFAB10",
  "#2F8DFF",
  "#F14545",
  "#19F8F7",
]);
const monitorSituationPieData = ref<{ label: string; value: number; color: string; areaId?: string }[]>([]);
const deviceModalShow = ref(false);
const deviceParameter = ref<Record<string, any>>({
  applicationCode: "SECURITY_MONITORING",
});

const closeModal = () => {
  deviceModalShow.value = false;
};

const showDeviceTable = (item: any) => {
  deviceParameter.value = {
    status: item.key,
    applicationCode: "SECURITY_MONITORING",
  };
  deviceModalShow.value = true;
};

const handleClickItemize = (item: any) => {
  deviceParameter.value = {
    areaId: item.areaId,
    applicationCode: "SECURITY_MONITORING",
  };
  deviceModalShow.value = true;
};

const requestMonitorSituation = async () => {
  const res = await getMonitorSituation();
  monitorSituationAnalysis.total = res.deviceNum;
  monitorSituationAnalysis.itemize.map((item) => {
    let ele = res.deviceStatusNums.find((element: any) => element.name === item.key);
    if (ele) {
      item.value = ele.num;
    }
    return item;
  });
  monitorSituationPieData.value = res.deviceAreaNum.map((item: any, index: number) => {
    let areaName = item.areaName.split("/");
    if (areaName.length === 3) {
      areaName = areaName[1] + "/" + areaName[2];
    } else {
      areaName = item.areaName;
    }
    return {
      label: `${areaName}(${Math.round(item.proportion * 10000) / 100}%)`,
      value: item.num,
      color: monitorSituationColors.value[index % 4],
      areaId: item.areaId,
    };
  });
};

onMounted(() => {
  requestMonitorSituation();
});
</script>

<style lang="less" scoped>
.monitor-statistic {
  width: 100%;

  .content {
    text-align: center;
    color: #fff;
    font-size: 14px;

    .total-num {
      font-size: 16px;
    }
  }
}
</style>
