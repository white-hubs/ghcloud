<template>
  <SubPanelTemplate title="气体用量情况">
    <template #extra>
      <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
    </template>
    <div class="body chart">
      <EventAlarmItem
        v-for="(item, index) in listData"
        :sort="index + 1"
        :name="item.name"
        :count="item.num"
        :ratio="item.ratio + '%'"
        :modes="'m³'"
        :key="index"
      />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { todayGasUsageTop } from "@/api/device";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import EventAlarmItem from "@/components/businessPanel/public/eventAlarmItem.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();
const trendTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
const listData = ref<{ name: string; num: number; ratio: number }[]>([]);

const getTemplateData = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: trendTime.value.dateRange.join(","),
    type: trendTime.value.timeType,
  };
  listData.value = await todayGasUsageTop(params);
};
</script>

<style lang="less" scoped>
.chart {
  height: 250px;
}
.body {
  height: 220px;
}
</style>
