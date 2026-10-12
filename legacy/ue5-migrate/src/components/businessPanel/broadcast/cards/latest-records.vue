<template>
  <SubPanelTemplate title="最新记录明细">
    <div class="footer">
      <RollTable :column="column" :data="listData" :showLength="5"> </RollTable>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { ref, onMounted } from "vue";

import { statisticsRecord } from "@/api/broadcast";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();
const column = [
  {
    title: "广播时间",
    dataIndex: "broadcastTime",
    width: 120,
  },
  {
    title: "内容",
    dataIndex: "broadcastPlayContent",
    width: 160,
  },
  {
    title: "操作人",
    dataIndex: "operatorByName",
  },
];
const listData = ref<any[]>([]);

const getPlaybackRecord = async () => {
  const params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
  };
  listData.value = await statisticsRecord(params);
  listData.value.forEach((item: any) => {
    item.broadcastTime = dayjs(item.broadcastTime).format("YYYY-MM-DD HH:mm:ss");
  });
};

onMounted(() => {
  getPlaybackRecord();
});
</script>

<style lang="less" scoped></style>
