<template>
  <SubPanelTemplate title="示教直播场次">
    <template #extra>
      <DateInlineForm v-model:modelValue="eventInfo" @search="alarmEventTop"></DateInlineForm>
    </template>
    <div class="chart">
      <overviewChartBar :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import { broadcastSessions } from "@/api/securitymanagement";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";

const eventInfo = ref<ModelValueItf>({
  timeType: "TODAY",
  dateRange: [],
});
const barData = reactive({
  xData: [] as string[],
  yData: [
    {
      data: [] as number[],
      name: "",
      color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
    },
  ],
});

const alarmEventTop = async () => {
  let param = {
    period: eventInfo.value.dateRange.join(","),
    type: eventInfo.value.timeType,
  };
  const res = await broadcastSessions(param);
  barData.xData = res.xtitle.map((item: string) => {
    if (eventInfo.value.timeType === "TODAY") {
      return item + "时";
    } else if (eventInfo.value.timeType === "THIS_YEAR") {
      return item + "月";
    } else {
      return item;
    }
  });
  barData.yData[0].data = res.xtitle.map((xItem: string) => {
    const found = res.overviewVos.find((item: any) => item.timeFlag === xItem);
    return found ? found.num : 0;
  });
};
</script>

<style lang="less" scoped>
.chart {
  height: 220px;
}
</style>
