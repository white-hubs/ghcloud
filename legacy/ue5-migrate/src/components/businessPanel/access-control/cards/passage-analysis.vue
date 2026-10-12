<template>
  <SubPanelTemplate title="通行分析" class="alarm-event">
    <template #extra>
      <DateInlineForm v-model:modelValue="throughType" @search="trafficAnalysisInfo"></DateInlineForm>
    </template>
    <div class="equipmentAlarm" v-show="roundPieData.arr.length > 0">
      <planPie :pie-data="roundPieData.arr">
        <div class="content">
          <div class="pie-center">{{ throughNum }}</div>
          <div>通行总数</div>
        </div>
      </planPie>
      <pieList :roundPieData="roundPieData.arr"></pieList>
    </div>
    <div class="equipmentAlarm" v-show="roundPieData.arr.length <= 0">
      <noData></noData>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch } from "vue";

import planPie from "../../public/charts/pie/planePie.vue";
import pieList from "../../public/pieList.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import { useStateStore } from "@/pages/state/use-state-store";
import { trafficAnalysis } from "@/utils/requestData/accessControl";

const { globalState } = useStateStore();
let throughType = ref();
const throughNum = ref(0);
const roundPieData = reactive({
  arr: [],
});
let timer = ref<any>(null);

watch(
  () => globalState.business.currentAreaId,
  () => {
    clearInterval(timer.value);
    timer.value = setInterval(
      () => {
        init();
      },
      (window as any).config.pageLoopRequestTime,
    );
    init();
  },
);

// 通行分析
const trafficAnalysisInfo = async () => {
  let res = await trafficAnalysis(throughType.value.timeType);
  throughNum.value = res.total;
  roundPieData.arr = res.arr;
};

const init = () => {
  trafficAnalysisInfo();
};

onMounted(() => {
  init();
  timer.value = setInterval(
    () => {
      init();
    },
    (window as any).config.pageLoopRequestTime,
  );
});

onBeforeUnmount(() => {
  clearInterval(timer.value);
});
</script>

<style lang="less" scoped>
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;

  .content {
    font-size: 16px;
    color: #fff;
    text-align: center;
  }

  .pie-center {
    font-size: 18px;
    font-weight: bold;
  }
}
</style>
