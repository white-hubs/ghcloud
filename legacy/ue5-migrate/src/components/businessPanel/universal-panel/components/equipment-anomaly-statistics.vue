<template>
  <SubPanelTemplate :title="title">
      <template #extra>
        <DateInlineForm v-model:modelValue="receptionTrendsTime" @search="getAbnormalStatistics"></DateInlineForm>
      </template>
      <div class="alarmInfo">
        <deviceModule :data-list="alarmAbnormal"></deviceModule>
      </div>
      <RollTable :column="alarmColumn" :data="listData">
        <template #situation="{ record }">
          <span v-if="record.situation === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待处理</span>
          <span v-else-if="record.situation === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
          <span v-else="record.situation === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
        </template>
      </RollTable>
    </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import { ModelValueItf } from '../../public/types'
import { storeMenu } from "@/piniaStore/menu";
import { storeArea } from "@/piniaStore/area";
import { abnormalStatistics } from '@/api/alarm'
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import deviceModule from "../../public/deviceModule.vue";
import RollTable from "../../public/rollTable/index.vue";
import { useStateStore } from '@/pages/state/use-state-store';
interface Props {
  title: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: '设备异常统计',
});
const { globalState } = useStateStore()

let alarmAbnormal = reactive([
  {
    title:'异常设备数量',
    value:0
  },
  {
    title:'报警次数',
    value:0
  },
]);
const alarmColumn = [
  {
    title: "日期",
    dataIndex: "timeFlag",
    width: 120,
  },
  {
    title: "异常设备数量",
    dataIndex: "equipmentNum",
  },
  {
    title: "报警次数",
    dataIndex: "alarmNum",
    width: 140,
  }
];
const listData = ref([])
const receptionTrendsTime = ref<ModelValueItf>();
const getAbnormalStatistics=async()=>{
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: receptionTrendsTime.value.dateRange.join(","),
    type: receptionTrendsTime.value.timeType,
  };
  const res = await abnormalStatistics(param)
  alarmAbnormal[0].value=res.equipmentDeviceTotal
  alarmAbnormal[1].value=res.equipmentTotal
  listData.value=res.equipmentList
  if(receptionTrendsTime.value.timeType==='THIS_YEAR'){
    listData.value.forEach(x=>{
      x.timeFlag=x.timeFlag+'月'
    })
  }
  if(receptionTrendsTime.value.timeType==='TODAY'){
    res.equipmentList.forEach(x=>{
      x.timeFlag=x.timeFlag+'时'
    })
  }
}
</script>
<style lang="less" scoped>
.alarmInfo{
  .deviceList{
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
  margin-bottom: 10px;
}
</style>