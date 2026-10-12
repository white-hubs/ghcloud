<template>
  <SubPanelTemplate title="报警响应情况" image="security-6.png" class="visiting-data">
    <template #extra>
      <DateInlineForm v-model:modelValue="alarmTime" @search="changeTimeAlarm" menuPage="securityMonitoring"/>
    </template>
    <EventStatistics :data="alarmList" @clickRow="(item)=>{clickRow(item)}" @moreClick="moreClick"
      :isScroll="isScroll" :show-tabs="false" />
  </SubPanelTemplate>
  <modal-alarm-table
    :show-modal="alarmModalShow"
    @close="closeModal"
    :parameter="alarmParameter"
  ></modal-alarm-table>
  <AlarmStatisticsModal @close="showAbnormalModal = false" :modalTitle="'报警响应情况'" :showModal="showAbnormalModal" :parameter="alarmParameter" :getDataFunc="getSecurityRankApi" ></AlarmStatisticsModal>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../../common/snPanelTemplate.vue";
import EventStatistics from '../../common/event-statistics.vue'
import DateInlineForm from "../../common/dateInlineForm.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { alarmConfirmSituation, alarmStatisticsRank } from "@/api/shennong/alarm";
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
    pageSize: 50,
    pageNumber: 1,
    applicationCode: props.applicationCode,
  };
  let { records } = await alarmConfirmSituation(param);
  alarmList.value = []
  if (Array.isArray(records) && records.length > 0) {
    const newRecords = filterMarket(records)
    const totalNum = getallNumber(newRecords, "totalNum")
    alarmList.value = newRecords
      .sort((a, b) => b.totalNum - a.totalNum)
      .map((item, index) => {
        return {
          ...item,
          rank: index + 1,
          name: item.marketName,
          count: item.totalNum,
          chainRatio: item.chainRatio,
          width: totalNum ? item.totalNum / totalNum * 100: 0,
        };
      }).slice(0, 3);
  }
}
const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
const getSecurityRankApi =  async (param?: Record<string, any>): Promise<any> => {
  let { records, total, pages } = await alarmConfirmSituation(param);
  const totalCount = records.reduce((pre,cur)=>pre+cur.totalNum,0)
  const list = records.toSorted((a,b)=>b.totalNum-a.totalNum).map((item, index) => {
    return {
      sort: index + 1,
      marketName: item.marketName,
      value: item.totalNum,
      count: item.totalNum,
      totalNum: item.totalNum,
      ratio: item.totalNum / totalCount,
      color: colors[index % colors.length],
    };
  });
  return { total: total, records: list, pages: pages }
};
const clickRow = (data)=>{
  alarmParameter.value = Object.assign(alarmParameter.value, data);
  alarmParameter.value.dateRange = alarmTime.value.dateRange
  alarmParameter.value.alarmStatus = 'ALARM_UN_CONFIRMED'
  alarmModalShow.value = true;
}
const moreClick = ()=>{
  showAbnormalModal.value = true
  alarmParameter.value = Object.assign(alarmParameter.value, {
    dateRange:alarmTime.value.dateRange,
    type:alarmTime.value.timeType,
    marketTenant: undefined,
    name: undefined,
  });
}
const closeModal = () => {
  alarmModalShow.value = false;
};
</script>
<style lang="less" scoped></style>