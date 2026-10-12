<template>
  <GLayout ref="table_layout_ref" :title="pageTitle" showfooter>
    <template #header-btn>
      <Button type="primary" @click="handleExport" :loading="exportLoading">导出</Button>
    </template>
    <template #content-search>
      <Form layout="inline" :model="formState">
        <FormItem>
          <Input v-model:value="formState.name" placeholder="部门名称" />
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
        <span style="margin-right: 50px">资产总数：{{ assetTotalNum ?? "--" }}</span>
        <span>总金额：{{ assetTotalMoneyText }}</span>
      </div>
      <AliasTable
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        :scroll="{ x: 1000, y: 550 }"
        size="small"
        bordered
        :loading="loading"
        :row-selection="rowSelection"
        row-key="id"
        :applicationCode="applicationCode"
        tableCode="DEPT_ASSET"
        :scrollX="1000"
        :scrollY="500"
      />
    </template>
    <template #footer-page> </template>
  </GLayout>
</template>
<script lang="ts" setup>
import { Button, Popover, type TableColumnType, type TableProps } from "ant-design-vue";
import { computed, h, onMounted, reactive, ref } from "vue";

import { usePageName, useListQueryCache } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import { getPropertyByDepAllPage, exportDeptAssets } from "@/api/asset-management/asset-management";
import GLayout from "@/components/common/g-layout.vue";
import { translateAmount } from "@/utils/tool";
interface FormState {
  name: string;
}
const { pageTitle } = usePageName();
const formState = reactive<FormState>({
  name: "",
});
const applicationCode = __ENV__.applicationCode;
const assetTotalNum = ref("");
const assetTotalMoney = ref("");
const assetTotalMoneyText = computed(() => translateAmount(assetTotalMoney.value));
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
    };
    const res = await exportDeptAssets(params);
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
    ...formState,
  };
  loading.value = true;
  try {
    const res = await getPropertyByDepAllPage(params);
    if (res.data) {
      dataSource.value = res.data.depAll;
      pagination.value.total = res.data.depAll.length;
      assetTotalMoney.value = res.data.totalPrice;
      assetTotalNum.value = res.data.totalNumber;
    }
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
};

const detail = (record: { depId: string }) => {
  history.pushState({ current: location.pathname + location.search }, "", `/portal/asset-management/deptAssetList?id=${record.depId}`);
};
const columns: TableColumnType[] = [
  {
    title: "序号",
    width: 70,
    align: "center",
    customRender: ({ index }) => `${index + 1}`,
  },
  {
    title: "部门名称",
    dataIndex: "depName",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "资产数量",
    dataIndex: "totalNumber",
    customRender: ({ record, text }) => {
      if (!text) {
        return "--";
      }
      return [h(Button, { type: "link", size: "small", onClick: () => detail(record) }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "金额",
    dataIndex: "totalPrice",
    ellipsis: true,
    customRender: ({ text }) => {
      text = translateAmount(text);
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
  await queryCache.reset();
  await getTableData();
};

onMounted(async () => {
  await queryCache.hydrateAndQuery(getTableData);
});
</script>
<style scoped>
.editable-cell-text-wrapper {
  cursor: pointer;
}
</style>
