<template>
  <SubPanelTemplate title="各市场车辆占比" image="bt.png">
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
          <div style="color: #a5b6da; text-align: center; font-size: 12px">电动车数</div>
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
  <modal-table :show="alarmModalShow" title="电动车建档记录" @close="closeModal">
    <modal-record
      :periodtime="dnTime.dateRange.join(',')"
      type="ELECTRO_MOBILE"
      :marketid="marketId"
      v-if="alarmModalShow"
      :showClass="false"
    ></modal-record>
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
import { propertyVehiclePie } from "@/api/shennong/alarm";
import noData from "@/components/businessPanel/public/noData.vue";
import modalTable from "@/components/modal-table/modal.vue";
import ModalRecord from "../../gasPanel/gastable.vue";

const piniaStoreMarket = storeMarket();
const piniaStoreArea = storeArea();
const props = withDefaults(
  defineProps<{
    chartHeight?: number;
    applicationCode: string;
  }>(),
  {
    chartHeight: 300,
    applicationCode: "",
  }
);

const alarmModalShow = ref<boolean>(false);
const closeModal = () => {
  alarmModalShow.value = false;
};
const openalarm = (record) => {
  marketId.value = marketData.value.find(e => e.marketName === record.name)?.marketTenant,
  alarmModalShow.value = true;
};
const dnTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const marketData = ref(piniaStoreArea.marketDataCN ?? []);
const marketId = ref('');
const pieData = ref([]);
const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
const changednTime = async () => {
  let param = {
    createdPeriod: dnTime.value.dateRange.join(","),
    type: dnTime.value.timeType,
    marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: props.applicationCode,
  };
  let res: any = await propertyVehiclePie(param);
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
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 10px;
}
.chart {
  flex: 1;
  height: 220px;
}
</style>
