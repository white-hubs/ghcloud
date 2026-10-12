<template>
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
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch } from "vue";

import RoundPie from "../../public/charts/roundPie/roundPie.vue";
import pieList from "../../public/pieList.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { useStateStore } from "@/pages/state/use-state-store";
import { deviceStatus } from "@/utils/requestData/accessControl";

const { globalState } = useStateStore();
const roundPieData: any = reactive({
  arr: [],
});
let timer: any = reactive(null);
const eventNum = ref<number>(0);

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

// 设备实时状态
const deviceRealTimeStatus = async () => {
  let res: any = await deviceStatus();
  eventNum.value = res.total;
  roundPieData.arr = res.data;
};

const init = () => {
  deviceRealTimeStatus();
};

onMounted(() => {
  deviceRealTimeStatus();
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

  .content {
    font-size: 12px;
  }
}
</style>
