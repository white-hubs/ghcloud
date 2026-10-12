<template>
  <SubPanelTemplate title="示教情况总览">
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
import { ref } from "vue";

import { teachOverview } from "@/api/securitymanagement";
import RoundPie from "@/components/businessPanel/public/charts/roundPie/roundPie.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import pieList from "@/components/businessPanel/public/pieList.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";

const timeFrame = ref<ModelValueItf>({
  timeType: "TODAY",
  dateRange: [],
});
const roundPieData = ref([]);
const devicesNum = ref(0);

const getAlarmLevel = async () => {
  let param = {
    period: timeFrame.value.dateRange.join(","),
    type: timeFrame.value.timeType,
  };
  const res = await teachOverview(param);
  devicesNum.value = 0;
  roundPieData.value = res.map((item: any) => {
    devicesNum.value += item.num;
    return {
      label: item.name,
      value: item.num,
    };
  });
};
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
