<template>
  <SubPanelTemplate title="诚信经营值统计">
    <a-select @change="changeType" v-model:value="statisticsType" style="height: 28px; margin-bottom: 10px">
      <a-select-option :value="item.value" v-for="(item, i) in typeList" :key="i">{{ item.label }}</a-select-option>
    </a-select>
    <div class="body">
      <RollTable :column="columns" :data="listData"> </RollTable>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import { visualizationPrice } from "@/api/merchant";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const statisticsType = ref("honestyScore");
const typeList = [
  {
    label: "诚信经营",
    value: "honestyScore",
  },
  {
    label: "商品质量",
    value: "zScoreAvg",
  },
  {
    label: "诚实守信",
    value: "sScoreAvg",
  },
  {
    label: "服务态度",
    value: "tScoreAvg",
  },
  {
    label: "环境卫生",
    value: "wScoreAvg",
  },
];
const columns = ref([
  {
    title: "商户",
    dataIndex: "companyName",
  },
  {
    title: "管理档位",
    dataIndex: "deviceName",
  },
  {
    title: "商户姓名",
    dataIndex: "owner",
  },
  {
    title: "诚信经营值",
    dataIndex: "data",
  },
]);
const listData = ref<any[]>([]);

const changeStatisticsTime = async () => {
  listData.value = await visualizationPrice();
  listData.value.forEach((item) => {
    item.sScoreAvg = Number(item.sScoreAvg) + "星";
    item.tScoreAvg = Number(item.tScoreAvg) + "星";
    item.wScoreAvg = Number(item.wScoreAvg) + "星";
    item.zScoreAvg = Number(item.zScoreAvg) + "星";
    item.honestyScore = Number(item.honestyScore) + "星";
  });
  changeType();
};

const changeType = () => {
  typeList.forEach((item) => {
    if (item.value === statisticsType.value) {
      columns.value[columns.value.length - 1].title = item.label;
      columns.value[columns.value.length - 1].dataIndex = item.value;
    }
  });
};

onMounted(() => {
  changeStatisticsTime();
});
</script>

<style lang="less" scoped>
.body {
  height: 250px;
}
</style>
