<template>
  <SubPanelTemplate title="广播记录排名">
    <template #extra>
      <DateInlineForm v-model:modelValue="alarmTime" @search="changeAlarmTime"></DateInlineForm>
    </template>
    <OperateDays title="播放数" :value="alarmCon.num" class="body-bum">
      <div class="extra flex-start">
        <div class="mode">环比</div>
        <div :class="['downtriangle', alarmCon.ratio > 0 && 'uptriangle']"></div>
        <div :class="[alarmCon.ratio < 0 ? 'down' : 'up']">{{ alarmCon.ratio }}%</div>
      </div>
    </OperateDays>
    <div class="title">广播记录类型排名top5</div>
    <div class="body" style="min-height: 250px" v-show="areaAlarmRank.length > 0">
      <EventAlarmItem
        v-for="(item, index) in areaAlarmRank"
        :sort="index + 1"
        :name="item.name"
        :count="item.num"
        :ratio="item.ratio + '%'"
        :key="index"
      />
    </div>
    <div class="body" style="min-height: 250px" v-show="areaAlarmRank.length <= 0">
      <noData></noData>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { playRecordTop, recordTotal } from "@/api/broadcast";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import EventAlarmItem from "@/components/businessPanel/public/eventAlarmItem.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import OperateDays from "@/components/businessPanel/public/operateDays.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();
const alarmTime = ref<ModelValueItf>({
  timeType: "TODAY",
  dateRange: [],
});
const alarmCon = ref({
  num: 0,
  ratio: 0,
});
const areaAlarmRank = ref<any[]>([]);

const changeAlarmTime = async () => {
  const params = {
    type: alarmTime.value.timeType,
    period: alarmTime.value.dateRange.join(","),
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
  };
  areaAlarmRank.value = await playRecordTop(params);
  alarmCon.value = await recordTotal(params);
};
</script>

<style lang="less" scoped>
.title {
  margin-top: 10px;
  color: #fff;
  font-size: 16px;
  font-family: sourceMedium;
}
.downtriangle {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #2ae8bd;
  margin: 0 5px;
}
.uptriangle {
  border-top: none;
  border-bottom: 6px solid #f14545;
}
.down {
  color: #2ae8bd;
}
.up {
  color: #f14545;
}
.extra {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #fff;
  .mode {
    margin-right: 5px;
  }
}
</style>
