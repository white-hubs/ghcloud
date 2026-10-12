<template>
  <SubPanelTemplate title="门禁事件Top10">
    <template #extra>
      <DateInlineForm v-model:modelValue="handleTime" @search="getPassengerFlowRegions"></DateInlineForm>
    </template>
    <div class="body" v-show="areaAlarmRank.length" style="min-height: 250px">
      <EventAlarmItem :sn="false" v-for="(item, index) in areaAlarmRank" :sort="index + 1" :name="item.name" :count="item.value" />
    </div>
    <div class="body" v-show="!areaAlarmRank.length" style="min-height: 250px">
      <noData></noData>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { eventNameStat } from "@/api/door";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import EventAlarmItem from "@/components/businessPanel/public/eventAlarmItem.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";

const handleTime = ref<ModelValueItf>();
const areaAlarmRank = ref([]);

const getPassengerFlowRegions = async () => {
  const res = await eventNameStat({ period: handleTime.value.dateRange.join(",") });
  areaAlarmRank.value = res;
};
</script>

<style lang="less" scoped></style>
