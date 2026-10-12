<template>
  <SubPanelTemplate title="电动车违规充电统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="alarmTimeType" @search="changeDate"></DateInlineForm>
    </template>
    <DeviceStatistics @handelClickItemize="handelClickItemize" style="height: 50px;" imgPath="overView121.png" :statistic="deviceStatisticsData">
    </DeviceStatistics>
    <div class="table-concent">
      <RollTable @clickRow="clickRow" :column="columns" :data="data" :showLength="8"> </RollTable>
    </div>
  </SubPanelTemplate>

  <inspect ref="inspectRef" :title="'巡查记录详情'" v-if="alarmModalShow" :parameter="inspectParameter" @close="close"></inspect>

  <modal-table :modalStyle="{width:'900px'}" v-if="inspectionRecordShow" :show="inspectionRecordShow" title="电动车违规充电记录" @close="()=>inspectionRecordShow = false">
    <inspect-record :parameter="inspectListParameter"></inspect-record>
  </modal-table>

</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DeviceStatistics from "@/components/businessPanel/small-engineering/components/device-statistics.vue"
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from '../public/types'
import { inspectElectronMobileChargePage, inspectElectronMobileChargeStat } from '@/api/maintain'
import inspect from "@/components/businessPanel/small-engineering/components/inspect-detail/index.vue";
import dayjs from 'dayjs'
import inspectRecord from "@/components/businessPanel/small-engineering/components/inspect-record.vue";
import modalTable from '@/components/modal-table/modal.vue'

const inspectionRecordShow = ref(false)
const inspectListParameter = ref({
  period:[],
  title:'电动车违规充电记录'
})
const deviceStatisticsData = reactive({
    title: "违规充电总数",
    total: 0,
    ratio:0
});
const alarmTimeType = ref<ModelValueItf>({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const inspectParameter = ref({
  id:'',
})
const alarmModalShow = ref(false)
const data = ref<any>([]);
const columns = ref([
  {
    title: "巡检对象",
    dataIndex: "targetName",
  },
  {
    title: "所属巡检任务",
    dataIndex: "taskName",
  },
  {
    title: "巡查时间",
    dataIndex: "time",
  },{
    title: "巡查人",
    dataIndex: "nickname",
  },
]);
const close = ()=>{
  alarmModalShow.value = false
}
const clickRow = (value)=>{
  inspectParameter.value.id = value.id
  alarmModalShow.value = true
}
const handelClickItemize = ()=>{
  inspectListParameter.value.period = alarmTimeType.value.dateRange
  inspectionRecordShow.value = true
}
const changeDate = async (val:ModelValueItf)=>{
  const res = await inspectElectronMobileChargeStat({period:alarmTimeType.value.dateRange.join(",")})
  deviceStatisticsData.total = res.total;
  deviceStatisticsData.ratio = Number(res.chainRatio);
  const park = await inspectElectronMobileChargePage({
    period:alarmTimeType.value.dateRange.join(","),
    pageNumber:1,
    pageSize:20
  })
  data.value = park.records.map(e=>{
    return {
      ...e,
      time:dayjs(e.time).format("YYYY-MM-DD HH:mm:ss"),
      taskName:e.taskName||'临时巡检'
    }
  })
}
</script>
<style lang="less" scoped>
.table-concent{
  margin-top: 10px;
  height:300px;
}
</style>