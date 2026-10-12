<template>
  <GLayout ref="table_layout_ref" :title="pageTitle" showfooter>
    <template #header-btn>
      <Button type="primary" style="margin-right: 10px" :loading="exportLoading" @click="handleExport">导出盘点报告单</Button>
      <Button type="primary" @click="add">新增</Button>
    </template>
    <template #content-search>
      <Form layout="inline" :model="formState">
        <FormItem label="状态">
          <Select v-model:value="formState.status" placeholder="请选择" style="width: 180px">
            <SelectOption v-for="item in statusOptions" :key="item.value" :value="item.value">{{ item.label }} </SelectOption>
          </Select>
        </FormItem>
        <FormItem>
          <Input v-model:value="formState.name" placeholder="盘点单名称" />
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
        tableCode="CONSUMABLE_CHECK"
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
    title="盘点单创建"
    :submit-loading="submitLoading"
    label-width="120px"
    @ok="handleOk"
  >
    <template #tips>
      <span style="color: red">*确定后将会冻结盘点仓库，所有入、出库单都不能做，直到盘点完成！</span>
    </template>
  </GModalForm>

  <Modal v-model:visible="visible" title="" @ok="handleOk">
    <p>是否需要将本次盘点的库存同步到即时库存</p>
    <template #footer>
      <Button key="back" @click="visible = false">取消</Button>
      <Button key="back" @click="submit(false)">不同步</Button>
      <Button key="submit" type="primary" :loading="loading" @click="submit(true)">同步</Button>
    </template>
  </Modal>
</template>
<script lang="ts" setup>
import {
  Button,
  Popconfirm,
  message,
  type TableColumnType,
  type TableProps,
  Select,
  Input,
  Popover,
  Modal,
  RangePicker,
} from "ant-design-vue";
import type { Rule } from "ant-design-vue/lib/form";
import dayjs from "dayjs";
import { h, onMounted, reactive, ref } from "vue";

import { usePageName, useListQueryCache } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import {
  consumableCheckDel,
  consumableCheckInsert,
  consumableCheckSubmit,
  consumableCheckPlanSubmit,
  getConsumableCheckPage,
  getStorehousePage,
  consumableCheckPlanSubmitWin,
  getConsumableCheckDetailExcel,
} from "@/api/asset-management/asset-management";
import GLayout from "@/components/common/g-layout.vue";
import UserPicker from "@/components/common/user-picker.vue";
import { handleDownload } from "@/utils/tool";
const { pageTitle } = usePageName();
const statusOptions = [
  { label: "未完成", value: "UNDONE" },
  { label: "已完成", value: "FINISH" },
];
const applicationCode = __ENV__.applicationCode;
const visible = ref(false);
const formState = reactive<{
  status: string | undefined;
  name: string;
}>({
  status: undefined,
  name: "",
});

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
    const res = await getConsumableCheckPage(params);
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
  history.pushState(
    { current: location.pathname + location.search },
    "",
    `/portal/asset-management/consumable-check-detail?id=${record.id}`,
  );
};
const delRow = async (record: { id: string; status: string }) => {
  if (["FINISH"].includes(record.status)) {
    message.warning("盘点任务已完成，不支持删除操作");
    return;
  }
  try {
    loading.value = true;
    await consumableCheckDel({ id: record.id });
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

const nowSubRecordId = ref();
const submit = async (bool: boolean) => {
  await consumableCheckSubmit(nowSubRecordId.value);
  if (bool) {
    await consumableCheckPlanSubmitWin(nowSubRecordId.value);
  }
  visible.value = false;
  getTableData();
  message.success("操作成功");
};

const submitRow = async (record: { id: string; status: string }) => {
  if (["WEB_FINISH"].includes(record.status)) {
    message.warning("当前状态不支持该操作");
    return;
  }
  if (["UNDONE"].includes(record.status)) {
    message.warning("请确认APP任务已提交");
    return;
  }
  const bool = await consumableCheckPlanSubmit({ planId: record.id });

  if (bool.data) {
    nowSubRecordId.value = record.id;
    visible.value = true;
  } else {
    Modal.confirm({
      title: "",
      content: "确定要提交该项？",
      closable: true,
      async onOk() {
        await consumableCheckSubmit(record.id);
        getTableData();
        message.success("操作成功");
      },
    });
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
    title: "盘点单名称",
    dataIndex: "name",
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
      text = text === "WEB_FINISH" ? "已完成" : "未完成";
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "盘点仓库",
    dataIndex: "storeName",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "本次盘点时间",
    dataIndex: "startTime",
    ellipsis: true,
    width: 250,
    customRender: ({ record }: { record: { startTime: number; endTime: number } }) => {
      let res =
        (record.startTime ? dayjs(record.startTime).format("YYYY-MM-DD") : "?") +
        "," +
        (record.endTime ? dayjs(record.endTime).format("YYYY-MM-DD") : "?");
      if (!record.startTime || !record.endTime) {
        res = "--";
      }
      return [h(Popover, { content: res }, { default: () => (res as string) || "--" })];
    },
  },
  {
    title: "盘点管理员",
    dataIndex: "checker",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    ellipsis: true,
    customRender: ({ text }) => {
      text = text ? dayjs(text).format("YYYY-MM-DD") : "--";
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "创建人",
    dataIndex: "createBy",
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
        h(Button, { type: "link", size: "small", onClick: () => submitRow(record) }, { default: () => "提交" }),
        // h(
        //   Popconfirm,
        //   { title: '确定要提交该项？', danger: true, onConfirm: () => { submitRow(record) } },
        //   {
        //     default: () => h(
        //       Button,
        //       { type: 'link', size: 'small' },
        //       { default: () => '提交' }
        //     )
        //   }
        // ),
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

const submitLoading = ref(false);
const modalVisible = ref(false);
const modalFormState = ref<{
  name: string;
  checkerId: string;
  previousCheckDate: string;
  presentCheckDate: string;
  storeId: string | undefined;
}>({
  name: "",
  checkerId: "",
  previousCheckDate: "",
  presentCheckDate: "",
  storeId: "",
});
const add = () => {
  modalFormState.value.name = "";
  modalFormState.value.checkerId = "";
  modalFormState.value.previousCheckDate = "";
  modalFormState.value.presentCheckDate = "";
  modalFormState.value.storeId = undefined;
  modalVisible.value = true;
};
const formSource = ref<
  {
    value: string | number;
    label: string;
    component: unknown;
    props?: {
      placeholder?: string;
      options?: { label: string; value: string }[];
      maxLength?: number;
      showBtn?: boolean;
      valueFormat?: string;
      format?: string;
      onChange?: unknown;
    };
  }[]
>([
  {
    label: "盘点单名称",
    value: "name",
    component: Input,
    props: {
      placeholder: "请输入盘点单名称",
      maxLength: 20,
      onChange: () => {
        modalFormState.value.name = modalFormState.value.name.replace(/[^\w\u4E00-\u9FA5]/g, "");
      },
    },
  },
  {
    label: "盘点仓库",
    value: "storeId",
    component: Select,
    props: {
      placeholder: "请选择",
      options: [],
    },
  },
  {
    label: "盘点管理员",
    value: "checkerId",
    component: UserPicker,
    props: {
      placeholder: "请选择",
      showBtn: true,
    },
  },
  {
    label: "上次盘点时间",
    value: "previousCheckDate",
    component: RangePicker,
    props: {
      format: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD",
    },
  },
  {
    label: "本次盘点时间",
    value: "presentCheckDate",
    component: RangePicker,
    props: {
      format: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD",
    },
  },
]);
const modalFormRules: Record<string, Rule[]> = {
  name: [{ required: true, message: "请输入盘点单名称", trigger: "blur" }],
  checkerId: [{ required: true, message: "请选择盘点管理员", trigger: "blur" }],
  previousCheckDate: [{ required: false, message: "请选择上次盘点时间", trigger: "change" }],
  presentCheckDate: [{ required: false, message: "请选择本次盘点时间", trigger: "change" }],
  storeId: [{ required: true, message: "请选择盘点仓库", trigger: "change" }],
};

const handleOk = async () => {
  try {
    submitLoading.value = true;
    const params = { ...modalFormState.value };
    params.checkerId = (params.checkerId[0] as unknown as { id: string }).id;
    params.presentCheckDate = params.presentCheckDate ? (params.presentCheckDate as unknown as string[]).join(",") : "";
    params.previousCheckDate = params.previousCheckDate ? (params.previousCheckDate as unknown as string[]).join(",") : "";
    await consumableCheckInsert(params);
    message.success("操作成功");
    modalVisible.value = false;
    submitLoading.value = false;
    getTableData();
  } catch (error) {
    submitLoading.value = false;
  }
};

const tableScroll = ref({ x: 1000, y: document.querySelector(".content-table")?.clientHeight ?? 435 });

onMounted(async () => {
  await queryCache.hydrateAndQuery(getTableData);

  // 仓库查询
  getStorehousePage({ pageNumber: 1, pageSize: 1000 }).then((res) => {
    if (res.data && formSource.value[1].props?.options) {
      formSource.value[1].props.options = (res.data.records as { id: string; name: string }[]).map((e) => {
        return { label: e.name, value: e.id };
      });
    }
  });
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
  const params = {
    ...formState,
    ids: selectedRowKeysState.value.join(","),
    type: "ALLOT_PERSONAL" as "ALLOT_UNIT" | "ALLOT_PERSONAL",
  };
  const res = await getConsumableCheckDetailExcel(params);
  handleDownload(res.data, "耗材盘点单.xlsx").then(() => {
    setTimeout(() => {
      exportLoading.value = false;
    }, 1000);
  });
};
</script>
<style scoped>
.editable-cell-text-wrapper {
  cursor: pointer;
}
</style>
