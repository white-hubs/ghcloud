<template>
  <GLayout ref="table_layout_ref" title="部门资产清单" showfooter class="asset-list">
    <template #header-btn>
      <Button @click="back">返回</Button>
    </template>
    <template #content-table>
      <Table
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        :scroll="tableScroll"
        size="small"
        bordered
        :loading="loading"
      />
    </template>
    <template #footer-page>
      <Pagination
        v-model:current="pagination.pageNumber"
        v-model:pageSize="pagination.pageSize"
        show-size-changer
        :total="pagination.total"
        :default-current="1"
        :show-total="(total: number) => `共 ${total} 条数据`"
        @change="pageChange"
      />
    </template>
  </GLayout>
</template>
<script lang="ts" setup>
import { Popover, type TableColumnType } from "ant-design-vue";
import dayjs from "dayjs";
import { h, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { useListQueryCache } from "@ghcloud/cube-utils";

import { getPropertyDetailedPage } from "@/api/asset-management/asset-management";
import GLayout from "@/components/common/g-layout.vue";
import { translateAmount } from "@/utils/tool";
import { assetStatus } from "@/views/enum";

const { id: depId } = useRoute().query as { id: string };

const loading = ref(false);
const dataSource = ref<unknown[]>([]);
const pagination = ref({
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});

const formState = reactive({});

const queryCache = useListQueryCache({
  defaults: { ...formState, pageNumber: 1, pageSize: 10 },
  getState: () => ({ ...formState, pageNumber: pagination.value.pageNumber, pageSize: pagination.value.pageSize }),
  setState: (next) => {
    const { pageNumber, pageSize, ...rest } = next;
    Object.assign(formState, rest);
    pagination.value.pageNumber = Number(pageNumber ?? 1);
    pagination.value.pageSize = Number(pageSize ?? 10);
  },
});

const getTableData = async () => {
  const params = {
    pageNumber: pagination.value.pageNumber,
    pageSize: pagination.value.pageSize,
    receiveDepId: depId,
  };
  loading.value = true;
  try {
    const res = await getPropertyDetailedPage(params);
    if (res.data) {
      const { records, total } = res.data;
      dataSource.value = records;
      pagination.value.total = total;
    }
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
};
const pageChange = (pageNumber: number, pageSize: number) => {
  pagination.value.pageNumber = pageNumber || 1;
  pagination.value.pageSize = pageSize;
  getTableData().then(() => queryCache.sync());
};
const columns: TableColumnType[] = [
  {
    title: "序号",
    width: 70,
    align: "center",
    customRender: ({ index }) => `${index + 1}`,
    fixed: "left",
  },
  {
    title: "资产编号",
    dataIndex: "serialNumber",
    fixed: "left",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "资产名称",
    dataIndex: "name",
    width: 120,
    ellipsis: true,
    fixed: "left",
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "资产类别",
    dataIndex: "typeName",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "规格型号",
    dataIndex: "norms",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "计量单位",
    dataIndex: "unit",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "金额",
    dataIndex: "priceTotal",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      text = translateAmount(text);
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "来源",
    dataIndex: "sourceName",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "购入日期",
    dataIndex: "purchaseDate",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      text = text ? dayjs(text).format("YYYY-MM-DD") : "--";
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "入库日期",
    dataIndex: "startTime",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      text = text ? dayjs(text).format("YYYY-MM-DD") : "--";
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "维保到期时间",
    dataIndex: "maintenanceDate",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      text = text ? dayjs(text).format("YYYY-MM-DD") : "--";
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "剩余维保时间(月)",
    dataIndex: "maintenanceTime",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) ?? "--" })];
    },
  },
  {
    title: "资产逾龄时间",
    dataIndex: "usageDate",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      text = text ? dayjs(text).format("YYYY-MM-DD") : "--";
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "剩余使用期限",
    dataIndex: "usageTime",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) ?? "--" })];
    },
  },
  {
    title: "资产状态",
    dataIndex: "status",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      const statusText = assetStatus.find((e) => e.value === text)?.label;
      return [h(Popover, { content: statusText }, { default: () => statusText })];
    },
  },
  {
    title: "管理员",
    dataIndex: "adminName",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "区域",
    dataIndex: "area",
    width: 120,
    ellipsis: true,
    customRender: ({ text }: { text: { name: string }[] }) => {
      const areaName = text.map((e) => e.name).join("/") || "--";
      return [h(Popover, { content: text }, { default: () => areaName || "--" })];
    },
  },
  {
    title: "使用部门",
    dataIndex: "receiveDepName",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "使用人",
    dataIndex: "receiveUserName",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "创建人",
    dataIndex: "createByName",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      text = text ? dayjs(text).format("YYYY-MM-DD") : "--";
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
];

const tableScroll = ref({ x: 1000, y: document.querySelector(".content-table")?.clientHeight ?? 435 });

onMounted(async () => {
  await queryCache.hydrateAndQuery(getTableData);
  tableScroll.value.y = document.querySelector(".content-table")!.clientHeight - 39;
});

const back = () => {
  window.history.back();
};
</script>
<style scoped lang="less">
.asset-list {
  :deep(.content-search) {
    padding-bottom: 0 !important;
  }
}
</style>
