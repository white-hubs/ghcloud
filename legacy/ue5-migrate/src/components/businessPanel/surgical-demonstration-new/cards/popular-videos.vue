<template>
  <SubPanelTemplate title="最受欢迎视频Top10" class="alarm-event">
    <template #extra>
      <DateInlineForm v-model:modelValue="handleTime" @search="areaAlarmStatistic"></DateInlineForm>
    </template>
    <div class="body" v-show="areaAlarmRank.length" style="min-height: 250px">
      <EventAlarmItem
        :sn="false"
        v-for="(item, index) in areaAlarmRank"
        :sort="index + 1"
        :name="item.name"
        :count="item.num"
        :key="index"
      />
    </div>
    <div class="body" v-show="!areaAlarmRank.length" style="min-height: 250px">
      <noData></noData>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { popularVideos } from "@/api/securitymanagement";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import EventAlarmItem from "@/components/businessPanel/public/eventAlarmItem.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";

const handleTime = ref<ModelValueItf>({
  timeType: "TODAY",
  dateRange: [],
});
const areaAlarmRank = ref<any[]>([]);

const areaAlarmStatistic = async () => {
  let param = {
    period: handleTime.value.dateRange.join(","),
    type: handleTime.value.timeType,
  };
  areaAlarmRank.value = await popularVideos(param);
};
</script>

<style lang="less" scoped></style>
