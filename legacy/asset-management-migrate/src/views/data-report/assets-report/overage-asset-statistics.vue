<template>
  <GLayout ref="table_layout_ref" :title="pageTitle" showfooter>
    <template #header-btn>
      <Button type="primary" @click="handleExport" :loading="exportLoading">导出</Button>
    </template>
    <template #content-search>
      <Form layout="inline" :model="formState">
        <FormItem label="资产状态">
          <Select v-model:value="formState.status" placeholder="请选择" style="width: 180px">
            <SelectOption v-for="item in assetStatus" :key="item.value" :value="item.value">{{ item.label }}</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="资产类别">
          <Select v-model:value="formState.typeId" placeholder="请选择" style="width: 180px">
            <SelectOption v-for="item in assetTypeOptions" :key="item.id" :value="item.id">{{ item.name }}</SelectOption>
          </Select>
        </FormItem>
        <FormItem>
          <Input v-model:value="formState.keyword" placeholder="资产编码、资产名称" />
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
      <div style="margin-bottom: 20px; font-weight: bolder">
        <span style="margin-right: 50px">逾龄资产总数：{{ assetTotalNum || "--" }}</span>
        <span>总金额：{{ assetTotalMoneyText }}</span>
      </div>
      <AliasTable
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        :scroll="tableScroll"
        size="small"
        bordered
        :loading="loading"
        :row-selection="rowSelection"
        row-key="id"
        :applicationCode="applicationCode"
        tableCode="OVERAGE_ASSET_STATISTICS"
        :scrollX="tableScroll.x"
        :scrollY="tableScroll.y"
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
import { Popover, type TableColumnType, type TableProps } from "ant-design-vue";
import dayjs from "dayjs";
import { computed, h, onMounted, reactive, ref } from "vue";

import { useListQueryCache, usePageName } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import {
  getOveragePage,
  getAssemblyClassifyPage,
  type OSSFile,
  getOverageAmount,
  exportMaturityAssets,
} from "@/api/asset-management/asset-management";
import GLayout from "@/components/common/g-layout.vue";
import { translateAmount } from "@/utils/tool";
import { assetStatus } from "@/views/enum";
interface FormState {
  status: string | undefined;
  typeId: string | undefined;
  keyword: string;
}
const { pageTitle } = usePageName();
const formState = reactive<FormState>({ status: undefined, typeId: undefined, keyword: "" });
const assetTypeOptions = ref<{ id: string; name: string }[]>([]);
const assetTotalNum = ref(0);
const assetTotalMoney = ref(0);
const assetTotalMoneyText = computed(() => translateAmount(assetTotalMoney.value));
const applicationCode = __ENV__.applicationCode;
const loading = ref(false);
const dataSource = ref<unknown[]>([]);
const pagination = ref({
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});
const queryCache = useListQueryCache({
  defaults: {
    status: undefined,
    typeId: undefined,
    keyword: "",
    pageNumber: 1,
    pageSize: 10,
  },
  getState: () => ({
    ...formState,
    pageNumber: pagination.value.pageNumber,
    pageSize: pagination.value.pageSize,
  }),
  setState: (next) => {
    const { pageNumber, pageSize, ...rest } = next;
    Object.assign(formState, rest);
    pagination.value.pageNumber = Number(pageNumber ?? 1);
    pagination.value.pageSize = Number(pageSize ?? 10);
  },
});
const exportLoading = ref(false);
const handleExport = async () => {
  exportLoading.value = true;
  try {
    const params = {
      ...formState,
      queryType: "usage",
    };
    const res = await exportMaturityAssets(params);
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
const getTableData = async () => {
  const params = {
    pageNumber: pagination.value.pageNumber,
    pageSize: pagination.value.pageSize,
    queryType: "usage" as "maintenance" | "usage",
    ...formState,
  };
  loading.value = true;
  try {
    // 资产金额 数量
    getOverageAmount({ queryType: "usage", ...formState }).then((res) => {
      if (res.data) {
        assetTotalMoney.value = res.data.totalPrice ?? 0;
        assetTotalNum.value = res.data.totalNumber ?? 0;
      }
    });
    const res = await getOveragePage(params);
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
  },
  {
    title: "逾龄时间",
    dataIndex: "usageDate",
    width: 140,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "资产名称",
    dataIndex: "name",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "照片",
    dataIndex: "file",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: OSSFile[] }) => {
      const file: OSSFile[] = text || [];
      if (file.length === 0) {
        return "暂无图片";
      }
      return h("img", { src: file[0].path, style: { maxHeight: "22px", maxWidth: "22px" } });
    },
  },
  {
    title: "资产编码",
    dataIndex: "serialNumber",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "资产类型",
    dataIndex: "typeName",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "状态",
    dataIndex: "status",
    ellipsis: true,
    customRender: ({ text }) => {
      const status = assetStatus.find((e) => e.value === text)?.label || "--";
      return [h(Popover, { content: status }, { default: () => status })];
    },
  },
  {
    title: "规格型号",
    dataIndex: "norms",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "计量单位",
    dataIndex: "unit",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "金额",
    dataIndex: "price",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "使用人",
    dataIndex: "receiveUserName",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "使用部门",
    dataIndex: "receiveDepName",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "购入日期",
    dataIndex: "purchaseDate",
    ellipsis: true,
    customRender: ({ text }) => {
      text = text ? dayjs(text).format("YYYY-MM-DD") : "--";
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "区域",
    dataIndex: "area",
    ellipsis: true,
    customRender: ({ text }: { text: { name: string }[] }) => {
      const areaName = text.map((e) => e.name).join("/") || "--";
      return [h(Popover, { content: areaName }, { default: () => areaName })];
    },
  },
  {
    title: "存放地点",
    dataIndex: "storageLocation",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "管理员",
    dataIndex: "adminName",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "来源",
    dataIndex: "sourceName",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
];

const selectedRowKeysState = ref<Key[]>([]);
type Key = string | number;
const rowSelection: TableProps["rowSelection"] = {
  onChange: (selectedRowKeys: Key[]) => {
    selectedRowKeysState.value = selectedRowKeys;
  },
};

const queryForm = async () => {
  pagination.value.pageNumber = 1;
  await getTableData();
  await queryCache.sync();
};
const reset = async () => {
  formState.status = undefined;
  formState.typeId = undefined;
  formState.keyword = "";
  await queryCache.reset();
  await getTableData();
};

const tableScroll = ref({ x: 1000, y: document.querySelector(".content-table")?.clientHeight ?? 435 });

onMounted(async () => {
  // 资产分类
  getAssemblyClassifyPage({ pageNumber: 1, pageSize: 1000, type: "assetType" }).then((res) => {
    if (res.data) {
      assetTypeOptions.value = res.data.records as { id: string; name: string }[];
    }
  });

  await queryCache.hydrateAndQuery(getTableData);

  tableScroll.value.y = document.querySelector(".content-table")!.clientHeight - 39;
});
</script>
<style scoped>
.editable-cell-text-wrapper {
  cursor: pointer;
}
</style>
