<template>
  <SubPanelTemplate title="设备离线率" class="alarm-event">
    <div class="equipmentInfo">
      <waterPolo title="" :value="faultRate" unit="%" bgColor="#FFC700" color="#FFC700"></waterPolo>
      <deviceModule :data-list="dataList"></deviceModule>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import waterPolo from "@/components/businessPanel/public/charts/waterPolo/waterPolo.vue";
import deviceModule from "@/components/businessPanel/public/deviceModule.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { AlarmRateList } from "@/components/businessPanel/public/types";
import useCommon from "@/components/hooks/useCommon";

const { getEquipmentNumber } = useCommon();
const dataList = reactive<AlarmRateList[]>([
  {
    title: "设备总数",
    value: 0,
    ringRatio: false,
  },
  {
    title: "离线总数",
    value: 0,
    ringRatio: true,
    label: 0,
    unit: "%",
  },
]);
const faultRate = ref<number>(0);

/**
 * 设备类型分布
 */
const equipmentStatistic = async () => {
  const res: any = await getEquipmentNumber();
  if (JSON.stringify(res) === "{}") {
    return;
  }
  res.deviceStatusNums.forEach((item: any) => {
    if (item.name === "OFFLINE" && res.deviceNum !== 0) {
      faultRate.value = Math.round((item.num / res.deviceNum) * 10000) / 100.0;
      dataList[0].value = res.deviceNum;
      dataList[1].value = item.num;
      dataList[1].label = faultRate.value;
    }
  });
};

onMounted(() => {
  equipmentStatistic();
});
</script>

<style lang="less" scoped>
.equipmentInfo {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px 0 20px;
  align-items: center;
  height: 200px;
}
</style>
