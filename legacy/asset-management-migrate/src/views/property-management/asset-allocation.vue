<template>
  <GLayout ref="table_layout_ref" :title="pageTitle" showfooter>
    <template #header-btn>
      <Button type="primary" @click="add">新增</Button>
    </template>
    <template #content-search>
      <Form layout="inline" :model="formState">
        <FormItem label="状态">
          <Select
            v-model:value="formState.status"
            placeholder="请选择"
            style="width: 180px; margin-bottom: 10px"
            :options="businessStatus"
          />
        </FormItem>
        <FormItem label="移交日期">
          <DatePicker v-model:value="formState.receiveTime" value-format="YYYY-MM-DD" />
        </FormItem>
        <FormItem label="移交部门">
          <Select v-model:value="formState.overDepId" placeholder="请选择" style="width: 180px">
            <SelectOption v-for="item in deptOptions" :key="item.id" :value="item.id">{{ item.name }}</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="接收部门">
          <Select v-model:value="formState.receiveDepId" placeholder="请选择" style="width: 180px">
            <SelectOption v-for="item in deptOptions" :key="item.id" :value="item.id">{{ item.name }}</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="资产类别">
          <Select v-model:value="formState.typeId" placeholder="请选择" style="width: 180px">
            <SelectOption v-for="item in assetType" :key="item.id" :value="item.id">{{ item.name }}</SelectOption>
          </Select>
        </FormItem>
        <FormItem>
          <Input v-model:value="formState.keyword" placeholder="调拨单号、资产名称" />
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
        tableCode="ASSET_ALLOCATION"
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
import { Button, Popconfirm, Popover, type TableProps, type TableColumnType, message } from "ant-design-vue";
import dayjs from "dayjs";
import { h, onMounted, reactive, ref } from "vue";

import { useListQueryCache, usePageName } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import { getAssemblyClassifyPage, allotDel, getAllotPage, getPropertyAllotExcel } from "@/api/asset-management/asset-management";
import { deptList } from "@/api/ouaa/ouaa";
import GLayout from "@/components/common/g-layout.vue";
interface FormState {
  status: string | undefined;
  receiveTime: string;
  overDepId: string | undefined;
  receiveDepId: string | undefined;
  keyword: string;
  typeId: string | undefined;
}
const { pageTitle } = usePageName();
const formState = reactive<FormState>({
  status: undefined,
  receiveTime: "",
  overDepId: undefined,
  receiveDepId: undefined,
  keyword: "",
  typeId: undefined,
});
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
    "/portal/stream-engine-render/index?businessType=PROPERTY_ALLOT_UNIT&appName=asset-management&type=add&title=资产调拨",
  );
};

const assetType = ref<{ id: string; name: string }[]>([]);
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
    type: "ALLOT_UNIT" as "ALLOT_UNIT" | "ALLOT_PERSONAL",
  };
  loading.value = true;
  try {
    const res = await getAllotPage(params);
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
const pageChange = (pageNumber: number, pageSize: number): void => {
  pagination.value.pageNumber = pageNumber || 1;
  pagination.value.pageSize = pageSize;
  getTableData().then(() => queryCache.sync());
};

const editRow = (record: { processInstanceId: string; currentTaskId: string }) => {
  const { processInstanceId } = record;
  history.pushState(
    { current: location.pathname + location.search },
    "",
    `/portal/stream-engine-render/index?businessType=PROPERTY_ALLOT_UNIT&appName=asset-management&processInstanceId=${processInstanceId}&type=detail&title=资产调拨`,
  );
};
const delRow = async (record: { id: string; status: string }) => {
  if (["UNDER", "PASS"].includes(record.status)) {
    message.error("当前状态下不可删除");
    return;
  }
  try {
    loading.value = true;
    await allotDel({ id: record.id });
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
    title: "调拨单号",
    dataIndex: "allotNumbers",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "资产明细",
    dataIndex: "propertyDetailed",
    customRender: ({ text }) => {
      const textArr = (text as { name: string; serialNumber: string }[]).map((e) => {
        return `${e.name}(${e.serialNumber})`;
      });
      return [h(Popover, { content: textArr.join("、") }, { default: () => textArr.join("、") })];
    },
    ellipsis: true,
  },
  {
    title: "移交部门",
    dataIndex: "overDepName",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "接收部门",
    dataIndex: "receiveDepName",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "处理人",
    dataIndex: "createByName",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "移交日期",
    dataIndex: "receiveTime",
    ellipsis: true,
    customRender: ({ text }) => {
      text = text ? dayjs(text).format("YYYY-MM-DD") : "--";
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "状态",
    dataIndex: "status",
    ellipsis: true,
    customRender: ({ text }) => {
      text = businessStatus.find((e) => e.value === text)?.label ?? "--";
      return [h(Popover, { content: text }, { default: () => text as string })];
    },
  },
  {
    title: "说明",
    dataIndex: "remarks",
    ellipsis: true,
    customRender: ({ text }) => {
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
  // 获取资产类别
  getAssemblyClassifyPage({ pageSize: 1000, pageNumber: 1, type: "assetType" }).then((res) => {
    if (res.data) {
      assetType.value = res.data.records as { id: string; name: string }[];
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
      type: "ALLOT_UNIT" as "ALLOT_UNIT" | "ALLOT_PERSONAL",
    };
    const res = await getPropertyAllotExcel(params);
    // 下载文件
    const link = document.createElement("a");
    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    link.style.display = "none";
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "固定资产调拨单.xlsx");
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
