<template>
      <SubPanelTemplate title="巡更路线">
      <div class="footer">
         <RollTable :column="routeColumn" :data="listData" :limitScrollNum="4">
         </RollTable>
       </div>
    </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import RollTable from "../../public/rollTable/index.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { routeList } from "@/api/maintain";

const routeColumn = [
  {
    title: "巡更路线",
    dataIndex: "patrolRouteName",
    width: 120,
  },
  {
    title: "巡更点数量",
    dataIndex: "patrolLocationNumber",
  }
];
const listData = ref([])
const getPatrolRoute =async () => {
  listData.value = await routeList()
}
onMounted(()=>{
  getPatrolRoute()
})
</script>
<style lang="less" scoped>
.footer{
  height: 400px;
}
</style>