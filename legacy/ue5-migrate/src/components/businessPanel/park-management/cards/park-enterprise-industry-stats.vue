<template>
  <SubPanelTemplate title="租赁企业行业情况统计" class="alarm-event">
    <div class="flex-between mg-10">
      <PlanPie :pieData="levelPieData">
        <div class="content">
          <div class="pie-center">{{ throughNum }}</div>
          <div>通行总数</div>
        </div>
      </PlanPie>
      <PieList :roundPieData="levelPieData"></PieList>
    </div>
    <RollTable :column="columns" :data="industryStatistics" :showLength="8"> </RollTable>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import { statisticsEnterprises } from "@/api/park";
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import PieList from "@/components/businessPanel/public/pieList.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
const levelPieData = ref([]);
const columns = ref([
  {
    title: "行业类型",
    dataIndex: "industry",
    width: 120,
  },
  {
    title: "使用",
    dataIndex: "num",
  },
  {
    title: "占比",
    dataIndex: "rate",
  },
]);
const industryStatistics = ref([]);
const throughNum = ref(0);

const getStatisticsEnterprises = async () => {
  const res = await statisticsEnterprises();
  throughNum.value = res.total;
  industryStatistics.value = res.industryStatisticsEnterprises.map((e) => {
    return {
      ...e,
      rate: e.rate + "%",
    };
  });
  levelPieData.value = res.industryStatisticsEnterprises.map((item, index) => {
    return {
      name: item.industry,
      color: colors[index],
      value: item.num,
    };
  });
};

onMounted(() => {
  getStatisticsEnterprises();
});
</script>

<style lang="less" scoped>
.mg-10 {
  :deep(.policeList) {
    height: auto;
  }

  .content {
    color: #fff;
    text-align: center;
    font-size: 12px;
  }
}
</style>
