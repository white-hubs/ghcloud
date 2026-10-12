<template>
  <SubPanelTemplate title="巡更点位排行榜Top10">
    <template #extra>
      <DateInlineForm v-model:modelValue="intercomTime" @search="getIntercomEvent"></DateInlineForm>
    </template>
    <div class="body" v-show="intercomRank.length" style="min-height: 250px">
      <EventAlarmItem :sn="false" v-for="(item, index) in intercomRank" :sort="index + 1" :name="item.key" :count="item.value" />
    </div>
    <div class="body" v-show="!intercomRank.length" style="min-height: 250px">
      <noData></noData>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { ModelValueItf } from "../../public/types";
import { patrolLocationTop } from "@/api/door";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import EventAlarmItem from "@/components/businessPanel/public/eventAlarmItem.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const intercomTime = ref<ModelValueItf>();
const intercomRank = ref([]);

const getIntercomEvent = async () => {
  intercomRank.value = await patrolLocationTop({ period: intercomTime.value.dateRange.join(",") });
};
</script>

<style lang="less" scoped>
.body {
  max-height: 300px;
  overflow: auto;
}
</style>
