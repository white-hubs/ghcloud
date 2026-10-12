<template>
  <SubPanelTemplate title="电梯状态监测">
    <div class="equipmentAlarm">
      <RoundPie :data="roundPieData" :eventNum="devicesNum">
        <div class="content">
          <span>{{ devicesNum }}</span> <br />设备总数
        </div>
      </RoundPie>
      <pieList :roundPieData="roundPieData"></pieList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import RoundPie from "@/components/businessPanel/public/charts/roundPie/roundPie.vue";
import pieList from "@/components/businessPanel/public/pieList.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import useCommon from "@/components/hooks/useCommon";

const deviceStatusType: Record<string, string> = {
  ALARM: "报警",
  TROUBLE: "故障",
  OFFLINE: "离线",
  NORMAL: "正常",
};
const colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
const roundPieData = reactive<any[]>([
  { label: "报警", color: "#19F8F7", value: 0 },
  { label: "故障", color: "#FFC700", value: 0 },
  { label: "离线", color: "#EF424A", value: 0 },
]);
const devicesNum = ref(0);

const { getEquipmentNumber } = useCommon();
// 设备实时数据
const deviceDataInfo = async () => {
  let res: any = await getEquipmentNumber();
  if (!res.deviceNum) {
    return;
  }
  roundPieData.length = 0;
  devicesNum.value = 0;
  res.deviceStatusNums.forEach((item: any, index: number) => {
    devicesNum.value += item.num;
    let obj = {
      label: deviceStatusType[item.name],
      color: colorList[index],
      value: item.num,
    };
    roundPieData.push(obj);
  });
};

onMounted(() => {
  deviceDataInfo();
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
