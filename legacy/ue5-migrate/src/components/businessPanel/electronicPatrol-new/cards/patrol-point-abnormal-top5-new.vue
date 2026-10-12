<template>
  <SubPanelTemplate title="巡更点异常Top5">
    <template #extra>
      <DateInlineForm v-model:modelValue="alarmTimeTypeS" @search="changeDates"></DateInlineForm>
    </template>
    <div class="body" style="min-height: 1.04166rem">
      <EventAlarmItem
        v-for="(item, index) in areaAlarmRank"
        :sort="index + 1"
        :name="item.name"
        :count="item.num"
        :ratio="item.ratio + '%'"
      />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import EventAlarmItem from "../../public/eventAlarmItem.vue";
import { TaskAbnormalTop } from "@/api/maintain";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const areaAlarmRank = ref([]);
const alarmTimeTypeS = ref({
  timeType: "THIS_YEAR",
  dateRange: [],
});

const changeDates = () => {
  abnormalTop();
};

const abnormalTop = async () => {
  const data = await TaskAbnormalTop({
    period: alarmTimeTypeS.value.dateRange.join(","),
    type: alarmTimeTypeS.value.timeType,
  });
  areaAlarmRank.value = data.map((item) => {
    return {
      name: item.locationName,
      num: item.num,
      ratio: item.chainRatio,
    };
  });
};

onMounted(() => {
  abnormalTop();
});
</script>

<style lang="less" scoped></style>
