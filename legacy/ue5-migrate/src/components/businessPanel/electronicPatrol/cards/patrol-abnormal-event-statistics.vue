<template>
  <SubPanelTemplate title="巡更异常事件统计">
    <template #extra>
      <div class="details" @click="showAbnormalModal = true">查看详情</div>
    </template>
    <div class="footer">
      <RollTable :column="column" :data="listData" :limitScrollNum="4"> </RollTable>
    </div>
  </SubPanelTemplate>
  <modal-table v-if="showAbnormalModal" :show="showAbnormalModal" title="异常事件列表" @close="showAbnormalModal = false">
    <abnormalEvents></abnormalEvents>
  </modal-table>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import RollTable from "../../public/rollTable/index.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import abnormalEvents from "../components/abnormal-events.vue";
import { alarmPage } from "@/api/maintain";
import modalTable from "@/components/modal-table/modal.vue";

const showAbnormalModal = ref(false);
const listData = ref([]);

const column = [
  {
    title: "报警地点",
    dataIndex: "alarmPoint",
    width: 120,
  },
  {
    title: "报警时间",
    dataIndex: "alarmTime",
  },
  {
    title: "处理结果",
    dataIndex: "alarmResult",
    width: 140,
  },
];

const getAlarmPage = async () => {
  const { records } = await alarmPage({ pageSize: 10, pageNumber: 1, keyword: "" });
  listData.value = records;
};

onMounted(() => {
  getAlarmPage();
});
</script>

<style lang="less" scoped>
.details {
  color: #74b2ff;
  font-size: 14px;
  cursor: pointer;
}
.footer {
  height: 200px;
}
</style>
