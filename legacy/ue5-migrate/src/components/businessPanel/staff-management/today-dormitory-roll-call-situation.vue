<template>
  <SubPanelTemplate title="今日宿舍点名情况">
    <RollTable :column="columns" :data="data" :showLength="8"> </RollTable>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import RollTable from "../public/rollTable/index.vue";
import { personRollCallPage } from '@/api/lingchuanhik'
import { useStateStore } from '@/pages/state/use-state-store';

const { globalState } = useStateStore()

const columns = ref([
  {
    title: "宿舍",
    dataIndex: "orgName",
  },
  {
    title: "姓名",
    dataIndex: "personName",
  },
  {
    title: "点名情况",
    dataIndex: "status",
  },
  {
    title: "备注",
    dataIndex: "remark",
  },
]);
const data = ref<any>([]);

const getPersonRollCallPage = async () => {
 const res = await personRollCallPage({
      pageNumber:1,
      pageSize:20,
      areaId:globalState.business.currentAreaId,
    })
    data.value = res.records.map(e=>{
      return {
        ...e,
        status: e.status == '1' ? '已到' : '未到'
      }
    })
}
onMounted(()=>{
  getPersonRollCallPage()
})
</script>
<style lang="less" scoped></style>