<template>
  <SubPanelTemplate title="任务执行情况">
    <template #extra>
      <DateInlineForm v-model:modelValue="alarmTimeType" @search="changeDate"></DateInlineForm>
    </template>
    <displayPanel :bg-img="'overView16.png'" :content-list="contentList" :showimg="false"></displayPanel>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { TaskAbnormal, TaskMissing, completionRate, taskAbnormalNum } from "@/api/maintain";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import displayPanel from "@/components/businessPanel/public/display-panelsafty.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const contentList = ref([
  {
    name: "任务完成率",
    value: 0,
  },
  {
    name: "巡更点漏巡占比",
    value: 0,
  },
  {
    name: "任务完成时常占比",
    value: 0,
  },
  {
    name: "巡更点异常占比",
    value: 0,
  },
]);

const alarmTimeType = ref({
  timeType: "THIS_YEAR",
  dateRange: [],
});

const changeDate = async () => {
  TaskData();
};

const TaskData = async () => {
  const data = await TaskMissing({ period: alarmTimeType.value.dateRange.join(",") });
  const abnormalNum = await TaskAbnormal({ period: alarmTimeType.value.dateRange.join(",") });
  const abnormal = await taskAbnormalNum({ period: alarmTimeType.value.dateRange.join(",") });
  const completion = await completionRate({ period: alarmTimeType.value.dateRange.join(",") });
  contentList.value[0].value = completion.ratio; // Assuming index 0 is Task Completion Rate
  contentList.value[1].value = data.proportion;
  contentList.value[2].value = abnormalNum.proportion;
  contentList.value[3].value = abnormal.abnormalRatio ? abnormal.abnormalRatio : 0;
};
</script>

<style lang="less" scoped></style>
