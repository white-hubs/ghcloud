<!-- 门禁管理 -->
<template>
  <div >
    <SubPanelTemplate title="设备实时状态">
      <div class="equipmentAlarm">
        <RoundPie :eventNum="eventNum" :data="roundPieData.arr">
          <div class="content">
            <span>{{ eventNum }}</span> <br />设备总数
          </div>
        </RoundPie>
        <pieList :roundPieData="roundPieData.arr"></pieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="异常事件top5" class="alarm-event">
      <!-- <template #bar>
                <div class="right-bar">查看更多》</div>
                </template> -->
      <template #extra>
        <DateInlineForm v-model:modelValue="event" @search="alarmEventTop"></DateInlineForm>
      </template>
      <div class="body" style="min-height: 250px">
        <EventAlarmItem v-for="(item, index) in unusual.arr" :sort="1" :name="item.name" :linkRatio="item.ringRatio"
          :count="item.value" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="异常通行趋势" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="through" @search="abnormalPassageInfo"></DateInlineForm>
      </template>
      <OperateDays :value="numberPasses" title="通行总次数"> </OperateDays>
      <div class="chart">
        <LineChart :x-data="ecahrtsData.xData" :series="[
            {
              data: ecahrtsData.yData,
              linearGradientColor: ['rgb(255, 162, 0.1)', 'rgb(255, 222, 165,1)'],
            },
          ]" />
      </div>
    </SubPanelTemplate>
  </div>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import RoundPie from "../public/charts/roundPie/roundPie.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import pieList from "../public/pieList.vue";
import EventAlarmItem from "../public/eventAlarmItem.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import changeBar from "../public/changeBar.vue";
import OperateDays from "../public/operateDays.vue";
import LineChart from "../public/lineChart.vue";
import {
  deviceStatus,
  alarmEvent,
  abnormalPassage,
} from "@/utils/requestData/accessControl";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { storeArea } from "@/piniaStore/area";
import { useStateStore } from "@/pages/state/use-state-store";
const { globalState } = useStateStore();
const roundPieData: any = reactive({
  arr: [],
});
let timer: any = reactive(null);
let event = ref();
let through = ref();
let numberPasses = ref(0);
const eventNum = ref<number>(0);
const unusual = reactive({
  arr: [],
});
const ecahrtsData = reactive({
  xData: [],
  yData: [],
});
watch(
  () => globalState.business.currentAreaId,
  () => {
    clearInterval(timer);
    timer = setInterval(() => {
      init();
    }, (window as any).config.pageLoopRequestTime);
    init();
  }
);
// 设备实时状态
const deviceRealTimeStatus = async () => {
  let res: any = await deviceStatus();
  eventNum.value = res.total;
  roundPieData.arr = res.data;
};
// 报警事件top5
const alarmEventTop = async () => {
  unusual.arr = await alarmEvent(event.value.timeType);
};
// 异常通行趋势
const abnormalPassageInfo = async () => {
  let res = await abnormalPassage(through.value.timeType, "DO_REFUSE");
  ecahrtsData.xData = res.xdata;
  ecahrtsData.yData = res.series[0].value;
  numberPasses.value = 0;
  res.series[0].value.forEach((item) => {
    numberPasses.value += item;
  });
};
const init = () => {
  deviceRealTimeStatus();
};
onMounted(() => {
  alarmEventTop();
  abnormalPassageInfo();
  deviceRealTimeStatus();
  timer = setInterval(() => {
    init();
  }, (window as any).config.pageLoopRequestTime);
});
onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>
<style lang="less" scoped>
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;

  .content {
    font-size: 12px;
  }
}

.ringRatio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin-left: 6px;
}

.chart {
  height: 200px;
  display: flex;
}
</style>
