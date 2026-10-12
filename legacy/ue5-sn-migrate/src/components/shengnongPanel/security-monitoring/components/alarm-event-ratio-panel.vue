<template>
  <SubPanelTemplate title="报警事件占比" image="bt.png">
    <template #extra>
      <DateInlineForm
        class="shengNongColor"
        v-model:modelValue="dnTime"
        @search="changednTime"
      ></DateInlineForm>
    </template>
    <div class="elevator-analysis" v-if="pieData.length > 0">
      <div class="chart">
        <elevator-analysis-pie
          :pieData="pieData"
          style="width: 155px"
          @clickbar="openalarm"
        >
          <div style="color: #fff; text-align: center; font-size: 14px">
            {{ getallNumber(pieData, "totalNum") }}
          </div>
          <div style="color: #a5b6da; text-align: center; font-size: 12px">报警总数</div>
        </elevator-analysis-pie>
      </div>
      <elevatorAnalysisList
        :contentList="pieData"
        :showRatio="false"
      ></elevatorAnalysisList>
    </div>
    <div style="width: 100%; margin-top: 30px" v-else>
      <noData />
    </div>
  </SubPanelTemplate>
  <modal-alarm-table
    :show-modal="alarmModalShow"
    @close="closeModal"
    :parameter="alarmParameter"
  ></modal-alarm-table>
</template>
<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, onUnmounted, watch } from "vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import SubPanelTemplate from "@/components/businessPanel/public/snPanelTemplate.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "@/components/businessPanel/public/sn-elevator-list.vue";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import { getallNumber } from "@/utils/common";
import { storeMarket } from "@/piniaStore/other";
import { alarmEventRatio } from "@/api/shennong/alarm";
import noData from "@/components/businessPanel/public/noData.vue";

const piniaStoreMarket = storeMarket();
const props = withDefaults(
  defineProps<{
    chartHeight?: number;
    applicationCode: string;
  }>(),
  {
    chartHeight: 300,
    applicationCode: "SECURITY_MONITORING",
  }
);

const alarmModalShow = ref<boolean>(false);
const alarmParameter = ref<Record<string, any>>({
  applicationCode: props.applicationCode,
  alarmStatus: "",
  alarmTypeCode: props.applicationCode,
});
const closeModal = () => {
  alarmModalShow.value = false;
};
const openalarm = (record) => {
  alarmModalShow.value = true;
  alarmParameter.value = Object.assign(alarmParameter.value, record);
  alarmParameter.value.name = piniaStoreMarket.currentMarketName;
};
const dnTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const pieData = ref([]);
const colors = ["#94BAF9", "#6C9BE8", "#3F7CDF", "#2989FF"];
const changednTime = async () => {
  alarmParameter.value.dateRange = dnTime.value.dateRange;
  let param = {
    period: dnTime.value.dateRange.join(","),
    type: dnTime.value.timeType,
    marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: props.applicationCode,
  };
  let res: any = await alarmEventRatio(param);
  pieData.value = res.map((item, index) => {
    return {
      ...item,
      name: item.name,
      value: item.ratio,
      ratio: false,
      color: colors[index % colors.length],
    };
  });
};
watch(
  () => piniaStoreMarket.currentMarket,
  (n) => {
    changednTime();
  }
);
</script>
<style lang="less" scoped>
.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  align-items: center;
}
.chart {
  flex: 1;
  height: 220px;
}
</style>
