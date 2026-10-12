<template>
  <SubPanelTemplate title="报警处理排名">
    <template #extra>
      <DateInlineForm v-model:modelValue="handleTime" @search="changeHandleTime"></DateInlineForm>
    </template>
    <div class="body" style="min-height: 250px" v-show="alarmRank.list.length > 0">
      <EventAlarmItem
        @click="handleClickItem(item)"
        v-for="(item, index) in alarmRank.list"
        :key="item.id"
        :sort="index + 1"
        :name="item.name"
        :linkRatio="item.chainRatio"
        :count="item.alarmNum"
        :ratio="item.ratio + '%'"
      />
    </div>
    <div class="body" style="min-height: 150px" v-show="alarmRank.list.length <= 0">
      <noData></noData>
    </div>
    <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="parameter"></modal-alarm-table>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import EventAlarmItem from "../../public/eventAlarmItem.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { ModelValueItf } from "../../public/types";
import { alarmHandleTop } from "@/api/alarm";
import { AlarmAreaTop } from "@/api/models/alarm";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();

interface AlarmHandlType {
  list: AlarmAreaTop[];
}

const alarmModalShow = ref<boolean>(false);
const parameter = reactive({
  userId: "",
});

let handleTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [],
});

const alarmRank = reactive<AlarmHandlType>({
  list: [],
});

async function changeHandleTime() {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: handleTime.value.dateRange.join(","),
    type: handleTime.value.timeType,
  };
  alarmRank.list = await alarmHandleTop(params);
}

const closeModal = () => {
  alarmModalShow.value = false;
};

const handleClickItem = (item: AlarmAreaTop) => {
  parameter.userId = item.id;
  alarmModalShow.value = true;
};
</script>

<style lang="less" scoped></style>
