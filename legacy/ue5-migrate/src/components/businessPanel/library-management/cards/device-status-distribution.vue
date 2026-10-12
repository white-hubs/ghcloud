<template>
  <SubPanelTemplate title="设备状态分布">
    <div class="flex-between">
      <PlanPie :pieData="roundPieData">
        <div class="content">
          <div class="total-num">{{ alarmTotal }}</div>
          <div style="font-size: 12px;">设备总数</div>
        </div>
      </PlanPie>
      <PieList :roundPieData="roundPieData"></PieList>
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import PieList from "@/components/businessPanel/public/pieList.vue";
import { onMounted, ref } from 'vue'
import useCommon from '@/components/hooks/useCommon'

const { getEquipmentNumber } = useCommon();
const alarmTotal = ref(0)
const deviceStatusType = {
  ALARM: "报警",
  TROUBLE: "故障",
  OFFLINE: "离线",
  NORMAL: "正常",
};
const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
const roundPieData = ref([]);
const deviceDataInfo = async () => {
  let res: any = await getEquipmentNumber();
  if (!res.deviceNum) {
    return;
  }
  roundPieData.value.length = 0;
  alarmTotal.value = 0;
  res.deviceStatusNums.forEach((item, index) => {
    alarmTotal.value += item.num;
    let obj = {
      label: deviceStatusType[item.name],
      color: colors[index],
      value: item.num,
    };
    roundPieData.value.push(obj);
  });
};
onMounted(()=>{
  deviceDataInfo()
})
</script>
<style lang="less" scoped>
.content {
  text-align: center;
  color: #fff;
  font-size: 14px;

  .total-num {
    font-size: 16px;
  }
}
</style>