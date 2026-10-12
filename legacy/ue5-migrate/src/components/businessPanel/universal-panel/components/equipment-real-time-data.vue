<template>
  <SubPanelTemplate title="设备实时数据">
    <div class="equipmentAlarm">
      <RoundPie :data="roundPieData" :eventNum="devicesNum">
        <div class="content">
          <span>{{ devicesNum }}</span> <br />设备总数
        </div>
      </RoundPie>
      <pieList @handelClickItemize="handelClickItemize" :roundPieData="roundPieData"></pieList>
    </div>
  </SubPanelTemplate>
  <modal-equipmentAll-table
    :show-modal="deviceAllModalShow"
    @close="deviceAllModalShow = false"
    :parameter="deviceAllParameter"
  ></modal-equipmentAll-table>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch } from "vue";

import RoundPie from "@/components/businessPanel/public/charts/roundPie/roundPie.vue";
import pieList from "@/components/businessPanel/public/pieList.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import useCommon from "@/components/hooks/useCommon";
import modalEquipmentAllTable from "@/components/modal-table/modal-equipmentAll-table.vue";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();
let timer: any = ref(null);
let deviceStatusType = {
  ALARM: "报警",
  TROUBLE: "故障",
  OFFLINE: "离线",
  NORMAL: "正常",
};

const deviceAllModalShow = ref<boolean>(false);
const deviceAllParameter = reactive({
  areaId: globalState.business.currentAreaId,
  tagCodes: [`custom.app::visual.${globalState.business.currentMenu}`],
  filterAreaIds: [],
  deviceState: undefined,
  dateRange: [],
});

let colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
const roundPieData = reactive([
  { label: "报警", color: "#19F8F7", value: 0 },
  { label: "故障", color: "#FFC700", value: 0 },
  { label: "离线", color: "#EF424A", value: 0 },
]);
const devicesNum = ref(0);

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

const handelClickItemize = (item: { name: string; label: string; value: number }) => {
  const statusType = item.label || item.name;
  Object.assign(deviceAllParameter, {
    deviceState: statusType === "离线" ? false : statusType === "正常" ? true : undefined,
  });
  deviceAllModalShow.value = true;
};

const { getEquipmentNumber } = useCommon();

// 设备实时数据
const deviceDataInfo = async () => {
  let res: any = await getEquipmentNumber();
  if (!res.deviceNum) {
    return;
  }
  roundPieData.length = 0;
  devicesNum.value = 0;
  res.deviceStatusNums.forEach((item, index) => {
    devicesNum.value += item.num;
    let obj = {
      label: deviceStatusType[item.name],
      color: colorList[index],
      value: item.num,
    };
    roundPieData.push(obj);
  });
};

const init = () => {
  deviceDataInfo();
};

onMounted(() => {
  deviceDataInfo();
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
    font-size: 12px;
  }

  :deep(.pie-box) {
    width: 200px;
  }
}
</style>
