<template>
  <SubPanelTemplate title="设备报警Top5" class="alarm-event">
    <template #extra>
      <DateInlineForm v-model:modelValue="handleTime" @search="areaAlarmStatistic"></DateInlineForm>
    </template>
    <div class="body" style="min-height: 250px" v-show="areaAlarmRank.length > 0">
      <EventAlarmItem
        v-for="(item, index) in areaAlarmRank"
        :sort="index + 1"
        :name="item.name"
        :linkRatio="item.chainRatio"
        :count="item.alarmNum"
        :ratio="item.ratio + '%'"
      />
    </div>
    <div class="body" style="min-height: 250px" v-show="areaAlarmRank.length <= 0">
      <noData></noData>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

import { statisticsDeviceTop } from "@/api/alarm";
import { AlarmAreaTop } from "@/api/models/alarm";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import EventAlarmItem from "@/components/businessPanel/public/eventAlarmItem.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();
const handleTime = ref<ModelValueItf>();
const areaAlarmRank = ref<AlarmAreaTop[]>([]);
const timer = ref<any>(null);

/**
 * 区域报警Top5
 */
const areaAlarmStatistic = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: handleTime.value.dateRange.join(","),
    type: handleTime.value.timeType,
  };
  const res = await statisticsDeviceTop(params);
  areaAlarmRank.value = res;
};

const init = () => {
  areaAlarmStatistic();
};

watch(
  () => globalState.business.currentAreaId,
  () => {
    clearInterval(timer.value);
    init();
    timer.value = setInterval(
      () => {
        init();
      },
      (window as any).config.pageLoopRequestTime,
    );
  },
);

onMounted(() => {
  init();
  timer.value = setInterval(
    () => {
      init();
    },
    (window as any).config.pageLoopRequestTime,
  );
});

onBeforeUnmount(() => {
  clearInterval(timer.value);
});
</script>

<style lang="less" scoped></style>
