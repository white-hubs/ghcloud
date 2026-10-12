<template>
  <SubPanelTemplate title="水处理实时数据">
    <div class="trafficBox">
      <traffic :unit="'项'" v-for="item in trafficList" :key="item.color" :trafficInfo="item"></traffic>
    </div>
    <RollTable :column="alarmColumn" :data="listData" :showLength="6">
      <template #index="{ record }">
        <span v-if="record.index === 'ammonianitrogen'">氨氮</span>
        <span v-else-if="record.index === 'paracolon'">大肠杆菌</span>
        <span v-else>{{ record.index }}</span>
      </template>
      <template #inlet="{ record }">
        <span v-if="record.index === 'paracolon'">{{ record.inlet ? `${record.inlet} CFU/ml` : "--" }} </span>
        <span v-else-if="record.index === 'PH'">{{ record.inlet ? record.inlet : "--" }} </span>
        <span v-else>{{ record.inlet ? `${record.inlet} mg/L` : "--" }} </span>
      </template>
      <template #effluent="{ record }">
        <span v-if="record.index === 'paracolon'">{{ record.effluent ? `${record.effluent} CFU/ml` : "--" }} </span>
        <span v-else-if="record.index === 'PH'">{{ record.effluent ? record.effluent : "--" }} </span>
        <span v-else>{{ record.effluent ? `${record.effluent} mg/L` : "--" }} </span>
        <ArrowUpOutlined v-if="record.exceeding" :style="{ color: 'red' }"></ArrowUpOutlined>
      </template>
    </RollTable>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ArrowUpOutlined } from "@ant-design/icons-vue";
import { ref, reactive, onMounted } from "vue";

import { waterTreatment } from "@/api/device";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import traffic from "@/components/businessPanel/public/traffic.vue";

const trafficList = reactive([
  {
    color: "#2989FF",
    label: "监测",
    value: 6,
  },
  {
    color: "#FF6E23",
    label: "异常",
    value: 0,
  },
]);

const dataExceeding: Record<string, number> = {
  codcr: 250,
  bod5: 100,
  ss: 60,
  ammonianitrogen: 45,
  paracolon: 5000,
};

const alarmColumn = [
  {
    title: "指标",
    dataIndex: "index",
    slots: {
      customRender: "index",
    },
    width: 120,
  },
  {
    title: "进水(mg/L)",
    dataIndex: "inlet",
    slots: {
      customRender: "inlet",
    },
  },
  {
    title: "出水(mg/L)",
    dataIndex: "effluent",
    slots: {
      customRender: "effluent",
    },
    width: 140,
  },
];

const listData = ref<any[]>([
  {
    index: "CODcr",
    inlet: "",
    effluent: "",
    exceeding: false,
  },
  {
    index: "BOD5",
    inlet: "",
    exceeding: false,
    effluent: "",
  },
  {
    index: "SS",
    inlet: "",
    exceeding: false,
    effluent: "",
  },
  {
    index: "ammonianitrogen",
    inlet: "",
    exceeding: false,
    effluent: "",
  },
  {
    index: "paracolon",
    inlet: "",
    exceeding: false,
    effluent: "",
  },
  {
    index: "PH",
    inlet: "",
    exceeding: false,
    effluent: "",
  },
]);

const getWaterTreatment = async () => {
  const res = await waterTreatment();
  trafficList[1].value = 0;
  listData.value.forEach((item) => {
    for (const key in res) {
      if (key.split("_")[0].toUpperCase() === item.index.toUpperCase()) {
        res[key] = Number(res[key]);
        if (key.split("_")[1] === "in") {
          item.inlet = res[key];
        } else {
          item.effluent = res[key];
          if (res[key] > dataExceeding[key.split("_")[0]]) {
            item.exceeding = true;
            trafficList[1].value++;
          }
        }
        if (key.split("_")[0].toUpperCase() === "PH" && key.split("_")[1] === "out") {
          if (res[key] && !(res[key] >= 6 && res[key] <= 9)) {
            item.exceeding = true;
            trafficList[1].value++;
          }
        }
      }
    }
  });
};

onMounted(() => {
  getWaterTreatment();
});
</script>

<style lang="less" scoped>
.trafficBox {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-bottom: 12px;
}
</style>
