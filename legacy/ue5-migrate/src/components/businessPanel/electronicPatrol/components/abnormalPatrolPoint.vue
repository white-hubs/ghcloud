<template>
  <SubPanelTemplate title="巡更点异常top5统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="alarmTime" @search="changeAlarmTime"></DateInlineForm>
    </template>
    <RollTable :column="column" :data="planListData">
    </RollTable>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import RollTable from "../../public/rollTable/index.vue";
import { locationList } from "@/api/maintain";

const alarmTime = ref()
const column = [
  {
    title: "巡更点",
    dataIndex: "locationName",
    width: 120,
  },
  {
    title: "异常次数",
    dataIndex: "abnormalNum",
  },
  {
    title: "巡更率",
    dataIndex: "patrolRatio",
    width: 140,
  }
];
const planListData = ref([])
const changeAlarmTime =async () => {
 planListData.value = await locationList({period:alarmTime.value.dateRange.join(',')})
 planListData.value.map(item=>{
    item.abnormalNum = item.abnormalNum || 0
  })
}
</script>
<style lang="less" scoped></style>