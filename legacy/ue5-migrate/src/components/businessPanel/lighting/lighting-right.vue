<!-- 照明管理 -->
<template>
  <div >
    <SubPanelTemplate title="设备实时数据">
      <OperateDays style="margin: 10px 0" :value="devicesNum" title="设备总数">
      </OperateDays>
      <div class="equipmentAlarm">
        <RoundPie :data="roundPieData">
          <div class="content">
            <img :src="getAssetsImage('addLamp.png')" />
          </div>
        </RoundPie>
        <pieList :roundPieData="roundPieData"></pieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="群控组实时数据">
      <div class="groupControlBox">
        <GroupControl
          v-for="item in groupControlList"
          :key="item.img"
          :groupControlData="item"
        ></GroupControl>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="时控实时数据">
      <OperateDays style="margin: 10px 0" :value="controlledNum" title="时控计划">
      </OperateDays>
      <div class="equipmentAlarm">
        <planPie :pieData="controlledDataList.arr">
          <div class="content">
            <img :src="getAssetsImage('timeControl.png')" />
          </div>
        </planPie>
        <pieList :roundPieData="controlledDataList.arr"></pieList>
      </div>
    </SubPanelTemplate>
  </div>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "../../equipmentPanel/businessPanel/public/subPanelTemplate.vue";
import RoundPie from "../public/charts/roundPie/roundPie.vue";
import pieList from "../public/pieList.vue";
import OperateDays from "../public/operateDays.vue";
import GroupControl from "../public/groupControl.vue";
import { getAssetsImage } from "../../../utils/getImage";
import planPie from "../public/charts/pie/planePie.vue";
import { getGroupControlData, timeControlled } from "@/utils/requestData/lighting";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import useCommon from "../../hooks/useCommon";
import { useStateStore } from "@/pages/state/use-state-store";
const { globalState } = useStateStore()

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
let timer: any = reactive(null);
let deviceStatusType = {
  ALARM: "报警",
  TROUBLE: "故障",
  OFFLINE: "离线",
  NORMAL: "正常",
};
let colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
const roundPieData = reactive([
  { label: "报警", color: "#19F8F7", value: 0 },
  { label: "故障", color: "#FFC700", value: 0 },
  { label: "离线", color: "#EF424A", value: 0 },
]);
const controlledDataList = reactive({
  arr: [],
});
const controlledNum = ref(0);
const devicesNum = ref(0);
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
// 群控组实时数据
const getGroupControlInfo = async () => {
  let res = await getGroupControlData();
  groupControlList[0].value = res.groupTotal;
  groupControlList[1].value = res.deviceTotal;
  groupControlList[2].value = res.openTotal;
  groupControlList[3].value = res.closeTotal;
};
const controlledData = async () => {
  let res = await timeControlled();
  controlledDataList.arr = res.arr;
  controlledNum.value = res.total;
};
const init = () => {
  deviceDataInfo();
  getGroupControlInfo();
  controlledData();
};
onMounted(() => {
  init();
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
  margin: 20px 0;
  .content {
    font-size: 16px;
  }
}

.groupControlBox {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-around;
  margin: 20px 0;
}
:deep(.policeList){
  height: auto;
}
</style>
