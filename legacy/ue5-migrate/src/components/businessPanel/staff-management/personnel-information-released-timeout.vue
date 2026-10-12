<template>
  <SubPanelTemplate title="超时未出人员信息">
    <RollTable :column="columns" :data="data" :showLength="8"> </RollTable>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import RollTable from "../public/rollTable/index.vue";
import { todayTimeoutLeavePage } from '@/api/lingchuanhik'

const columns = ref([
  {
    title: "姓名",
    dataIndex: "name",
  },
  {
    title: "带领老师",
    dataIndex: "bringPoliceName",
  },
  {
    title: "进校事由 ",
    dataIndex: "visitReasonName",
  }
]);
const data = ref<any>([]);
const getTodayTimeoutLeavePage = async () => {
  const res = await todayTimeoutLeavePage({pageSize:10,pageNum:1})
  data.value = res.records
}
onMounted(() => {
  getTodayTimeoutLeavePage()
})
</script>
<style lang="less" scoped></style>