<template>
  <SubPanelTemplate title="时控实时数据">
    <OperateDays style="margin: 10px 0" :value="controlledNum" title="时控计划"> </OperateDays>
    <div class="equipmentAlarm">
      <planPie :pieData="controlledDataList.arr">
        <div class="content">
          <img :src="getAssetsImage('timeControl.png')" />
        </div>
      </planPie>
      <pieList :roundPieData="controlledDataList.arr"></pieList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch } from "vue";

import planPie from "../../public/charts/pie/planePie.vue";
import OperateDays from "../../public/operateDays.vue";
import pieList from "../../public/pieList.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { useStateStore } from "@/pages/state/use-state-store";
import { getAssetsImage } from "@/utils/getImage";
import { timeControlled } from "@/utils/requestData/lighting";

const { globalState } = useStateStore();
const controlledDataList = reactive({
  arr: [],
});
const controlledNum = ref(0);
let timer: any = reactive(null);

watch(
  () => globalState.business.currentAreaId,
  () => {
    clearInterval(timer);
    timer = setInterval(
      () => {
        init();
      },
      (window as any).config.pageLoopRequestTime,
    );
    init();
  },
);

// 时控实时数据
const controlledData = async () => {
  let res = await timeControlled();
  controlledDataList.arr = res.arr;
  controlledNum.value = res.total;
};

const init = () => {
  controlledData();
};

onMounted(() => {
  init();
  timer = setInterval(
    () => {
      init();
    },
    (window as any).config.pageLoopRequestTime,
  );
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
  margin: 20px 0;

  .content {
    font-size: 16px;
  }
}
</style>
