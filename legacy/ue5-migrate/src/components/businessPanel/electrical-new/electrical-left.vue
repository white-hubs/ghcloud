<template>
  <div>
    <SubPanelTemplate title="报警情况统计">
      <template #extra>
        <DateInlineForm v-model:modelValue="alarmtimeType" @search="changeDate"></DateInlineForm>
      </template>
      <displayPanel :bg-img="'overView16.png'" :content-list="contentList" :showimg="false"></displayPanel>
    </SubPanelTemplate>
    <SecurityAlarmEventRatio />
    <SubPanelTemplate title="设备报警趋势" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="trend" @search="alarmTrendInfo"></DateInlineForm>
      </template>
      <LineChart class="line_char" :x-data="xData.arr" :series="series" :title="'次'"></LineChart>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import LineChart from "../public/lineChart.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import { ModelValueItf } from "../public/types";
import SecurityAlarmEventRatio from "../security-monitoring-safty/cards/security-alarm-event-ratio.vue";
import { statisticsSituation } from "@/api/alarm";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import displayPanel from "@/components/businessPanel/public/display-panelsafty.vue";
import { useStateStore } from "@/pages/state/use-state-store";
import { alarmTrend } from "@/utils/requestData/alarm";

const { globalState } = useStateStore();
const alarmtimeType = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [],
});
const trend = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [],
});
const contentList = ref([
  {
    name: "报警超时率",
    field: "timeoutRatio",
    value: 0,
  },
  {
    name: "报警正确率",
    field: "actualRatio",
    value: 0,
  },
  {
    name: "电气报警占比",
    field: "ratio",
    value: 0,
  },
  {
    name: "报警处理率",
    field: "handlerRatio",
    value: 0,
  },
]);
const xData = reactive({
  arr: ["1时", "2时", "3时", "4时", "5时"],
});
const series = reactive([
  {
    data: [0],
    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
  },
]);

const changeDate = async () => {
  getAlarmSituation();
};
// 获取报警情况统计
const getAlarmSituation = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: alarmtimeType.value.dateRange.join(","),
  };
  let res = await statisticsSituation(params);
  contentList.value = contentList.value.map((item) => {
    return {
      ...item,
      value: +res[item.field],
    };
  });
};
// 设备报警趋势
const alarmTrendInfo = async () => {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: trend.value.dateRange.join(","),
    type: trend.value.timeType,
  };
  let res: any = await alarmTrend(param);
  xData.arr = res.xdata;
  series[0].data = res.ydata;
};
</script>
<style lang="less" scoped>
.line_char {
  width: 100%;
  height: 200px;
}
</style>
