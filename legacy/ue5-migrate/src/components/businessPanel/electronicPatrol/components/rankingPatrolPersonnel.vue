<template>
      <SubPanelTemplate title="巡更点位排行榜Top10">
      <template #extra>
        <DateInlineForm v-model:modelValue="intercomTime" @search="getIntercomEvent"></DateInlineForm>
      </template>
      <div class="box-body" v-show="intercomRank.length">
        <EventAlarmItem :sn="false" v-for="(item, index) in intercomRank" :sort="index + 1" :name="item.key"
          :count="item.value" />
      </div>
      <div class="box-body" v-show="!intercomRank.length">
        <noData></noData>
      </div>
    </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import { patrolLocationTop } from '@/api/door'

const intercomRank = ref([]);
const intercomTime = ref()
  const getIntercomEvent = async () => {
  intercomRank.value = await patrolLocationTop({period:intercomTime.value.dateRange.join(",")})
}
</script>
<style lang="less" scoped>
.box-body{
  min-height: 250px;
}
</style>