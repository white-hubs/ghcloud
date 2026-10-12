<template>
  <SubPanelTemplate title="群控组实时数据">
    <div class="groupControlBox">
      <GroupControl v-for="item in groupControlList" :key="item.img" :groupControlData="item"></GroupControl>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { reactive, onMounted, onBeforeUnmount, watch } from "vue";

import GroupControl from "../../public/groupControl.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { useStateStore } from "@/pages/state/use-state-store";
import { getGroupControlData } from "@/utils/requestData/lighting";

const { globalState } = useStateStore();
const groupControlList = reactive([
  {
    img: "crowd.png",
    value: 0,
    label: "群控组总数",
  },
  {
    img: "control.png",
    value: 0,
    label: "控制回路数",
  },
  {
    img: "open.png",
    value: 0,
    label: "开启回路数",
  },
  {
    img: "close.png",
    value: 0,
    label: "关闭回路数",
  },
]);
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

// 群控组实时数据
const getGroupControlInfo = async () => {
  let res = await getGroupControlData();
  groupControlList[0].value = res.groupTotal;
  groupControlList[1].value = res.deviceTotal;
  groupControlList[2].value = res.openTotal;
  groupControlList[3].value = res.closeTotal;
};

const init = () => {
  getGroupControlInfo();
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
.groupControlBox {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-around;
  margin: 20px 0;
}
</style>
