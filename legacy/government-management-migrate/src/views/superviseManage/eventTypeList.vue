<template>
  <div class="table-layout" ref="table_layout_ref">
    <div class="layout-header">
      <div class="header-name">
        <g-vertical-line :title="pageTitle"></g-vertical-line>
        <div class="right-btn">
          <a-button type="primary" @click="openModal">新增</a-button>
        </div>
      </div>
      <div class="header-control">
        <a-form layout="inline" :model="formState">
          <a-form-item>
            <a-input v-model:value="formState.name" placeholder="请输入事项类型" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleReset"> 重置 </a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
    <div class="layout-content">
      <AliasTable 
          tableCode="EVENT_TYPE" 
          applicationCode="OFFICIAL_MANAGEMENT" :dataSource="dataSource" :pagination="false" :columns="columns" :loading="isLoading" bordered
        size="small">
      </AliasTable>
      <div class="content-page">
        <a-pagination show-size-changer v-if="pagination.total > 0" v-model:pageSize="pagination.pageSize"
          v-model:current="pagination.pageNumber" :total="pagination.total" :default-current="1" @change="pageChange"
          :show-total="(total: number) => `共 ${total} 条数据`"></a-pagination>
      </div>
    </div>
    <a-modal v-model:visible.sync="visible" :getContainer="() => $refs.table_layout_ref" destroyOnClose
      :confirm-loading="confirmLoading" centered @cancel="handleCancel" @ok="handleOk" width="600px"
      :title="modalTitle">
      <a-form :model="modalForm" :rules="modalFormRules" ref="modalFormRef">
        <a-form-item label="事项类型" name="name">
          <a-input v-model:value="modalForm.name" maxlength="20"
            @keyup="modalForm.name = modalForm.name.replace(/\s+/g, '')" />
        </a-form-item>
        <a-form-item label="事项描述" name="remark">
          <a-textarea v-model:value="modalForm.remark" @keyup="modalForm.remark = modalForm.remark.replace(/\s+/g, '')"
            placeholder="请输入事项描述" maxlength="200" :auto-size="{ minRows: 5, maxRows: 10 }" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script setup lang="ts">
import {
addFocusWorkCategory, deleteFocusWorkCategory, getFocusWorkCategoryList,
updateFocusWorkCategory
} from "@/api/superviseManage";
import GVerticalLine from "@/components/common/gVerticalLine.vue";
import { Button, message, Modal, Popconfirm, TableColumnsType } from "ant-design-vue";
import { FormInstance, Rule } from "ant-design-vue/es/form";
import { onMounted, reactive, ref, h } from "vue";
import { Popover } from 'ant-design-vue/es'
import { AliasTable } from '@ghcloud/generic-component'
import { usePageName } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
interface FormState {
  name: string;
}
interface modalFormState {
  name: string;
  remark: string;
  id?: string;
}
const modalFormRules: Record<string, Rule[]> = {
  name: [
    { pattern: new RegExp(/^[\a-\z\A-\Z0-9\u4e00-\u9fe5]+$/), message: '只能输入中文英文及数字', trigger: "blur" },
    { required: true, message: "请输入事项类型", trigger: "blur" },
  ]
};
let formState = reactive({} as FormState);
let modalForm = ref({} as modalFormState);
const modalFormRef = ref<FormInstance>();
const visible = ref(false);
const isLoading = ref(false);
const confirmLoading = ref(false);
const modalTitle = ref("新增事项");
let dataSource = ref([]);
const columns: TableColumnsType = [
  {
    title: "事项类型",
    dataIndex: "name",
    key: "name",
    align: "center",
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text ? text : "--" }, { default: () => text ? text : "--" })
      ]
    }
  },
  {
    title: "事项描述",
    dataIndex: "remark",
    key: "remark",
    align: "center",
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text ? text : "--" }, { default: () => text ? text : "--" })
      ]
    }
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
    align: "center",
    customRender: ({ record }) => {
      return [
      h(
          Button,
          { type: 'link', size: 'small', onClick: () => editRow(record) },
          { default: () => '编辑' }
        ),
      h(
        Popconfirm,
        { title: '确定要删除该项？', danger: true, onConfirm: () => { deleteRow(record) } },
        {
          default: () => h(
            Button,
            { type: 'link', size: 'small', danger: true },
            { default: () => '删除' }
          )
        }
      )
      ]
    }
  },
];
const pagination = ref({
  pageNumber: 1,
  pageSize: 10,
  total: 1,
});
const pageChange = (pageNumber: number, pageSize: number) => {
  pagination.value.pageNumber = pageNumber;
  pagination.value.pageSize = pageSize;
  getTableData();
};
// 打开弹出框
const openModal = () => {
  modalTitle.value = "新增事项";
  visible.value = true;
};
const getTableData = async () => {
  isLoading.value = true;
  const params = {
    name: formState.name,
    pageNumber: pagination.value.pageNumber,
    pageSize: pagination.value.pageSize,
  };
  try {
    const result = await getFocusWorkCategoryList(params);
    dataSource.value = result.data.records;
    pagination.value.total = result.data.total
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
};
const handleSearch = () => {
  pagination.value.pageNumber = 1;
  getTableData();
};
const editRow = (row: modalFormState) => {
  const stateRow = { ...row };
  modalTitle.value = "编辑事项";
  modalForm.value = stateRow;
  visible.value = true;
};
onMounted(() => {
  getTableData();
});
const deleteRow = (row: modalFormState) => {
  Modal.confirm({
    title: "提示",
    content: "确定要删除该事项类型？",
    onOk: async () => {
      try {
        await deleteFocusWorkCategory(row.id as string);
        pagination.value.pageNumber = 1;
        getTableData();
        message.success("删除成功");
      } catch (error) {
      }
    },
  });
};
const addCategory = async () => {
  const params = {
    ...modalForm.value,
  };
  await addFocusWorkCategory(params);
  visible.value = false;
  getTableData();
  message.success("新增成功");
};
const handleCancel = () => {
  modalForm.value = {
    name: "",
    remark: "",
  };
};
const editCategory = async () => {
  const params = {
    ...modalForm.value,
  };
  await updateFocusWorkCategory(modalForm.value.id as string, params);
  visible.value = false;
  getTableData();
  message.success("编辑成功");
};
// 弹出框点击确认
const handleOk = async () => {
  await modalFormRef.value?.validateFields();
  confirmLoading.value = true;
  const useMethedMap = new Map<string, any>([
    ["新增事项", addCategory],
    ["编辑事项", editCategory],
  ]);
  useMethedMap.get(modalTitle.value)();
  modalForm.value = {
    name: "",
    remark: "",
  };
  confirmLoading.value = false;
};
// 重置
const handleReset = () => {
  formState.name = "";
  handleSearch()
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

//</style>
