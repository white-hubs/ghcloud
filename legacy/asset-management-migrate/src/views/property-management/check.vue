<template>
  <GLayout ref="table_layout_ref" :title="pageTitle" showfooter>
    <template #header-btn>
      <Button type="primary" style="margin-right: 10px" :loading="exportLoading" @click="handleExport">打印盘点报告单</Button>
      <Button type="primary" @click="add">新增</Button>
    </template>
    <template #content-search>
      <Form layout="inline" :model="formState">
        <FormItem label="状态">
          <Select v-model:value="formState.status" placeholder="请选择" style="width: 180px">
            <SelectOption v-for="item in statusOptions" :key="item.value" :value="item.value">{{ item.label }}</SelectOption>
          </Select>
        </FormItem>
        <FormItem>
          <Input v-model:value="formState.taskName" placeholder="盘点任务名称" />
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
        tableCode="ASSET_CHECK"
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
import { Button, Popconfirm, message, type TableColumnType, type TableProps, Modal, Popover } from "ant-design-vue";
import dayjs from "dayjs";
import { h, onMounted, reactive, ref } from "vue";

import { useListQueryCache, usePageName } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import {
  checkDel,
  checkPlanSubmit,
  checkPlanSubmitWin,
  getPropertyCheckPlanExcel,
  getPropertyCheckPlanPage,
} from "@/api/asset-management/asset-management";
import GLayout from "@/components/common/g-layout.vue";
const statusOptions = [
  { label: "未完成", value: "UNDONE" },
  { label: "已完成", value: "FINISH" },
];
const { pageTitle } = usePageName();
const formState = reactive<{
  status: string | undefined;
  taskName: string;
}>({
  status: undefined,
  taskName: "",
});
const applicationCode = __ENV__.applicationCode;
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
    ...formState,
  };
  loading.value = true;
  try {
    const res = await getPropertyCheckPlanPage(params);
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
const editRow = (record: { id: string }) => {
  history.pushState({ current: location.pathname + location.search }, "", `/portal/asset-management/asset-check-detail?id=${record.id}`);
};
const delRow = async (record: { id: string; status: string }) => {
  if (["FINISH"].includes(record.status)) {
    message.warning("当前状态不支持该操作");
    return;
  }
  try {
    loading.value = true;
    await checkDel({ id: record.id });
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
const showSubDialog = (planId: string) => {
  Modal.confirm({
    title: "",
    content: "盘盈的资产是否需要自动同步到资产清单中？",
    async onOk() {
      // TODO 等待后端街口
      await checkPlanSubmitWin({ planId });
      message.success("操作成功");
    },
  });
};
const submitRow = async (record: { id: string; status: string }) => {
  if (["FINISH"].includes(record.status)) {
    message.warning("当前状态不支持该操作");
    return;
  }
  try {
    loading.value = true;
    const res = await checkPlanSubmit({ planId: record.id });
    if (res.data) {
      showSubDialog(record.id);
    } else {
      getTableData();
      message.success("操作成功");
    }
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
    title: "任务名称",
    dataIndex: "taskName",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "盘点资产数",
    dataIndex: "propertyNumber",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "预计完成时间",
    dataIndex: "estimateEndTime",
    ellipsis: true,
    customRender: ({ text }) => {
      text = text ? dayjs(text).format("YYYY-MM-DD") : "--";
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "实际完成时间",
    dataIndex: "realityEndTime",
    ellipsis: true,
    customRender: ({ text }) => {
      text = text ? dayjs(text).format("YYYY-MM-DD") : "--";
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "盘点负责人",
    dataIndex: "dutyUserName",
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
      text = text === "FINISH" ? "已完成" : "未完成";
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
            title: "确定要提交该项？",
            danger: true,
            onConfirm: () => {
              submitRow(record);
            },
          },
          {
            default: () => h(Button, { type: "link", size: "small" }, { default: () => "提交" }),
          },
        ),
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
const selectedRowKeysState = ref<Key[]>([]);
type Key = string | number;
const rowSelection: TableProps["rowSelection"] = {
  onChange: (selectedRowKeys: Key[]) => {
    selectedRowKeysState.value = selectedRowKeys;
  },
  getCheckboxProps: (record: { status: string }) => ({
    disabled: record.status !== "FINISH",
  }),
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

const add = () => {
  history.pushState({ current: location.pathname + location.search }, "", `/portal/asset-management/asset-check-add`);
};
const tableScroll = ref({ x: 1000, y: document.querySelector(".content-table")?.clientHeight ?? 435 });

onMounted(async () => {
  await queryCache.hydrateAndQuery(getTableData);
  tableScroll.value.y = document.querySelector(".content-table")!.clientHeight - 39;
});

// 导出
const exportLoading = ref(false);
const handleExport = async () => {
  if (selectedRowKeysState.value.length === 0) {
    message.error("请先选择要导出的数据");
    return;
  }
  exportLoading.value = true;
  try {
    const params = {
      ...formState,
      ids: selectedRowKeysState.value.join(","),
    };
    const res = await getPropertyCheckPlanExcel(params);
    // 下载文件
    const link = document.createElement("a");
    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    link.style.display = "none";
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "资产盘点表.xlsx");
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
</script>
<style scoped>
.editable-cell-text-wrapper {
  cursor: pointer;
}
</style>
