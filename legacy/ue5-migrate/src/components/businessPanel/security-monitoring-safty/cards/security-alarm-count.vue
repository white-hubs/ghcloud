<template>
  <SubPanelTemplate :title="props.title" zoomable :zoom-title="`${props.title}详情`" :zoom-width="600">
    <template #extra>
      <DateInlineForm v-model:modelValue="alarmtimeType" @search="changeDate" data-no-zoom></DateInlineForm>
    </template>
    <displayPanel :bg-img="'overView16.png'" :content-list="contentList" :showimg="false" data-no-zoom></displayPanel>
    <template #zoom-content>
      <div class="zoom-display-panel">
        <displayPanel :bg-img="'overView16.png'" :content-list="contentList" :showimg="false"></displayPanel>
      </div>
    </template>
  </SubPanelTemplate>
</template>
<script lang="ts" setup>
import { ref } from "vue";

import { statisticsSituation } from "@/api/alarm";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import displayPanel from "@/components/businessPanel/public/display-panelsafty.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { useStateStore } from "@/pages/state/use-state-store";

const props = withDefaults(
  defineProps<{
    title?: string;
  }>(),
  {
    title: "报警情况统计",
  },
);
const { globalState } = useStateStore();
const contentList = ref([
  {
    name: "报警超时率",
    value: 0,
  },
  {
    name: "报警正确率",
    value: 0,
  },
  {
    name: "监控报警占比",
    value: 0,
  },
  {
    name: "报警响应率",
    value: 0,
  },
  {
    name: "报警处理率",
    value: 0,
  },
]);
let alarmtimeType = ref({
  timeType: "THIS_YEAR",
  dateRange: [],
});

const changeDate = async () => {
  const data = await statisticsSituation({
    areaId: globalState.business.currentAreaId,
    period: alarmtimeType.value.dateRange.join(","),
    type: alarmtimeType.value.timeType,
    sceneType: globalState.business.currentMenu,
  });

  contentList.value[0].value = Number(data.timeoutRatio);
  contentList.value[1].value = Number(data.actualRatio);
  contentList.value[2].value = Number(data.ratio);
  contentList.value[3].value = Number(data.confirmedRatio);
  contentList.value[4].value = Number(data.handlerRatio);
};
</script>
<style lang="less" scoped>
.panel {
  .chart {
    height: 220px;
  }
}
.trafficBox {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 12px;
}

.parkingLot {
  display: flex;
  justify-content: space-around;
  margin-top: 30px;
}

.backgroundBox {
  width: 86px;
  height: 86px;
  background: rgba(41, 137, 255, 0.302);
  box-shadow:
    inset 0px 0px 10px 0px rgba(41, 137, 255, 0.6),
    inset 0px 0px 6px 0px rgba(41, 137, 255, 0.8);
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  transform: translate(-50%, -50%);

  img {
    width: 36px;
    height: 28px;
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
}
.barChart {
  height: 200px;
}

.zoom-display-panel {
  padding: 30px;
}
</style>
