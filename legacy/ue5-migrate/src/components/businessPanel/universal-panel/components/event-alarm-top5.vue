<template>
  <SubPanelTemplate :title="title">
    <template #extra>
      <DateInlineForm v-model:modelValue="eventInfo" @search="alarmEventTop"></DateInlineForm>
    </template>
    <div class="body" v-show="alarmTop.arr.length > 0" style="min-height: 250px">
      <EventAlarmItem v-for="(item, index) in alarmTop.arr" :key="item.id" :sort="index + 1" :name="item.name"
        :count="item.alarmNum" :ratio="item.ratio + '%'" />
    </div>
    <div class="body" v-show="alarmTop.arr.length <= 0" style="min-height: 150px">
      <noData></noData>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import DateInlineForm, { ModelValueItf } from "../../public/dateInlineForm.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import EventAlarmItem from "../../public/eventAlarmItem.vue";
import noData from "../../public/noData.vue";
import useCommon from '@/components/hooks/useCommon'
import { useStateStore } from '@/pages/state/use-state-store';

interface Props {
  title?: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: '报警事件top5',
});

const { globalState } = useStateStore()
const eventInfo = ref<ModelValueItf>({
  timeType: 'THIS_YEAR',
  dateRange: []
});
const {
  getEventTop
} = useCommon();

const alarmTop = reactive({ arr: [] });

// 报警事件Top5
const alarmEventTop = async () => {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: eventInfo.value.dateRange.join(","),
    type: eventInfo.value.timeType,
  };
  let res = await getEventTop(param);
  alarmTop.arr = res;
};
</script>

<style lang="less" scoped>
</style>
