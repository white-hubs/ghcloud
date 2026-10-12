<template>
  <div class="table-layout" ref="table_layout_ref">
    <div class="layout-header">
      <div class="header-name">
        <g-vertical-line :title="pageTitle"></g-vertical-line>
        <div class="right-btn">
          <a-button type="primary" @click="openModal" v-if="hasPermission(permission.add)">新增</a-button>
        </div>
      </div>
      <div class="header-control">
        <a-form layout="inline" :model="formState">
          <a-form-item label="">
            <a-input v-model:value="formState.sealName" placeholder="印章名称" />
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
        tableCode="SEAL_MANAGE" 
        applicationCode="OFFICIAL_MANAGEMENT"  :dataSource="dataSource" :pagination="false" :loading="isLoading" bordered :columns="columns"
        size="small">
      </AliasTable>
      <div class="content-page">
        <a-pagination show-size-changer v-if="pagination.total > 0" v-model:pageSize="pagination.pageSize"
          v-model:current="pagination.pageNumber" :total="pagination.total" :default-current="1" @change="pageChange"
          :show-total="(total: number) => `共 ${total} 条数据`"></a-pagination>
      </div>
    </div>
    <a-modal v-model:visible.sync="visible" :getContainer="() => $refs.table_layout_ref" centered destroyOnClose
      :confirm-loading="confirmLoading" @ok="handleOk" @cancel="handleCancel" width="600px" :title="modalTitle">
      <a-form :model="modalForm" :rules="modalFormRules" ref="modalFormRef">
        <a-form-item label="印章名称" name="sealName">
          <a-input v-model:value="modalForm.sealName"
            @keyup="modalForm.sealName = modalForm.sealName.replace(/\s+/g, '')" maxlength="20" />
        </a-form-item>
        <a-form-item label="印章描述" name="sealDesc">
          <a-textarea v-model:value="modalForm.sealDesc"
            @keyup="modalForm.sealDesc = modalForm.sealDesc.replace(/\s+/g, '')" placeholder="请输入印章描述" maxlength="200"
            :auto-size="{ minRows: 5, maxRows: 10 }" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script setup lang="ts">
import {
addOfficialSeal, deleteOfficialSeal, getofficialSealPage, updateOfficialSeal
} from "@/api/official";
import GVerticalLine from "@/components/common/gVerticalLine.vue";
import type { FormInstance } from "ant-design-vue";
import { Button, message, Modal, Popconfirm, TableColumnsType } from "ant-design-vue";
import type { Rule } from "ant-design-vue/es/form";
import { h, onMounted, reactive, ref } from "vue";
import {appFunctionCodes} from '@/permission'
import {hasPermission } from '@ghcloud/cube-permission-codes'
import { AliasTable } from '@ghcloud/generic-component'
import { usePageName } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()

const permission=appFunctionCodes.officialSealManage
interface FormState {
  sealName: string;
}
interface modalFormState {
  sealName: string;
  sealDesc: string;
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
  sealName: [
    { required: true, message: "请输入印章名称", trigger: "blur" },
    { pattern: new RegExp(/^[\a-\z\A-\Z0-9\u4e00-\u9fe5]+$/), message: '只能输入中文英文及数字', trigger: "blur" }
  ]
};
const dataSource = ref([]);
const pageChange = (pageNumber: number, pageSize: number) => {
  pagination.value.pageNumber = pageNumber;
  pagination.value.pageSize = pageSize;
  getofficialSealPages();
};
const columns: TableColumnsType = [
  {
    title: "印章名称",
    dataIndex: "sealName",
    key: "sealName",
    align: "center",
    ellipsis: true
  },
  {
    title: "印章描述",
    dataIndex: "sealDesc",
    key: "sealDesc",
    align: "center",
    ellipsis: true
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
    width: 500,
    align: "center",
    customRender: ({ record }) => {
      return [
      hasPermission(permission.edit)?h(
          Button,
          { type: 'link', size: 'small', onClick: () => editRow(record) },
          { default: () => '编辑' }
        ):null,
        hasPermission(permission.delete)?h(
          Popconfirm,
          { title: '确定要删除该项？', danger: true, onConfirm: () => { deleteRow(record) } },
          {
            default: () => h(
              Button,
              { type: 'link', size: 'small', danger: true },
              { default: () => '删除' }
            )
          }
        ):null
      ]
    }
  },
];
const getofficialSealPages = async () => {
  isLoading.value = true;
  const params = {
    sealName: formState.sealName,
    pageNumber: pagination.value.pageNumber,
    pageSize: pagination.value.pageSize,
  };
  try {
    const result = await getofficialSealPage(params);
    dataSource.value = result.data.records;
    pagination.value.total = result.data.total;
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
};
const handleSearch = () => {
  pagination.value.pageNumber = 1;
  getofficialSealPages();
};
onMounted(() => {
  getofficialSealPages();
});
const deleteRow = (row: any) => {
  Modal.confirm({
    title: "提示",
    content: "确定要删除该印章？",
    onOk: async () => {
      try {
        await deleteOfficialSeal(row.id);
        pagination.value.pageNumber = 1;
        getofficialSealPages();
        message.success("删除成功");
      } catch (error) {
      }
    },
  });
};
// 打开弹出框
const openModal = () => {
  modalTitle.value = "新增印章";
  visible.value = true;
};
const editRow = (row: any) => {
  modalTitle.value = "编辑印章";
  const rowState = { ...row };
  modalForm.value = rowState;
  visible.value = true;
};
// 弹出框点击确认
const handleOk = async () => {
  confirmLoading.value = true;
  let handleMethodMap = new Map<string, any>([
    ["新增印章", addSeal],
    ["编辑印章", editSeal],
  ]);

  try {
    await modalFormRef.value?.validateFields();
    await handleMethodMap.get(modalTitle.value)();
    confirmLoading.value = false;
    getofficialSealPages();
    visible.value = false;
    modalForm.value = {
      sealName: "",
      sealDesc: "",
    };
  } catch (error) {
    confirmLoading.value = false;
  }
};
const handleCancel = () => {
  modalForm.value = {
    sealName: "",
    sealDesc: "",
  };
};
const addSeal = async () => {
  const params = { ...modalForm.value };
  try {
    await addOfficialSeal(params);
  } catch (error: any) {
    // 错误处理
    if (error.code === 412) {
      const errorKeys = Object.keys(error.data.data);
      message.error(error.data.data[errorKeys[0]]);
    }
    return Promise.reject();
  }
};
const editSeal = async () => {
  const params = {
    ...modalForm.value,
  };
  await updateOfficialSeal(modalForm.value.id as string, params);
  message.success("编辑成功");
};
// 重置
const handleReset = () => {
  formState.sealName = "";
  pagination.value.pageNumber = 1;
  getofficialSealPages();
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
