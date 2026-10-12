<template>
  <div class="flow-table">
    <GLayout :title="pageTitle">
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
        <AliasTable
          :columns="columns"
          :data-source="dataSource"
          :pagination="false"
          :scroll="tableScroll"
          size="small"
          bordered
          :loading="loading"
          :applicationCode="applicationCode"
          tableCode="ASSET_ADMIN"
          :scrollX="tableScroll.x"
          :scrollY="tableScroll.y"
        />
      </template>
    </GLayout>
    <UserPicker ref="userPickerRef" v-model:model-value="nowEditRowModelValues" @comfirm="adminComfirm" />
  </div>
</template>
<script setup lang="ts">
import { type TableColumnsType, Input, Button, Popover } from "ant-design-vue";
import { h, onMounted, reactive, ref } from "vue";

import { useListQueryCache, usePageName } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import { adminBind, getPropertyCheckTaskAdminPage } from "@/api/asset-management/asset-management";
import GLayout from "@/components/common/g-layout.vue";
import UserPicker from "@/components/common/user-picker.vue";
const { pageTitle } = usePageName();
const applicationCode = __ENV__.applicationCode;
const formState = reactive({ name: "" });
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

const getTableData = async () => {
  const params = {
    pageNumber: pagination.value.pageNumber,
    pageSize: pagination.value.pageSize,
    ...formState,
  };
  loading.value = true;
  try {
    const res = await getPropertyCheckTaskAdminPage(params);
    if (res.data) {
      dataSource.value = res.data;
    }
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
};

const tableScroll = ref({ x: 1000, y: document.querySelector(".content-table")?.clientHeight ?? 435 });

onMounted(async () => {
  await queryCache.hydrateAndQuery(getTableData);
  tableScroll.value.y = document.querySelector(".content-table")!.clientHeight - 39;
});

const userPickerRef = ref();
const nowEditRow = ref<{ id: string }>();
const nowEditRowModelValues = ref<{ id: string }[]>([]);
const editRow = (record: { adminId: { id: string }[]; id: string }) => {
  nowEditRow.value = record;
  nowEditRowModelValues.value = record.adminId ?? [];
  userPickerRef.value?.show();
};
const adminComfirm = async (values: { id: string }[]) => {
  if (values.length) {
    const params = {
      userIds: values.map((e: { id: string }) => e.id),
      orgId: nowEditRow.value!.id,
    };
    await adminBind(params);
    getTableData();
  }
};
const columns: TableColumnsType = [
  {
    title: "序号",
    width: 70,
    align: "center",
    customRender: ({ index }) => `${index + 1}`,
  },
  {
    title: "部门名称",
    dataIndex: "name",
    key: "name",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "资产管理员",
    dataIndex: "adminName",
    key: "adminName",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "备注说明",
    dataIndex: "remark",
    key: "remark",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
    width: 150,
    customRender: ({ record }) => {
      return [h(Button, { type: "link", onClick: () => editRow(record) }, "关联资产管理员")];
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
const pageChange = (pageNumber: number, pageSize: number): void => {
  pagination.value.pageNumber = pageNumber;
  pagination.value.pageSize = pageSize;
  getTableData().then(() => queryCache.sync());
};
</script>
<style lang="less" scoped>
.flow-table {
  height: 100%;
}
</style>
