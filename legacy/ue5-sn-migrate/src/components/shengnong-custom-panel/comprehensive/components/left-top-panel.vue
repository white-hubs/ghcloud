<template>
  <SubPanelTemplate title="报警事件占比" image="bj.png" class="left-top-panel">
    <template #extra>
      <DateInlineForm v-model:modelValue="safetyWorkTime" menuPage="comprehensive" @search="changeWorkOrderTime" />
    </template>
    <div class="elevator-analysis">
      <div class="alarm-flex" v-if="pieData.length > 0">
        <div class="chart1">
          <elevator-analysis-pie
            @clickbar="clickAlarmStatistics"
            style="width: 155px"
            :pieData="pieDataList"
            :radius="'75'"
            pieClass="alarm-pie"
          >
            <div class="alarm-total">{{ totalNumber }}</div>
            <div class="alarm-total-text">报警总数</div>
          </elevator-analysis-pie>
        </div>
        <elevatorAnalysisList @handlecurrent="clickAlarmStatistics" :showRatio="false" :contentList="pieData" style="margin-left: 10px" />
      </div>
      <noData v-else />
    </div>
  </SubPanelTemplate>
  <modal-alarm-table
  :show-modal="alarmModalShow"
  @close="closeModal"
  :parameter="alarmParameter"
></modal-alarm-table>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted} from 'vue'
import SubPanelTemplate from "../../common/snPanelTemplate.vue";
import DateInlineForm from "../../common/dateInlineForm.vue";
import { ModelValueItf } from "../../../businessPanel/public/types";
import { storeMarket } from "@/piniaStore/other";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import elevatorAnalysisPie from "../../../businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "../../../businessPanel/public/elevator-analysis-list.vue";
import { alarmSituationStat, alarmTypes, alarmEventRatio } from '@/api/shennong/alarm';
import { getallNumber } from "@/utils/common";
import noData from "@/components/businessPanel/public/noData.vue";

const props = withDefaults(
  defineProps<{
    applicationCode: string;
  }>(),
  {
    applicationCode: "",
  }
);
const piniaStoreMarket = storeMarket();
const safetyWorkTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
const pieData = ref([]);
const pieDataList = ref([]);
const totalNumber = ref(0);
const codeList = new Map([
  ['firecontrolEvent_mhbj', '明火报警'],
  ['firecontrolEvent_ywbj', '烟雾报警'],
  ['firecontrolEvent_sybj', '水压报警'],
  ['gas_rqxl', '燃气报警'],
])
const changeWorkOrderTime = async () => {
  const param = {
    marketTenant: '',
    period: safetyWorkTime.value.dateRange[0] + "," + safetyWorkTime.value.dateRange[1],
    type: safetyWorkTime.value.timeType,
  };
  const [res, totalStat ] = await Promise.all([
    alarmEventRatio(param),
    alarmSituationStat(param)
  ])
  const { totalNum } = totalStat
  totalNumber.value = totalNum ?? 0
  
  const orderedPieData = Array.from(codeList.keys()).map((code,index) => {
    const item = res.find(r => r.id === code);
    if (item) {
      return {
        name: codeList.get(code) || item.name,
        value: Math.round(Number(item.ratio)),
        totalNum: item.totalNum,
        color: colors[index],
        code: code
      };
    } else {
      return {
        name: codeList.get(code) || code,
        value: 0,
        totalNum: 0,
        color: colors[index],
        code: code
      };
    }
  });
  const total = orderedPieData.reduce((a, b) => a + Number(b.value), 0);
  pieData.value = orderedPieData?.map(e => {
    return {
      ...e,
      value: `${e.value}%`,
    };
  }).filter(e => Number(e.totalNum) > 0).slice(0, 4);
  if (100 - total > 0 && pieData.value.length > 0) {
    pieData.value.push({
      name: '其他',
      value: `${100 - total}%`,
      totalNum: 100 - total,
      color: colors[0],
      code: ''
    });
  }
  pieDataList.value = pieData.value.map(e => {
    return {
      ...e,
      value: e.totalNum,
    }
  })
};
const alarmModalShow = ref<boolean>(false);
const alarmParameter = ref<Record<string, any>>({
  applicationCode: props.applicationCode,
  alarmTypeCode: props.applicationCode,
});
const clickAlarmStatistics = (record) => {
  let params = {}
  if (record.name === '其他') {
    params = {
      applicationCode: props.applicationCode,
      alarmTypeCode: '',
      dateRange: safetyWorkTime.value.dateRange,
      alarmEventTypeCode: record.code,
      filterAlarmEventTypeCodes: pieData.value?.filter(e => e.name !== '其他').map(e => e.code).join(',')
    }
  } else {
    const typeCode = typeList.value.find(e => e.alarmTypeName === record.name)
    params = {
      applicationCode: props.applicationCode,
      alarmTypeCode: typeCode?.alarmTypeCode,
      dateRange: safetyWorkTime.value.dateRange,
      alarmEventTypeCode: record.code,
      filterAlarmEventTypeCodes: ''
    }
  }
  alarmParameter.value = params
  alarmModalShow.value = true;
};
const closeModal = () => {
  alarmModalShow.value = false;
};
const typeList = ref([])
onMounted( async () => {
  typeList.value = await alarmTypes()
});
</script>
<style lang="less" scoped>

.left-top-panel {
  margin-top: 10px;
  min-height: 360px;
}
.elevator-analysis {
  display: flex;
  justify-content: space-between;
  align-items: center;
  // padding: 20px 0;
  padding-top: 20px;
}
.chart1 {
  flex: 1;
  width: 152px;
  height: 152px;
}
.alarm-flex{
  display: flex;
  width: 100%;
  align-items: center;
}
.alarm-total{
  color: #fff; text-align: center; font-size: 32px;
  font-family: D-DIN, D-DIN-Regular;
  font-weight: bold;
}
.alarm-total-text{
  color: #fff; text-align: center; font-size: 15px
}
.alarm-analysis,:deep(.alarm-analysis) {
  height: auto;
  .alarm-analysisBox {
    margin-bottom: 15px;
  }
}
</style>