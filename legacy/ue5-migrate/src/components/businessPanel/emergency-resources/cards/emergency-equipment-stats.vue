<template>
  <SubPanelTemplate title="应急设备统计">
    <div class="equipmentAlarm">
      <PlanPie :pieData="roundPieData">
        <div class="content">
          <div class="total-num">{{ deviceTotal }}</div>
          <div>设备总数</div>
        </div>
      </PlanPie>
      <pieList :roundPieData="roundPieData"></pieList>
    </div>
    <div class="footer">
      <RollTable :column="column" :data="listData"> </RollTable>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import { emergencyDevicePage, emergencyDeviceStat } from "@/api/emergency";
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import pieList from "@/components/businessPanel/public/pieList.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const roundPieData = ref([
  {
    value: 0,
    label: "已使用",
    color: "rgba(3, 182, 21, 1)",
  },
  {
    value: 0,
    label: "未使用",
    color: "rgba(245, 154, 35, 1)",
  },
]);
const deviceTotal = ref(0);
const column = reactive([
  {
    title: "设备名称",
    dataIndex: "name",
    width: 120,
  },
  {
    title: "已使用",
    dataIndex: "deviceUsedNum",
  },
  {
    title: "未使用",
    dataIndex: "notUsedValue",
  },
]);
const listData = ref([]);

const emergencyFacilityEvent = async () => {
  const res = await emergencyDeviceStat();
  const data = await emergencyDevicePage();
  roundPieData.value[0].value = res.usedValue;
  roundPieData.value[1].value = res.notUsedValue;
  deviceTotal.value = res.total;
  listData.value = data.records.map((item) => {
    return {
      ...item,
      notUsedValue: item.deviceNum - item.deviceUsedNum,
    };
  });
};

onMounted(() => {
  emergencyFacilityEvent();
});
</script>

<style lang="less" scoped>
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;

  .content {
    font-size: 16px;
    text-align: center;
    color: #fff;
  }
  .policeList {
    height: auto;
  }
}
</style>
