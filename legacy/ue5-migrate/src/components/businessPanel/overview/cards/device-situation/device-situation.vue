<template>
  <SubPanelTemplate title="设备态势">
    <div class="device-statistic">
      <SituationAnalysis imgPath="overView5.png" :statistic="deviceSituationAnalysis" @click-num="handelClickDeviceNum">
      </SituationAnalysis>
      <div class="flex-between">
        <PlanPie :pieData="deviceSituationPieData" class="device-total-pie" pie-class="device-total-pie-chart">
          <div class="content">
            <div class="total-num">{{ deviceSituationAnalysis.total }}</div>
            <div>设备总数</div>
          </div>
        </PlanPie>
        <PieList :roundPieData="deviceSituationPieData" @handel-click-itemize="handelClickDeviceItemize" class="device-total-list"></PieList>
      </div>
    </div>
  </SubPanelTemplate>
  <modal-equipment-table :show-modal="deviceModalShow" @close="closeModal"
    :parameter="deviceParameter"></modal-equipment-table>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import SubPanelTemplate from "../../../public/subPanelTemplate.vue";
import SituationAnalysis from "../../situation-analysis.vue";
import PlanPie from "../../../public/charts/pie/planePie.vue";
import PieList from "../../../public/pieList.vue";
import modalEquipmentTable from "@/components/modal-table/modal-equipment-table.vue";
import { getDeviceSituation } from "@/api/device";

interface Itemize {
  color: string;
  value: number;
  label: string;
  ratio: number;
  applicationCode: string;
}

const deviceModalShow = ref<boolean>(false);
const deviceParameter = ref<Record<string, any>>({
  status: "",
});
const deviceSituationColors = ref<string[]>(["#FFAB10", "#2F8DFF", "#F14545", "#19F8F7"]);
const deviceSituationPieData = ref<Itemize[]>([]);
const deviceSituationAnalysis = reactive({
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

const handelClickDeviceNum = (item?: any) => {
  deviceModalShow.value = true;
  deviceParameter.value = { status: item?.key };
};

const handelClickDeviceItemize = (item?: any) => {
  deviceModalShow.value = true;
  deviceParameter.value = { applicationCode: item?.applicationCode };
};

const closeModal = () => {
  deviceModalShow.value = false;
};

const requestDeviceSituation = async () => {
  const res = await getDeviceSituation();
  deviceSituationAnalysis.total = res.deviceNum;
  deviceSituationAnalysis.itemize.map((item) => {
    let ele = res.deviceStatusNums.find((element: any) => element.name === item.key);
    if (ele) {
        item.value = ele.num;
    }
    return item;
  });
  deviceSituationPieData.value = res.deviceApplicationNums.map((item: any, index: number) => {
    return {
      label: `${item.applicationName}(${Math.round(item.proportion * 10000) / 100}%)`,
      value: item.num,
      ratio: item.ratio,
      color: deviceSituationColors.value[index % 4],
      applicationCode: item.applicationCode,
    };
  });
};

onMounted(() => {
  requestDeviceSituation();
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
.device-total-pie, .device-total-list, .device-total-pie-chart {
  height: 140px !important;
}
:deep(.device-total-pie-chart) {
  height: 140px !important;
}
</style>
