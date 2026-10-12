<template>
  <SubPanelTemplate title="报警级别统计" class="alarm-level">
    <template #extra>
      <DateInlineForm v-model:modelValue="topTimeFrame" @search="changeTopTimeFrame"></DateInlineForm>
    </template>
    <div class="body">
      <div class="chart">
        <Pie3D :data="fakeData" label-key="name" value-key="alarmNum" />
      </div>
      <div class="footer">
        <AlarmStatisticsItem
          v-for="(item, index) in fakeData"
          :key="item.name"
          :level="index + 1"
          :alarmNum="item.alarmNum"
          :chainRatio="item.chainRatio"
          :name="item.name"
          :is-grow="item.isGrow"
        />
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, onMounted, onBeforeUnmount } from "vue";

import { statisticsLevel } from "@/api/alarm";
import { AlarmLevelType } from "@/api/models/alarm";
import AlarmStatisticsItem from "@/components/businessPanel/public/alarmStatisticsItem.vue";
import Pie3D from "@/components/businessPanel/public/charts/pie/pie.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();
let topTimeFrame = ref<ModelValueItf>();
const fakeData = ref<AlarmLevelType[]>([
  {
    alarmNum: 0,
    name: "一级报警",
    chainRatio: 0,
    isGrow: false,
  },
]);

let timer: any = reactive(null);

// 报警级别分布
function changeTopTimeFrame() {
  getAlarmLevel();
}

// 获取报警级别分布数据
async function getAlarmLevel() {
  if (!topTimeFrame.value || !topTimeFrame.value.dateRange) return;

  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: topTimeFrame.value.dateRange.join(","),
    type: topTimeFrame.value.timeType,
  };
  let res = await statisticsLevel(params);
  fakeData.value = res.map((item) => {
    item.chainRatio <= 0 ? (item.isGrow = false) : (item.isGrow = true);
    item.name += "报警";
    return item;
  });
}

const init = () => {
  getAlarmLevel();
};

watch(
  () => globalState.business.currentAreaId,
  () => {
    clearInterval(timer);
    timer = setInterval(
      () => {
        init();
      },
      (window as any).config.pageLoopRequestTime,
    );
    init();
  },
);

onMounted(() => {
  timer = setInterval(
    () => {
      init();
    },
    (window as any).config.pageLoopRequestTime,
  );
});

onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>

<style lang="less" scoped>
.alarm-level {
  .chart {
    display: flex;
    height: 140px;
  }

  .footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}
</style>
