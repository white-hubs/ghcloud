<template>
  <SubPanelTemplate title="隧道不同车道车流量分析">
    <template #extra>
      <DateInlineForm v-model:modelValue="equipmentAlarmTime" @search="changeHandleEquipmentAlarmTime"> </DateInlineForm>
    </template>
    <div class="charts">
      <stackedColumn :unit="'辆'" :xData="buildUtilization.xData" :yData="buildUtilization.yData"></stackedColumn>
    </div>
    <div class="footer">
      <RollTable :column="column" :data="listData"> </RollTable>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import { differentTunnels } from "@/api/securitymanagement";
import stackedColumn from "@/components/businessPanel/public/charts/stacked-column/stackedColumn.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";

const equipmentAlarmTime = ref<ModelValueItf>();
const buildUtilization = reactive({
  xData: [],
  yData: [
    {
      name: "驶入",
      data: [],
    },
    {
      name: "驶出",
      data: [],
    },
  ],
});
let listData = reactive([]);
const column = reactive([
  {
    title: "车道",
    dataIndex: "lane",
    width: 120,
  },
  {
    title: "驶入数量",
    dataIndex: "inNum",
  },
  {
    title: "驶出数量",
    dataIndex: "outNum",
  },
]);

const changeHandleEquipmentAlarmTime = async () => {
  const params = {
    type: equipmentAlarmTime.value.timeType,
    period: equipmentAlarmTime.value.dateRange.join(","),
  };
  const res = await differentTunnels(params);
  buildUtilization.xData = res.map((e) => e.lane);
  buildUtilization.yData[0].data = res.map((e) => e.inNum);
  buildUtilization.yData[1].data = res.map((e) => e.outNum);
  Object.assign(listData, res);
};
</script>

<style lang="less" scoped>
.charts {
  height: 240px;
}
.footer {
  height: 200px;
}
</style>
