<template>
  <SubPanelTemplate title="正在施工工程数占比" image="bt.png">
    <template #extra>
      <DateInlineForm
        class="shengNongColor"
        v-model:modelValue="dnTime"
        @search="handleTime"
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
          <div style="color: #a5b6da; text-align: center; font-size: 12px">工程总数</div>
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
  <modal-table
    v-if="alarmModalShow"
    :show="alarmModalShow"
    title="小散工程记录"
    @close="closeModal"
  >
    <project-record :parameter="alarmParameter"></project-record>
  </modal-table>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import SubPanelTemplate from "@/components/businessPanel/public/snPanelTemplate.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "@/components/businessPanel/public/sn-elevator-list.vue";
import { getallNumber } from "@/utils/common";
import { storeMarket } from "@/piniaStore/other";
import { storeArea } from "@/piniaStore/area";
import { looseWorksStatisticsStatusPie } from "@/api/shennong/alarm";
import noData from "@/components/businessPanel/public/noData.vue";
import modalTable from "@/components/modal-table/modal.vue";
import projectRecord from "./project-record.vue";

const piniaStoreMarket = storeMarket();
const piniaStoreArea = storeArea();
const props = withDefaults(
  defineProps<{
    chartHeight?: number;
    applicationCode: string;
  }>(),
  {
    chartHeight: 300,
    applicationCode: "SMALLENFINEERING",
  }
);

const marketData = ref(piniaStoreArea.marketDataCN ?? []);
const alarmModalShow = ref<boolean>(false);
const alarmParameter = ref<Record<string, any>>({
  applicationCode: props.applicationCode,
  period: [],
  marketTenant: ""
});
const closeModal = () => {
  alarmModalShow.value = false;
};
const openalarm = (record) => {
  alarmParameter.value = Object.assign(alarmParameter.value, {
    ...record,
    marketTenant: marketData.value.find(e => e.marketName === record.name)?.marketTenant,
    period: dnTime.value.dateRange,
    status: 'UNDERWAY'
  });
  alarmModalShow.value = true;
};
const dnTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const pieData = ref([]);
const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
const changednTime = async () => {
  let param = {
    period: dnTime.value.dateRange.join(","),
    type: dnTime.value.timeType,
    marketTenant: piniaStoreMarket.currentMarket ? [Number(piniaStoreMarket.currentMarket)] : [],
    applicationCode: props.applicationCode,
    status: ['UNDERWAY']
  };
  let res: any = await looseWorksStatisticsStatusPie(param);
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
const handleTime = () => {
  pieData.value = []
  changednTime()
}
let timer = null;
// 报警处理情况 每15秒轮播
onMounted(() => {
  changednTime()
  timer = setInterval(() => {
    changednTime()
  }, (window as any).config.pageLoopRequestTime);
});

watch(
  () => piniaStoreMarket.currentMarketName,
  (n) => {
    if (n) {
      clearInterval(timer);
      changednTime();
    } else {
      changednTime();
      timer = setInterval(() => {
        changednTime();
      }, (window as any).config.pageLoopRequestTime);
    }
  },
  { deep: true }
);
onUnmounted(() => {
  clearInterval(timer);
});
</script>
<style lang="less" scoped>
.elevator-analysis {
  padding: 0 10px;
  text-align: center;
}
.chart {
  height: 220px;
  width: 155px;
  margin: 0 auto;
}
:deep(.alarm-analysis){
  width: 258px;
  margin-top: 30px;
}
</style>
