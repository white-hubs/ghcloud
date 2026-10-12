<template>
  <SubPanelTemplate title="营收分布统计">
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
    title: "累计运费",
    value: 27094779.87,
    color: "#4D9DFF",
  },
  {
    title: "实收运费",
    value: 23716692.33,
    color: "#2989FF",
  },
  {
    title: "待月结算",
    value: 9613,
    color: "#FFC700",
  },
  {
    title: "已退款运费",
    value: 433844.74,
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
