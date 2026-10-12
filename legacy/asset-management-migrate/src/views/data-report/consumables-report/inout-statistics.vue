<template>
  <GLayout ref="table_layout_ref" :title="pageTitle" showfooter>
    <template #header-btn>
      <Button type="primary" @click="handleExport" :loading="exportLoading">导出</Button>
    </template>
    <template #content-search>
      <Form layout="inline" :model="formState">
        <FormItem label="处理时间">
          <DatePicker v-model:value="formState.period" value-format="YYYY-MM-DD" placeholder="请选择" />
        </FormItem>
        <FormItem label="耗材类别">
          <TreeSelect v-model:value="formState.categoryId" :tree-data="treeData" placeholder="请选择" style="width: 180px" />
        </FormItem>
        <FormItem>
          <Input v-model:value="formState.keyword" placeholder="耗材编码、耗材名称" />
        </FormItem>
        <FormItem>
          <Button type="primary" @click="queryForm">查询</Button>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="reset"> 重置 </Button>
        </FormItem>
      </Form>
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
        :row-selection="rowSelection"
        row-key="id"
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
import { Image, Popover, Table, type TableColumnsType, type TableProps, type TreeProps, type TreeSelectProps } from "ant-design-vue";
import type { DefaultOptionType } from "ant-design-vue/es/vc-tree-select/TreeSelect";
import dayjs from "dayjs";
import { h, onMounted, reactive, ref } from "vue";

import { useListQueryCache, usePageName } from "@ghcloud/cube-utils";

import {
  getConsumableStockDetailPage,
  getConsumableCategoryTree,
  type OSSFile,
  exportInoutStatistics,
} from "@/api/asset-management/asset-management";
import GLayout from "@/components/common/g-layout.vue";
import { translateAmount } from "@/utils/tool";
interface FormState {
  categoryId: string | undefined;
  period: string;
  keyword: string;
}
const { pageTitle } = usePageName();
const formState = reactive<FormState>({
  categoryId: undefined,
  period: "",
  keyword: "",
});
const applicationCode = __ENV__.applicationCode;
const exportLoading = ref(false);
const handleExport = async () => {
  exportLoading.value = true;
  try {
    const params = {
      ...formState,
    };
    const res = await exportInoutStatistics(params);
    // 下载文件
    const link = document.createElement("a");
    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    link.style.display = "none";
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "固定资产入库清单.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
  } finally {
    setTimeout(() => {
      exportLoading.value = false;
    }, 1000);
  }
};

const columns = ref<TableColumnsType>([
  {
    title: "序号",
    width: 70,
    align: "center",
    customRender: ({ index }) => `${index + 1}`,
  },
  {
    title: "照片",
    dataIndex: "files",
    ellipsis: true,
    align: "center",
    width: 90,
    customRender: ({ text }) => {
      const file: OSSFile[] = text || [];
      if (file.length === 0) {
        return "暂无图片";
      }
      return h(Image, { src: file[0].path, style: { maxHeight: "50px", maxWidth: "50px" } });
    },
  },
  {
    title: "耗材名称",
    dataIndex: "name",
    ellipsis: true,
    width: 90,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "耗材编码",
    dataIndex: "code",
    width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "分类名称",
    width: 90,
    dataIndex: "categoryName",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "仓库",
    dataIndex: "storeName",
    width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "品牌",
    dataIndex: "brand",
    width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "单位",
    dataIndex: "unit",
    width: 90,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "处理时间",
    dataIndex: "handleDate",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      const time = text ? dayjs(text).format("YYYY-MM-DD") : "--";
      return [h(Popover, { content: time }, { default: () => time })];
    },
  },
  {
    title: "处理人",
    dataIndex: "createBy",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "初始",
    dataIndex: "init",
    children: [
      {
        title: "数量",
        dataIndex: "initNum",
        align: "center",
        ellipsis: true,
        width: 80,
        customRender: ({ text }) => {
          return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
        },
      },
      {
        title: "单价",
        dataIndex: "initPrice",
        align: "center",
        width: 80,
        ellipsis: true,
        customRender: ({ text }) => {
          const amout = translateAmount(text);
          return [h(Popover, { content: amout }, { default: () => amout })];
        },
      },
      {
        title: "金额",
        dataIndex: "initAmount",
        align: "center",
        width: 80,
        ellipsis: true,
        customRender: ({ text }) => {
          const amout = translateAmount(text);
          return [h(Popover, { content: amout }, { default: () => amout })];
        },
      },
    ],
  },
  {
    title: "入库",
    dataIndex: "in",
    children: [
      {
        title: "数量",
        dataIndex: "num",
        align: "center",
        width: 80,
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: { stockFlag: string } }) => {
          text = record.stockFlag === "入库" ? text : "--";
          return [h(Popover, { content: text }, { default: () => text || "--" })];
        },
      },
      {
        title: "单价",
        dataIndex: "price",
        width: 80,
        align: "center",
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: { stockFlag: string } }) => {
          text = record.stockFlag === "入库" ? translateAmount(text) : "--";
          return [h(Popover, { content: text }, { default: () => text })];
        },
      },
      {
        title: "金额",
        dataIndex: "storeAmount",
        align: "center",
        width: 80,
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: { stockFlag: string } }) => {
          text = record.stockFlag === "入库" ? translateAmount(text) : "--";
          return [h(Popover, { content: text }, { default: () => text })];
        },
      },
    ],
  },
  {
    title: "出库",
    dataIndex: "out",
    children: [
      {
        title: "数量",
        dataIndex: "num",
        align: "center",
        width: 80,
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: { stockFlag: string } }) => {
          text = record.stockFlag === "出库" ? text : "--";
          return [h(Popover, { content: text }, { default: () => text || "--" })];
        },
      },
      {
        title: "单价",
        dataIndex: "price",
        align: "center",
        width: 80,
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: { stockFlag: string } }) => {
          text = record.stockFlag === "出库" ? translateAmount(text) : "--";
          return [h(Popover, { content: text }, { default: () => text })];
        },
      },
      {
        title: "金额",
        dataIndex: "storeAmount",
        align: "center",
        width: 80,
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: { stockFlag: string } }) => {
          text = record.stockFlag === "出库" ? translateAmount(text) : "--";
          return [h(Popover, { content: text }, { default: () => text })];
        },
      },
    ],
  },
  {
    title: "结存",
    dataIndex: "balance",
    children: [
      {
        title: "数量",
        dataIndex: "endNum",
        key: "endNum",
        align: "center",
        width: 80,
        ellipsis: true,
        customRender: ({ text }) => {
          return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
        },
      },
      {
        title: "单价",
        dataIndex: "endPrice",
        key: "endPrice",
        align: "center",
        width: 80,
        ellipsis: true,
        customRender: ({ text }) => {
          const amout = translateAmount(text);
          return [h(Popover, { content: amout }, { default: () => amout })];
        },
      },
      {
        title: "金额",
        width: 80,
        dataIndex: "endAmount",
        key: "endAmount",
        align: "center",
        ellipsis: true,
        customRender: ({ text }) => {
          const amout = translateAmount(text);
          return [h(Popover, { content: amout }, { default: () => amout })];
        },
      },
    ],
  },
]);

const selectedRowKeysState = ref<Key[]>([]);
type Key = string | number;
const rowSelection: TableProps["rowSelection"] = {
  onChange: (selectedRowKeys: Key[]) => {
    selectedRowKeysState.value = selectedRowKeys;
  },
};

const treeData = ref<DefaultOptionType[]>([]);

const loading = ref(false);
const dataSource = ref<unknown[]>([]);
const pagination = ref({
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});

const queryCache = useListQueryCache({
  defaults: {
    ...formState,
    pageNumber: 1,
    pageSize: 10,
  },
  getState: () => ({
    ...formState,
    pageNumber: pagination.value.pageNumber,
    pageSize: pagination.value.pageSize,
  }),
  setState: (next) => {
    const { pageNumber, pageSize, ...rest } = next as Record<string, unknown>;
    Object.assign(formState, rest);
    pagination.value.pageNumber = Number(pageNumber ?? 1);
    pagination.value.pageSize = Number(pageSize ?? 10);
  },
});

const getTableData = async () => {
  const params = {
    pageNumber: pagination.value.pageNumber,
    pageSize: pagination.value.pageSize,
    ...formState,
  };
  loading.value = true;
  try {
    const res = await getConsumableStockDetailPage(params);
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
const queryForm = async () => {
  pagination.value.pageNumber = 1;
  await getTableData();
  await queryCache.sync();
};
const reset = async () => {
  await queryCache.reset();
  await getTableData();
};

const tableScroll = ref({ x: 1000, y: document.querySelector(".content-table")?.clientHeight ?? 435 });

onMounted(async () => {
  // 耗材分类
  getConsumableCategoryTree({}).then((res) => {
    const getTreeSelectoptions = (tree: TreeProps["treeData"] = []): TreeSelectProps["treeData"] => {
      return tree.map((e) => {
        return {
          title: e.name,
          value: e.id,
          children: e.children?.length ? getTreeSelectoptions(e.children)! : [],
        };
      });
    };
    if (res.data) {
      treeData.value = getTreeSelectoptions(res.data as TreeProps["treeData"]) as DefaultOptionType[];
    }
  });

  await queryCache.hydrateAndQuery(getTableData);
  tableScroll.value.y = document.querySelector(".content-table")!.clientHeight - 78;
});
</script>
<style scoped>
.editable-cell-text-wrapper {
  cursor: pointer;
}
</style>
