<template>
  <SubPanelTemplate title="最新五方通话">
    <template #extra>
      <div class="dataTitle">
        <div class="dataTitle-right" style="color: #5ea6ff" @click="handleAll">查看更多>></div>
      </div>
    </template>
    <RollTable :column="columns" :data="tableData" :showLength="8"> </RollTable>
  </SubPanelTemplate>
  <liftModal :showModal="showModal" @close="showModal = false"></liftModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import liftModal from "../lift-modal.vue";
import { liftFiveCallLogPage } from "@/api/securitymanagement";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const showModal = ref(false);
const columns = ref([
  {
    title: "电梯编号",
    dataIndex: "liftNumber",
    width: 120,
  },
  {
    title: "处理内容",
    dataIndex: "callContent",
  },
  {
    title: "处理状态",
    dataIndex: "handlingSituation",
  },
]);
const tableData = ref([]);

const handleAll = () => {
  showModal.value = true;
};

// 获取五方通话数据
const getLiftFiveCallLogPage = async () => {
  const res = await liftFiveCallLogPage({
    pageNumber: 1,
    pageSize: 10,
  });
  tableData.value = res.records.map((e: any) => {
    return {
      liftNumber: e.liftNumber,
      callContent: e.handlingSituation ? e.callContent : "--",
      handlingSituation: e.handlingSituation ? "已处理" : "未处理",
    };
  });
};

onMounted(() => {
  getLiftFiveCallLogPage();
});
</script>

<style lang="less" scoped>
.dataTitle {
  color: #abb8cb;
  font-size: 14px;
  text-align: right;

  .dataTitle-right {
    cursor: pointer;
  }
}
</style>
