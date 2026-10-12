<template>
  <SubPanelTemplate title="巡更人员点位排行Top10">
    <template #extra>
      <DateInlineForm v-model:modelValue="intercomTime" @search="getIntercomEvent"></DateInlineForm>
    </template>
    <div class="body" v-show="intercomRank.length" style="min-height: 250px">
      <EventAlarmItem :sn="false" v-for="(item, index) in intercomRank" :sort="index + 1" :name="item.key"
        :count="item.value" />
    </div>
    <div class="body" v-show="!intercomRank.length" style="min-height: 250px">
      <noData></noData>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import EventAlarmItem from "@/components/businessPanel/public/eventAlarmItem.vue";
import {  personLocationTop } from '@/api/door';
import { ModelValueItf } from '../../public/types'

const intercomTime = ref<ModelValueItf>()
const intercomRank = ref([]);
const getIntercomEvent = async () => {
  intercomRank.value = await personLocationTop({period:intercomTime.value.dateRange.join(",")})
}
</script>
<style lang="less" scoped></style>