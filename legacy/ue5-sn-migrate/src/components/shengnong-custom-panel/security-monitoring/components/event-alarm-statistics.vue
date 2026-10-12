<template>
  <SubPanelTemplate title="事件报警统计" image="bj.png" class="gz">
    <template #extra>
      <DateInlineForm v-model:modelValue="safetyWorkTime" @search="changeWorkOrderTime" menuPage="securityMonitoring" />
    </template>
    <NumberStatistics :data="safetyWorkData" @click="clickAlarmStatistics"/>

  </SubPanelTemplate>
  <modal-alarm-table
  :show-modal="alarmModalShow"
  @close="closeModal"
  :parameter="alarmParameter"
></modal-alarm-table>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../../common/snPanelTemplate.vue";
import DateInlineForm from "../../common/dateInlineForm.vue";
import { ModelValueItf } from "../../../businessPanel/public/types";
import NumberStatistics from "../../common/number-statistics.vue";
import { alarmEventRatio } from '@/api/shennong/alarm'
import { storeMarket } from "@/piniaStore/other";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";

const props = withDefaults(
  defineProps<{
    applicationCode: string;
  }>(),
  {
    applicationCode: "SECURITY_MONITORING",
  }
);
const piniaStoreMarket = storeMarket();
const safetyWorkTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const safetyWorkData = reactive([
 {
    name: '烟火报警',
    value: 0,
    sign:'firecontrolEvent_mhbj',
    subtitle: 'firecontrolEvent_ywbj',
    unit: '个',
    icon: "security-1.png",
  },
  {
    name: '交通拥堵报警',
    value: 0,
    sign:'manageEvent_jtyd',
    unit: '个',
    icon: "security-5.png",
  },
  {
    name: '消防通道占用报警',
    value: 0,
    sign:'firecontrolEvent_wgzyxftd',
    unit: '个',
    icon: "security-3.png",
  },
  {
    name: '车辆违停报警',
    value: 0,
    sign:'manageEvent_clwt',
    unit: '个',
    icon: "security-2.png",
  },
]);
const changeWorkOrderTime = async ()=>{
  let param = {
    period: safetyWorkTime.value.dateRange.join(","),
    type: safetyWorkTime.value.timeType,
    marketTenant: '',
    applicationCode: props.applicationCode,
  };
  let res: any = await alarmEventRatio(param);
  safetyWorkData.forEach(aItem => {
  aItem.value = 0; 
  res.forEach(bItem => {
    if (bItem.id.includes(aItem.sign)||bItem.id.includes(aItem.subtitle)) {
      aItem.value += bItem.totalNum;
    }
  });
});

}
const alarmModalShow = ref<boolean>(false);
const alarmParameter = ref<Record<string, any>>({
  applicationCode: props.applicationCode,
  alarmTypeCode: props.applicationCode,
});
const clickAlarmStatistics = (record) => {
  if (record.subtitle) {
    alarmParameter.value = {
      applicationCode: props.applicationCode,
      alarmTypeCode: props.applicationCode,
      dateRange: safetyWorkTime.value.dateRange,
      alarmEventTypeCodes: [record.sign, record.subtitle].join(","),
    }
  } else {
    alarmParameter.value = {
      applicationCode: props.applicationCode,
      alarmTypeCode: props.applicationCode,
      dateRange: safetyWorkTime.value.dateRange,
      alarmEventTypeCode: record.sign,
    }
  }
  alarmModalShow.value = true;
};
const closeModal = () => {
  alarmModalShow.value = false;
};
</script>
<style lang="less" scoped></style>