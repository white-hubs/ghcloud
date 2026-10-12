<template>
  <div class="flow-table">
    <GLayout :title="pageTitle">
      <template #header-btn>
        <Button type="primary" @click="handleAdd">新增</Button>
      </template>
      <template #content-search>
        <Form layout="inline" :model="formState">
          <FormItem>
            <Input v-model:value="formState.name" placeholder="报废原因名称" />
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
          tableCode="SCRAP_REASON"
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
    <GModalForm
      v-model="modalVisible"
      :form-source="formSource"
      :form-state="modalFormState"
      :rule="modalFormRules"
      :title="(handleType === 'add' ? '新增' : '编辑') + pageTitle"
      :submit-loading="submitLoading"
      label-width="110px"
      @ok="handleOk"
    />
  </div>
</template>
<script setup lang="ts">
import { message, type TableColumnsType, Input, Textarea, Button, Popconfirm, Popover } from "ant-design-vue";
import type { Rule } from "ant-design-vue/es/form";
import { h, onMounted, reactive, ref } from "vue";

import { usePageName, useListQueryCache } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import { classifyDel, classifyInsert, classifyUpdate, getAssemblyClassifyPage } from "@/api/asset-management/asset-management";
import GLayout from "@/components/common/g-layout.vue";
import GModalForm from "@/components/common/g-modal-form.vue";
const { pageTitle } = usePageName();
const type = "reasonForScrapping";
const formState = reactive({ name: "" });
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
const applicationCode = __ENV__.applicationCode;

const getTableData = async () => {
  const params = {
    pageNumber: pagination.value.pageNumber,
    pageSize: pagination.value.pageSize,
    type,
    name: formState.name || null,
  };
  loading.value = true;
  try {
    const res = await getAssemblyClassifyPage(params);
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

const modalFormState = ref({
  name: "",
  type,
  remarks: "",
});

const tableScroll = ref({ x: 1000, y: document.querySelector(".content-table")?.clientHeight ?? 435 });

onMounted(async () => {
  await queryCache.hydrateAndQuery(getTableData);
  tableScroll.value.y = document.querySelector(".content-table")!.clientHeight - 39;
});

const submitLoading = ref(false);
const modalVisible = ref(false);
const handleType = ref<"add" | "edit">("add");
const handleAdd = () => {
  handleType.value = "add";
  modalFormState.value = {
    name: "",
    remarks: "",
    type,
  };
  modalVisible.value = true;
};
const editRow = (row: { name: string; type: string; remarks: string }) => {
  handleType.value = "edit";
  modalFormState.value = JSON.parse(JSON.stringify(row));
  modalVisible.value = true;
};
const delRow = async (row: { id: string }) => {
  await classifyDel({ id: row.id });
  message.success("操作成功");
  if (dataSource.value.length === 1 && pagination.value.pageNumber > 1) {
    pagination.value.pageNumber--;
  }
  getTableData();
};
const columns: TableColumnsType = [
  {
    title: "序号",
    width: 70,
    align: "center",
    customRender: ({ index }) => `${index + 1}`,
  },
  {
    title: "报废原因名称",
    dataIndex: "name",
    key: "name",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "备注说明",
    dataIndex: "remarks",
    key: "remarks",
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
      return [
        h(Button, { type: "link", size: "small", onClick: () => editRow(record) }, "编辑"),
        h(
          Popconfirm,
          {
            title: "确定要删除该项？",
            danger: true,
            onConfirm: () => {
              delRow(record);
            },
          },
          h(Button, { type: "link", size: "small", danger: true }, "删除"),
        ),
      ];
    },
  },
];

const formSource = ref<{ value: string | number; label: string; component: unknown; props?: unknown }[]>([
  {
    label: "报废原因名称",
    value: "name",
    component: Input,
    props: {
      placeholder: "请输入报废原因名称",
      maxLength: 20,
    },
  },
  {
    label: "备注说明",
    value: "remarks",
    component: Textarea,
    props: {
      placeholder: "请输入备注说明",
      autoSize: { minRows: 4, maxRows: 6 },
      maxLength: 200,
    },
  },
]);
const modalFormRules: Record<string, Rule[]> = {
  name: [{ required: true, message: "请输入报废原因名称", trigger: "blur" }],
};
const handleOk = async () => {
  try {
    submitLoading.value = true;
    const params = modalFormState.value;
    if (handleType.value === "add") {
      await classifyInsert(params);
    } else {
      await classifyUpdate(params);
    }
    message.success("操作成功");
    modalVisible.value = false;
    submitLoading.value = false;
    getTableData();
    modalFormState.value = {
      name: "",
      remarks: "",
      type,
    };
  } catch (error) {
    submitLoading.value = false;
  }
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
</script>
<style lang="less" scoped>
.flow-table {
  height: 100%;
}
</style>
