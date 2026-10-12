<template>
  <SubPanelTemplate title="电瓶车建档统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="alarmTimeType" @search="changeDate"></DateInlineForm>
    </template>
    <div class="content">
      <DeviceStatistics @click="handelClickItemize" :showRatio="false" style="height: 50px;" imgPath="overView121.png" :statistic="deviceStatisticsData">
      </DeviceStatistics>
    </div>
  </SubPanelTemplate>
  <electricVehicleLedgerModel :parameter="parameter" @close="showModal = false" :showModal="showModal"></electricVehicleLedgerModel>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from '../public/types'
import DeviceStatistics from "@/components/businessPanel/small-engineering/components/device-statistics.vue"
import { electronMobileStat } from '@/api/property'
import electricVehicleLedgerModel from "./components/electric-vehicle-ledger-model.vue";

const showModal = ref(false);
const alarmTimeType = ref<ModelValueItf>({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const parameter = ref({
  dateRange:[],
})
const deviceStatisticsData = reactive({
    title: "电动车建档总数",
    total: 0,
});
const changeDate = async (val:ModelValueItf)=>{
  const res = await electronMobileStat({period:alarmTimeType.value.dateRange.join(",")})
  deviceStatisticsData.total = res
}
const handelClickItemize = ()=>{
  parameter.value.dateRange = alarmTimeType.value.dateRange
  showModal.value = true
}
</script>
<style lang="less" scoped>
.content{
  padding: 25px 0;
}
</style>