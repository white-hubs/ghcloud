<template>
  <SubPanelTemplate title="小散工程统计">
    <template #extra>
      <div class="flex-align">
        <DateInlineForm v-model:modelValue="timeFrame" @search="getAlarmLevel" />
      </div>
    </template>
    <DisplayPanel @itemClick="openModal" :bg-img="'overView47.png'" :content-list="listData"></DisplayPanel>
  </SubPanelTemplate>
  <engineeringManagementModel @close="()=>showModal = false" :showModal="showModal" :parameter="parameter"></engineeringManagementModel>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DisplayPanel from "./components/display-panel.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from '../public/types'
import { cubeSmallEngineeringService } from '@/api/service'
import engineeringManagementModel from './components/engineering-management-model.vue'

const listData = ref([
  {
    name: "待验收",
    value: 0,
  }, 
  {
    name: "进行中",
    value: 0,
  }, 
  {
    name: "已完成",
    value: 0,
  },
  {
    name: "异常数",
    value: 0,
  },
  {
    name: "工程总数",
    value: 0,
  },
]);
const showModal = ref(false)
const parameter = ref({
  dateRange:[],
  queryScoped:''
})
let timeFrame = ref<ModelValueItf>();
const getAlarmLevel = async ()=>{
  const res = await cubeSmallEngineeringService.projectStatistics({ period: timeFrame.value.dateRange.join(",")})
  listData.value[0].value = res?.waitAccept
  listData.value[1].value = res?.underway
  listData.value[2].value = res?.completed
  listData.value[3].value = res?.abnormal
  listData.value[4].value = res?.total
}
const openModal = (value)=>{
  const type = {
    '工程总数' : 'ALL',
    '进行中' : 'UNDERWAY',
    '已完成' : 'COMPLETED',
    '待验收' : 'WAIT_ACCEPT',
    '异常数' : 'ABNORMAL'
  }
  parameter.value.dateRange = timeFrame.value.dateRange
  parameter.value.queryScoped = type[value.name]
  showModal.value = true
}
</script>
<style lang="less" scoped></style>