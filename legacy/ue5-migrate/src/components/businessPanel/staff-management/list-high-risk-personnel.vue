<template>
  <SubPanelTemplate title="高风险学生列表">
    <div class="list-high-risk-personnel">
      <RollTable :column="columns" :data="data" :showLength="8"> </RollTable>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import RollTable from "../public/rollTable/index.vue";
import { hikCriminalPage } from '@/api/lingchuanhik'

const columns = ref([
  {
    title: "姓名",
    dataIndex: "name",
  },
  {
    title: "所在位置",
    dataIndex: "address",
  },
  {
    title: "风险等级",
    dataIndex: "riskLevel",
  },
  {
    title: "风险原因",
    dataIndex: "riskReason",
  },
]);
const data = ref<any>([]);
const getHikCriminalPage = async () => {
  const res = await hikCriminalPage({riskLevel:'高风险'})
  data.value = res.records
}
onMounted(() => {
  getHikCriminalPage()
})
</script>
<style lang="less" scoped>
.list-high-risk-personnel{
  height: 200px;
}
</style>