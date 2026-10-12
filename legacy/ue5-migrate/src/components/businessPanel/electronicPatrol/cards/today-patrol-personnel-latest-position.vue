<template>
  <SubPanelTemplate title="今日巡更人员最新位置">
    <div style="height: 200px">
      <RollTable :column="columns" :data="personnelLocationData"> </RollTable>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import moment from "moment";
import { ref, onMounted } from "vue";

import { patrolPersonLocationNew } from "@/api/door";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const columns = [
  {
    title: "时间",
    dataIndex: "datetime",
  },
  {
    title: "人员",
    dataIndex: "personName",
  },
  {
    title: "点位",
    dataIndex: "location",
  },
];

const personnelLocationData = ref([]);

const getPatrolPersonLocationNew = async () => {
  const res = await patrolPersonLocationNew({ type: "TODAY" });
  personnelLocationData.value = res.map((e) => {
    return {
      ...e,
      datetime: moment(e.datetime).format("YYYY-MM-DD 00:00:00"),
    };
  });
};

onMounted(() => {
  getPatrolPersonLocationNew();
});
</script>

<style lang="less" scoped></style>
