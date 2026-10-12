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
        <FormItem label="清理日期">
          <DatePicker v-model:value="formState.manageTime" value-format="YYYY-MM-DD" />
        </FormItem>
        <FormItem label="资产类别">
          <Select v-model:value="formState.typeId" placeholder="请选择" style="width: 180px">
            <SelectOption v-for="item in assetType" :key="item.id" :value="item.id">{{ item.name }}</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="清理原因">
          <Select v-model:value="formState.causeId" placeholder="请选择" style="width: 180px">
            <SelectOption v-for="item in cleanResonOptions" :key="item.id" :value="item.id">{{ item.name }}</SelectOption>
          </Select>
        </FormItem>
        <FormItem>
          <Input v-model:value="formState.keyword" placeholder="资产名称、清理单号" />
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
        tableCode="ASSET_CLEANING"
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

import { getAssemblyClassifyPage, getPropertyWeedOutPage, weedOutDel } from "@/api/asset-management/asset-management";
import GLayout from "@/components/common/g-layout.vue";
interface FormState {
  status: string | undefined;
  manageTime: string;
  causeId: string | undefined;
  keyword: string;
  typeId: string | undefined;
}
const { pageTitle } = usePageName();
const formState = reactive<FormState>({ status: undefined, manageTime: "", causeId: undefined, keyword: "", typeId: undefined });
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
    "/portal/stream-engine-render/index?businessType=PROPERTY_WEED_OUT&appName=asset-management&type=add&title=清理报废",
  );
};

const assetType = ref<{ id: string; name: string }[]>([]);
const cleanResonOptions = ref<{ id: string; name: string }[]>([]);
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
    const res = await getPropertyWeedOutPage(params);
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
    `/portal/stream-engine-render/index?businessType=PROPERTY_WEED_OUT&appName=asset-management&processInstanceId=${processInstanceId}&type=detail&title=清理报废`,
  );
};
const delRow = async (record: { id: string; status: string }) => {
  if (["UNDER", "PASS"].includes(record.status)) {
    message.error("当前状态下不可删除");
    return;
  }
  try {
    loading.value = true;
    await weedOutDel({ id: record.id });
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
    title: "清理单号",
    dataIndex: "weedOutNumbers",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "清理日期",
    dataIndex: "manageTime",
    ellipsis: true,
    customRender: ({ text }) => {
      text = text ? dayjs(text).format("YYYY-MM-DD") : "--";
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "清理原因",
    dataIndex: "cause",
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
      return [h(Popover, { content: textArr.join("、") }, { default: () => textArr.join("、") || "--" })];
    },
    ellipsis: true,
  },
  {
    title: "处理人",
    dataIndex: "weedOutUserName",
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

  // 清理原因
  getAssemblyClassifyPage({ pageSize: 1000, pageNumber: 1, type: "reasonForScrapping" }).then((res) => {
    if (res.data) {
      cleanResonOptions.value = res.data.records as { id: string; name: string }[];
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
