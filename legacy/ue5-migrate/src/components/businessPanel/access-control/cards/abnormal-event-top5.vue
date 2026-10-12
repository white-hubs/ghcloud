<template>
  <SubPanelTemplate title="异常事件top5" class="alarm-event">
    <template #extra>
      <DateInlineForm v-model:modelValue="event" @search="alarmEventTop"></DateInlineForm>
    </template>
    <div class="body" style="min-height: 250px">
      <EventAlarmItem v-for="(item, index) in unusual.arr" :sort="1" :name="item.name" :linkRatio="item.ringRatio" :count="item.value" />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch } from "vue";

import EventAlarmItem from "../../public/eventAlarmItem.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { useStateStore } from "@/pages/state/use-state-store";
import { alarmEvent } from "@/utils/requestData/accessControl";

const { globalState } = useStateStore();
const unusual = reactive({
  arr: [],
});
let timer: any = reactive(null);
let event = ref();

watch(
  () => globalState.business.currentAreaId,
  () => {
    clearInterval(timer);
    timer = setInterval(
      () => {
        init();
      },
      (window as any).config.pageLoopRequestTime,
    );
    init();
  },
);

// 报警事件top5
const alarmEventTop = async () => {
  unusual.arr = await alarmEvent(event.value.timeType);
};

const init = () => {
  alarmEventTop();
};

onMounted(() => {
  alarmEventTop();
  timer = setInterval(
    () => {
      init();
    },
    (window as any).config.pageLoopRequestTime,
  );
});

onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>

<style lang="less" scoped>
.ringRatio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin-left: 6px;
}
</style>
