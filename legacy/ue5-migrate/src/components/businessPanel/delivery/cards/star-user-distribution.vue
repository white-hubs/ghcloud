<template>
  <SubPanelTemplate title="用户分布统计">
    <div class="statistic-container">
      <a-statistic
        v-for="item in statistic"
        :title="item.title"
        :value="item.value"
        :valueStyle="{ color: item.color, fontWeight: 'robotoMedium' }"
      ></a-statistic>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { reactive } from "vue";

import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const statistic = reactive([
  {
    title: "累计用户",
    value: 5966,
    color: "#4D9DFF",
  },
  {
    title: "企业用户",
    value: 5,
    color: "#19F8F7",
  },
  {
    title: "批发商",
    value: 4424,
    color: "#FFC700",
  },
  {
    title: "采购商",
    value: 1542,
    color: "#58FAB6",
  },
]);
</script>

<style lang="less" scoped>
.statistic-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-column-gap: 10px;
  grid-row-gap: 10px;
  :deep(.ant-statistic) {
    &-title {
      color: rgba(255, 255, 255, 0.8);
    }
  }
}
</style>
