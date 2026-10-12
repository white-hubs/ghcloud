<template>
  <GLayout ref="table_layout_ref" :title="pageTitle" showfooter>
    <template #header-btn>
      <Button type="primary" @click="add">新增</Button>
    </template>
    <template #content-search>
      <Form layout="inline" :model="formState">
        <FormItem label="状态">
          <Select v-model:value="formState.status" placeholder="请选择" style="width: 180px" :options="businessStatus" />
        </FormItem>
        <FormItem label="出库仓库">
          <Select v-model:value="formState.storeId" placeholder="请选择" style="width: 180px">
            <SelectOption v-for="item in storeHouseOptions" :key="item.id" :value="item.id">{{ item.name }}</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="出库日期">
          <DatePicker v-model:value="formState.claimantDate" value-format="YYYY-MM-DD" />
        </FormItem>
        <FormItem label="领用部门">
          <Select v-model:value="formState.deptId" placeholder="请选择" style="width: 180px">
            <SelectOption v-for="item in deptOptions" :key="item.id" :value="item.id">{{ item.name }}</SelectOption>
          </Select>
        </FormItem>
        <FormItem>
          <Input v-model:value="formState.keyword" placeholder="领用单号、耗材名称" />
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
        tableCode="ASSET_CONSUMING"
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
import { Button, Popconfirm, type TableProps, type TableColumnType, message, Popover } from "ant-design-vue";
import dayjs from "dayjs";
import { h, onMounted, reactive, ref } from "vue";

import { useListQueryCache, usePageName } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import {
  getConsumableReduceRecordPage,
  consumableReduceRecordDel,
  getStorehousePage,
  getConsumableCheckRecordExcel,
} from "@/api/asset-management/asset-management";
import { deptList } from "@/api/ouaa/ouaa";
import GLayout from "@/components/common/g-layout.vue";
import { handleDownload } from "@/utils/tool";

interface FormState {
  status: string | undefined;
  claimantDate: string;
  keyword: string;
  storeId: string | undefined;
  deptId: string | undefined;
}
const { pageTitle } = usePageName();
const formState = reactive({
  status: null,
  claimantDate: null,
  keyword: null,
  storeId: null,
  deptId: null,
  typeId: null,
} as unknown as FormState);
const applicationCode = __ENV__.applicationCode;
type Key = string | number;
const selectedRowKeysState = ref<Key[]>([]);
const rowSelection: TableProps["rowSelection"] = {
  onChange: (selectedRowKeys: Key[]) => {
    selectedRowKeysState.value = selectedRowKeys;
  },
};

const add = () => {
  history.pushState(
    { current: location.pathname + location.search },
    "",
    "/portal/stream-engine-render/index?businessType=CONSUMABLE_REDUCE&appName=asset-management&type=add&title=耗材领用",
  );
};

const storeHouseOptions = ref<{ id: string; name: string }[]>([]);
const deptOptions = ref<{ id: string; name: string }[]>([]);
const businessStatus = [
  { value: "UNDER", label: "审批中" },
  { value: "PASS", label: "通过" },
  { value: "REJECT", label: "拒绝" },
  { value: "UNDO", label: "撤销" },
];

const loading = ref(false);
const dataSource = ref<unknown[]>([]);
const pagination = ref({
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});
const queryCache = useListQueryCache({
  defaults: { ...formState, pageNumber: 1, pageSize: 10 },
  getState: () => ({ ...formState, pageNumber: pagination.value.pageNumber, pageSize: pagination.value.pageSize }),
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
    const res = await getConsumableReduceRecordPage(params);
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

const editRow = (record: { processInstanceId: string }) => {
  const { processInstanceId } = record;
  history.pushState(
    { current: location.pathname + location.search },
    "",
    `/portal/stream-engine-render/index?businessType=CONSUMABLE_REDUCE&appName=asset-management&processInstanceId=${processInstanceId}&type=detail&title=耗材出库`,
  );
};
const delRow = async (record: { id: string; status: string }) => {
  if (record.status === "UNDER") {
    message.error("正在审批中，不支持删除操作");
    return;
  }
  if (record.status === "PASS") {
    message.error("耗材已成功出库，不支持删除操作");
    return;
  }
  try {
    loading.value = true;
    await consumableReduceRecordDel({ id: record.id });
    if (dataSource.value.length === 1 && pagination.value.pageNumber > 1) {
      pagination.value.pageNumber--;
    }
    getTableData();
  } catch (error) {
    loading.value = false;
  } finally {
    loading.value = false;
  }
};

const columns: TableColumnType[] = [
  {
    title: "序号",
    width: 70,
    align: "center",
    customRender: ({ index }) => `${index + 1}`,
  },
  {
    title: "领用单号",
    dataIndex: "depositoryNumbers",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "出库仓库",
    dataIndex: "storeName",
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
      text = businessStatus.find((e) => e.value === text)?.label ?? "--";
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "领用日期",
    dataIndex: "reduceDate",
    ellipsis: true,
    customRender: ({ text }) => {
      text = text ? dayjs(text).format("YYYY-MM-DD") : "--";
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "领用部门",
    dataIndex: "deptName",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "领用人",
    dataIndex: "claimantName",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "处理人",
    dataIndex: "handlerName",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "处理日期",
    dataIndex: "createTime",
    ellipsis: true,
    customRender: ({ text }) => {
      text = text ? dayjs(text).format("YYYY-MM-DD") : "--";
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "操作",
    dataIndex: "action",
    width: 200,
    customRender: ({ record }) => {
      return [
        h(Button, { type: "link", size: "small", onClick: () => editRow(record) }, { default: () => "详情" }),
        h(
          Popconfirm,
          {
            title: "确定要删除该项？",
            danger: true,
            onConfirm: () => {
              delRow(record);
            },
          },
          {
            default: () => h(Button, { type: "link", size: "small", danger: true }, { default: () => "删除" }),
          },
        ),
      ];
    },
  },
];

// 导出
const exportLoading = ref(false);
const handleExport = async () => {
  if (selectedRowKeysState.value.length === 0) {
    message.error("请先选择要导出的数据");
    return;
  }
  exportLoading.value = true;
  const params = {
    ...formState,
    ids: selectedRowKeysState.value.join(","),
    type: "ALLOT_PERSONAL" as "ALLOT_UNIT" | "ALLOT_PERSONAL",
  };
  const res = await getConsumableCheckRecordExcel(params);
  handleDownload(res.data, "耗材领用.xlsx").then(() => {
    setTimeout(() => {
      exportLoading.value = false;
    }, 1000);
  });
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
  // 仓库查询
  getStorehousePage({ pageNumber: 1, pageSize: 1000 }).then((res) => {
    if (res.data) {
      storeHouseOptions.value = res.data.records as { id: string; name: string }[];
    }
  });

  // 部门select
  deptList().then((res) => {
    if (res.data) {
      deptOptions.value = res.data as { id: string; name: string }[];
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
