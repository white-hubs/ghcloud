<template>
  <div class="table-layout" ref="table_layout_ref">
    <div class="layout-header">
      <div class="header-name">
        <g-vertical-line title="记录类型"></g-vertical-line>
        <div class="right-btn">
          <Button type="primary" @click="openModal">新增</Button>
        </div>
      </div>
      <div class="header-control">
        <Form layout="inline" :model="formState">
          <FormItem label="">
            <Input v-model:value="formState.keyword" placeholder="记录类型名称" />
          </FormItem>
          <FormItem>
            <Button type="primary" @click="handleSearch">查询</Button>
          </FormItem>
          <FormItem>
            <Button type="primary" @click="handleReset"> 重置 </Button>
          </FormItem>
        </Form>
      </div>
    </div>
    <div class="layout-content">
      <Table
        :dataSource="dataSource"
        :pagination="false"
        :loading="isLoading"
        bordered
        :columns="columns"
        size="small"
        :scroll="{ y: 560 }"
      >
        <template #bodyCell="{ column, text, record, index }">
          <template v-if="column.dataIndex === 'status'">
            <Switch
              v-model:checked="record.status"
              :checked-value="1"
              :un-checked-value="0"
              @change="rowStatusChange(record)"
            />
          </template>
          <template v-if="column.dataIndex === 'action'">
            <Button type="link" @click="editRow(record)">编辑</Button>
            <Button type="link" @click="deleteRow(record)">删除</Button>
          </template>
        </template>
      </Table>
      <div class="content-page">
        <Pagination
          show-size-changer
          v-if="pagination.total > 0"
          v-model:pageSize="pagination.pageSize"
          v-model:current="pagination.pageNumber"
          :total="pagination.total"
          :default-current="1"
          @change="pageChange"
          :show-total="(total: number) => `共 ${total} 条数据`"
        ></Pagination>
      </div>
    </div>
    <Modal
      v-model:visible.sync="visible"
      centered
      destroyOnClose
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
      width="600px"
      :title="modalTitle"
    >
      <Form
        :model="modalForm"
        :rules="modalFormRules"
        ref="modalFormRef"
        :label-col="{ style: { width: '80px' } }"
      >
        <FormItem label="类型名称" name="name">
          <Input
            v-model:value="modalForm.name"
            @keyup="modalForm.name = modalForm.name.replace(/\s+/g, '')"
            :maxlength="20"
          />
        </FormItem>
        <FormItem label="类型状态">
          <Switch
            v-model:checked="modalForm.status"
            :checked-value="1"
            :un-checked-value="0"
          />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>
<script setup lang="ts">
import {
  addReportType,
  changeReportTypeStatus,
  delReportType,
  getReportTypePage,
  updateReportType,
} from "@/api/work-report/index";
import gVerticalLine from "@/components/common/gVerticalLine.vue";
import { FormInstance, message, Modal as AModal, TableColumnsType } from "ant-design-vue";
import { Rule } from "ant-design-vue/lib/form";
import { onMounted, reactive, ref } from "vue";

interface FormState {
  keyword: string;
}
interface modalFormState {
  name: string;
  status: number;
  id?: string;
}
let formState = reactive({} as FormState);
const modalForm = ref({} as modalFormState);
const isLoading = ref(false);
const confirmLoading = ref(false);
const visible = ref(false);
const modalTitle = ref("");
const pagination = ref({
  pageNumber: 1,
  pageSize: 10,
  total: 1,
});
const modalFormRef = ref<FormInstance>();
const modalFormRules: Record<string, Rule[]> = {
  name: [
    { required: true, message: "请输入纪律类型名称", trigger: "blur" },
    {
      pattern: new RegExp(/^[\a-\z\A-\Z0-9\u4e00-\u9fe5]+$/),
      message: "只能输入中文英文及数字",
      trigger: "blur",
    },
  ],
};
const dataSource = ref([]);
const pageChange = (pageNumber: number, pageSize: number) => {
  pagination.value.pageNumber = pageNumber;
  pagination.value.pageSize = pageSize;
  getPages();
};
const columns: TableColumnsType = [
  {
    title: "类型名称",
    dataIndex: "name",
    key: "name",
    align: "center",
    ellipsis: true,
  },
  {
    title: "类型状态",
    dataIndex: "status",
    key: "status",
    align: "center",
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
    align: "center",
  },
];
const getPages = async () => {
  isLoading.value = true;
  const params = {
    keyword: formState.keyword,
    pageNumber: pagination.value.pageNumber,
    pageSize: pagination.value.pageSize,
  };
  try {
    const result = await getReportTypePage(params);
    dataSource.value = result.records;
    pagination.value.total = result.total;
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
};
const handleSearch = () => {
  pagination.value.pageNumber = 1;
  getPages();
};
onMounted(() => {
  getPages();
});
const deleteRow = (row: any) => {
  AModal.confirm({
    title: "提示",
    content: "确定要删除该记录类型？",
    onOk: async () => {
      try {
        await delReportType(row);
        pagination.value.pageNumber = 1;
        getPages();
        message.success("删除成功");
      } catch (error) {
      }
    },
  });
};

// 打开弹出框
const openModal = () => {
  modalTitle.value = "新增记录类型";
  visible.value = true;
};
const editRow = (row: any) => {
  modalTitle.value = "编辑记录类型";
  const rowState = { ...row };
  modalForm.value = rowState;
  visible.value = true;
};
// 弹出框点击确认
const handleOk = async () => {
  confirmLoading.value = true;
  let handleMethodMap = new Map<string, any>([
    ["新增记录类型", addType],
    ["编辑记录类型", editType],
  ]);

  try {
    await modalFormRef.value?.validateFields();
    await handleMethodMap.get(modalTitle.value)();
    confirmLoading.value = false;
    getPages();
    visible.value = false;
    modalForm.value = {
      name: "",
      status: 0,
    };
  } catch (error) {
    confirmLoading.value = false;
    const errorData = (error as { data: unknown }).data as {
      code: number;
      data: { name: string };
    };
    if (errorData.code === 412) {
      message.error(errorData.data.name);
    }
  }
};
const handleCancel = () => {
  modalForm.value = {
    name: "",
    status: 0,
  };
};
const addType = async () => {
  const params = { ...modalForm.value };
  try {
    await addReportType(params);
  } catch (error: any) {
    // 错误处理
    if (error.code === 412) {
      const errorKeys = Object.keys(error.data.data);
      message.error(error.data.data[errorKeys[0]]);
    }
    return Promise.reject();
  }
};
const editType = async () => {
  const params = {
    ...modalForm.value,
  };
  await updateReportType({ ...params, id: modalForm.value.id as string });
  message.success("编辑成功");
};
// 重置
const handleReset = () => {
  formState.keyword = "";
  pagination.value.pageNumber = 1;
  getPages();
};

// 表格内切换状态
const rowStatusChange = async (record: { id: string; status: number }) => {
  try {
    await changeReportTypeStatus({ id: record.id, status: record.status });
    message.success("切换成功");
  } catch (error) {
    record.status = record.status === 1 ? 0 : 1;
  }
};
</script>
<style lang="less" scoped>
.table-layout {
  padding: 0 10px;

  .layout-header {
    .header-name {
      padding: 14px 0;
      border-bottom: 1px solid #f3f3f3;
      display: flex;
      justify-content: space-between;
    }

    .header-control {
      padding: 10px 0;
      display: flex;
      justify-content: space-between;
    }
  }
}

:deep(.ant-modal-body) {
  padding: 16px 24px 0 !important;
}

.layout-content {
  :deep(.ant-btn) {
    padding: 0 15px;
    line-height: 20px;
    height: 20px;
  }

  .content-page {
    margin-top: 10px;
    display: flex;
    flex-direction: row-reverse;
  }
}

//
</style>
