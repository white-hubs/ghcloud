<template>
  <SubPanelTemplate title="订单分布统计">
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
    title: "累计订单",
    value: 1164407,
    color: "#4D9DFF",
  },
  {
    title: "非月结正常订单",
    value: 1163863,
    color: "#2989FF",
  },
  {
    title: "月结正常订单",
    value: 544,
    color: "#58FAB6",
  },
  {
    title: "退款订单",
    value: 23643,
    color: "#FF6E23",
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
