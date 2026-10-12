<template>
  <SubPanelTemplate title="报警统计" image="alarm.png" class="visiting-data">
    <template #extra>
      <DateInlineForm v-model:modelValue="alarmTime" @search="changeTimeAlarm" menuPage="securityMonitoring" />
    </template>
    <EventStatistics :data="alarmList" @clickRow="(item)=>{clickRow(item)}" @changeTabs="changeRask" @moreClick="moreClick"
      :isScroll="isScroll" />
  </SubPanelTemplate>
  <modal-alarm-table
    :show-modal="alarmModalShow"
    @close="closeModal"
    :parameter="alarmParameter"
  ></modal-alarm-table>
  <AlarmStatisticsModal @close="showAbnormalModal = false" :modalTitle="'安防事件报警统计-各市场对应事件报警数'" :showModal="showAbnormalModal" :parameter="alarmParameter"></AlarmStatisticsModal>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../../common/snPanelTemplate.vue";
import EventStatistics from '../../common/event-statistics.vue'
import DateInlineForm from "../../common/dateInlineForm.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { alarmStatisticsRank } from "@/api/shennong/alarm";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import { filterMarket, getallNumber } from "@/utils/common";
import AlarmStatisticsModal from "./alarm-statistics-modal.vue";
const props = withDefaults(
  defineProps<{
    applicationCode: string;
  }>(),
  {
    applicationCode: "SECURITY_MONITORING",
  }
);
const showAbnormalModal = ref(false)
const currentNumber = ref('ALARM_ALL')
const alarmTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const alarmList = ref([])
const isScroll=ref(false)
const alarmModalShow = ref<boolean>(false);
const alarmParameter = ref<Record<string, any>>({
  applicationCode: props.applicationCode,
  alarmStatus: "",
  alarmTypeCode: props.applicationCode,
});
const changeTimeAlarm = async () =>{
  let param = {
    period: alarmTime.value.dateRange.join(","),
    type: alarmTime.value.timeType,
    stateRange: currentNumber.value,
    pageSize: 50,
    pageNumber: 1,
    applicationCode: props.applicationCode,
  };
  let { records } = await alarmStatisticsRank(param);
  alarmList.value = []
  if (Array.isArray(records) && records.length > 0) {
    const newRecords = filterMarket(records)
    const totalNum=getallNumber(newRecords, "totalNum")
    alarmList.value = newRecords
      .sort((a, b) => b.totalNum - a.totalNum)
      .map((item, index) => {
        return {
          ...item,
          rank: index + 1,
          name: item.marketName,
          count: item.totalNum,
          chainRatio: item.chainRatio,
          width:totalNum? item.totalNum / totalNum * 100:0,
        };
      }).slice(0, 3);
  }
}
const clickRow = (data)=>{
  alarmModalShow.value = true;
  alarmParameter.value = Object.assign(alarmParameter.value, data);
  alarmParameter.value.dateRange = alarmTime.value.dateRange
  alarmParameter.value.alarmStatus = currentNumber.value == "ALARM_ALL" ? "" : "ALARM_HANDLER";
}
const moreClick = ()=>{
  showAbnormalModal.value = true
  // alarmModalShow.value = true;
  alarmParameter.value = Object.assign(alarmParameter.value, {
    dateRange:alarmTime.value.dateRange,
  });
  
  alarmParameter.value.type = alarmTime.value.timeType;
  alarmParameter.value.alarmStatus = currentNumber.value
  
}
const changeRask = (data)=>{
  currentNumber.value = data
  changeTimeAlarm()
}
const closeModal = () => {
  alarmModalShow.value = false;
};
</script>
<style lang="less" scoped></style>