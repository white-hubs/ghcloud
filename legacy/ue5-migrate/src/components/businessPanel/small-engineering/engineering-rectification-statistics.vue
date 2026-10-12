<template>
  <SubPanelTemplate title="工程整改统计">
    <template #extra>
      <div class="flex-align">
        <DateInlineForm v-model:modelValue="timeFrame" @search="getAlarmLevel" />
      </div>
    </template>
    <DeviceStatistics style="height: 50px;" imgPath="overView120.png" :statistic="deviceStatisticsData">
    </DeviceStatistics>
    <div class="table-concent">
      <RollTable :column="columns" :data="data" :showLength="8"> </RollTable>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DeviceStatistics from "./components/device-statistics.vue"
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from '../public/types'
import { cubeSmallEngineeringService } from '@/api/service'

const deviceStatisticsData = reactive({
    title: "工单总量",
    total: 284,
    ratio:0
});
const data = ref<any>([]);
const columns = ref([
  {
    title: "工程整改名称",
    dataIndex: "processInsName",
  },
  {
    title: "整改对象",
    dataIndex: "projectName",
  },
  {
    title: "状态",
    dataIndex: "status",
  },
]);
let timeFrame = ref<ModelValueItf>();
const getAlarmLevel = async ()=>{
  const res = await cubeSmallEngineeringService.getProjectReformAnalysis({ 
    period: timeFrame.value.dateRange.join(","),
    pageNumber:1,
    pageSize:10,
  })
  deviceStatisticsData.total = res.reformNum
  deviceStatisticsData.ratio = res.reformChainRatio
  const statusMap = {
    PASS:'已完成',
    UNDO:'撤销',
    REJECT:'驳回',
    ACTIVE:'处理中',
  }
  data.value = res.reformRankList.map((item:any)=>{
    return {
      ...item,
      projectName:item.projectName,
      status: statusMap[item.status] || '--'
    }
  })
}
</script>
<style lang="less" scoped>
.table-concent{
  margin-top: 10px;
  height: 300px;
}
</style>