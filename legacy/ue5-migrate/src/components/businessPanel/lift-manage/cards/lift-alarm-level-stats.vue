<template>
  <SubPanelTemplate title="报警等级统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="timeFrame" @search="getAlarmLevel"></DateInlineForm>
    </template>
    <div class="equipmentAlarm">
      <RoundPie :data="roundPieData" :eventNum="devicesNum">
        <div class="content">
          <span>{{ devicesNum }}</span> <br />报警总数
        </div>
      </RoundPie>
      <pieList :roundPieData="roundPieData"></pieList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import { statisticsLevel } from "@/api/alarm";
import RoundPie from "@/components/businessPanel/public/charts/roundPie/roundPie.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import pieList from "@/components/businessPanel/public/pieList.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();
const colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
const roundPieData = ref<any[]>([]);
const devicesNum = ref(0);
const timeFrame = ref<ModelValueItf>({
  timeType: "TODAY",
  dateRange: [],
});

// 获取报警级别分布数据
async function getAlarmLevel() {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: timeFrame.value.dateRange.join(","),
    type: timeFrame.value.timeType,
  };
  let res = await statisticsLevel(params);
  devicesNum.value = 0;
  roundPieData.value = res.map((item: any, index: number) => {
    devicesNum.value += item.alarmNum;
    return {
      label: (item.name += "报警"),
      color: colorList[index],
      value: item.alarmNum,
    };
  });
}

onMounted(() => {
  getAlarmLevel();
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
