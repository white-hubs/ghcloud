<template>
  <g-layout :title="`${title}详情`">
    <template #content-table>
      <a-table
        :dataSource="tableSource"
        :loading="isLoading"
        :columns="tableColumns"
        :scroll="{ y: 800 }"
        :pagination="false"
        bordered
        size="middle"
      ></a-table>
    </template>
    <template #footer-btn>
      <a-button @click="back">返回</a-button>
    </template>
    <template #footer-page>
      <a-pagination
        show-size-changer
        v-if="page.total > 0"
        v-model:pageSize="page.pageSize"
        v-model:current="page.pageNumber"
        :total="page.total"
        @change="pageChange"
        :default-current="1"
        :show-total="(total: number) => `共 ${total} 条数据`"
      ></a-pagination>
    </template>
  </g-layout>
</template>

<script setup lang="ts">
import { getSealStatisticsInfo } from "@/api/statistics";
import gLayout from "@/components/common/gLayout.vue";
import { TableColumnsType } from "ant-design-vue";
import moment from "moment";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const { id, period, title } = route.query;
const tableColumns: TableColumnsType = [
  {
    title: "申请印章",
    dataIndex: "sealName",
    key: "sealName",
  },
  {
    title: "申请人",
    dataIndex: "applicantName",
    key: "applicantName",
  },
  {
    title: "最近申请时间",
    dataIndex: "applyTime",
    key: "applyTime",
    customRender: ({ text }) => {
      return moment(text).format("YYYY-MM-DD");
    },
  },
  {
    title: "审批时间",
    dataIndex: "applyDoneTime",
    key: "applyDoneTime",
    customRender: ({ text }) => {
      return moment(text).format("YYYY-MM-DD");
    },
  },
];
const tableSource = ref([]);
const isLoading = ref(false);
const page = ref({
  pageNumber: 1,
  pageSize: 10,
  total: 0,
});
const pageChange = (pageNumber: number, pageSize: number) => {
  page.value.pageNumber = pageNumber;
  page.value.pageSize = pageSize;
  getSealStatisticsInfos();
};
const back = () => {
  history.back();
  // router.push('/useSealStatistics')
};
const getSealStatisticsInfos = async () => {
  try {
    isLoading.value = true;
    const result = await getSealStatisticsInfo(id as string, {
      period: period as string,
      pageNumber: page.value.pageNumber,
      pageSize: page.value.pageSize,
    });
    tableSource.value = result.data.records;
    page.value.total = result.data.total;
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
};
onMounted(() => {
  getSealStatisticsInfos();
});
</script>

<style lang="less" scoped></style>
