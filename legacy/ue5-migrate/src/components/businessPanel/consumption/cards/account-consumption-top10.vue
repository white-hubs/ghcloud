<template>
  <SubPanelTemplate title="账户消费Top10">
    <template #extra>
      <DateInlineForm v-model:modelValue="intercomTime" @search="getIntercomEvent"></DateInlineForm>
    </template>
    <div class="body" v-show="intercomRank.length" style="min-height: 250px">
      <EventAlarmItem :sn="false" v-for="(item, index) in intercomRank" :sort="index + 1" :name="item.name" :count="item.value" />
    </div>
    <div class="body" v-show="!intercomRank.length" style="min-height: 250px">
      <noData></noData>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { transactionUserStat } from "@/api/onecard";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import EventAlarmItem from "@/components/businessPanel/public/eventAlarmItem.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";

const intercomTime = ref<ModelValueItf>();
const intercomRank = ref([]);

const getIntercomEvent = async () => {
  intercomRank.value = await transactionUserStat({ type: intercomTime.value.timeType, period: intercomTime.value.dateRange.join(",") });
};
</script>

<style lang="less" scoped></style>
