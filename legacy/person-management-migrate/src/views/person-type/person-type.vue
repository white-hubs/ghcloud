<template>
  <div class="posi_manage" ref="type_manage_ref">
    <gLayout :title="pageTitle">
      <template #header-btn>
        <a-button type="primary" @click="addType">新增</a-button>
      </template>
      <template #content-search>
        <a-form layout="inline" :model="form">
          <a-form-item>
            <a-input v-model:value="form.name" placeholder="请输入分类名称" allowClear style="width: 180px" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
          </a-form-item>
          <a-form-item>
            <a-button @click="handleReset">重置</a-button>
          </a-form-item>
        </a-form>
        <!--  -->
      </template>
      <template #content-table>
        <AliasTable 
          tableCode="PERSON_TYPE" 
          applicationCode="PERSONNELMANAGEMENT"
          :dataSource="dataSource" :columns="columns" :loading="isLoading" :pagination="false" bordered
          size="small">
        </AliasTable>
      </template>
      <template #footer-page>
        <a-pagination show-size-changer v-if="page.total > 0" v-model:pageSize="page.pageSize"
          v-model:current="page.pageNumber" @change="pageChange" :total="page.total" :default-current="1"
          :show-total="(total: number) => `共 ${total} 条数据`"></a-pagination>
      </template>
    </gLayout>
    <a-modal v-model:visible.sync="visible" :confirmLoading="modalLoading" :getContainer="() => $refs.type_manage_ref"
      destroyOnClose centered @cancel="handleCancel" @ok="handleOk" width="600px" :title="title + '分类'">
      <a-form :model="modalForm" :rules="modalFormRules" ref="modalFormRef">
        <a-form-item label="分类名称" name="name">
          <a-input v-model:value="modalForm.name" @keyup="modalForm.name = modalForm.name.replace(/\s+/g, '')"
            placeholder="请输入岗位" maxlength="20" />
        </a-form-item>
        <a-form-item label="岗位描述" name="remark">
          <a-textarea v-model:value="modalForm.remark" @keyup="modalForm.remark = modalForm.remark.replace(/\s+/g, '')"
            placeholder="请输入岗位描述" :auto-size="{ minRows: 5, maxRows: 10 }" maxlength="200" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script setup lang="ts">
// import { getAppointmentForPage, handleAppointment } from "@/api/index";
import gLayout from "@/components/common/gLayout.vue";
import type { FormInstance } from "ant-design-vue";
import { Button, message, Popconfirm, SelectProps, TableColumnsType } from "ant-design-vue";
import { Rule } from "ant-design-vue/lib/form";
import { h, onMounted, reactive, ref } from "vue";
import type {PersonCategory} from '@ghcloud/cube-personnel-management-service'
import {cubePersonnelManagementService} from '@/api/service'
import { AliasTable } from '@ghcloud/generic-component'
import { usePageName } from '@ghcloud/cube-utils'
interface FormState {
  name: string;
}
interface modalFormState {
  name: string;
  remark: string;
}

const columns: TableColumnsType = [
  {
    title: "类别名称",
    dataIndex: "name",
    key: "name",
    ellipsis: true,
  },
  {
    title: "类别描述",
    dataIndex: "remark",
    key: "remark",
    ellipsis: true,
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
    customRender: ({ record }) => {
      return [
      h(
          Button,
          { type: 'link', size: 'small', onClick: () => editType(record) },
          { default: () => '编辑' }
        ),
      h(
          Popconfirm,
          { title: '确定要删除该项？', danger: true, onConfirm: () => { handleDelete(record) } },
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
let form = reactive<FormState>({
  name: '',
});
const visible = ref(false);
const isLoading = ref(false);
const modalLoading = ref(false);
const { pageTitle } = usePageName()
const modalFormRef = ref<FormInstance>();
const modalFormRules: Record<string, Rule[]> = {
  name: [
    { required: true, message: "请输入岗位名称", trigger: "blur" },
    { pattern: new RegExp(/^[\a-\z\A-\Z0-9\u4e00-\u9fe5]+$/), message: '只能输入中文英文及数字', trigger: "blur" }
  ]
};
let modalForm = ref<modalFormState>({ name: "", remark: "" });
const title = ref("新增");
let page = reactive({
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});
const addType = () => {
  visible.value = true;
  title.value = "新增";
};
const pageChange = (pageNumber: number, pageSize: number) => {
  page.pageNumber = pageNumber;
  page.pageSize = pageSize;
  getDataList();
};
const editType = (row: modalFormState) => {
  const formRow = { ...row };
  modalForm.value = formRow;
  title.value = "编辑";
  visible.value = true;
};

const handleSearch = () => {
  page.pageNumber = 1;
  getDataList();
};
const handleReset = () => {
  form.name = '';
  page.pageNumber = 1;
  getDataList();
};
const handleCancel = () => {
  modalForm.value = {
    name: "",
    remark: "",
  };
  visible.value = false;
};
const handleDelete = async (row: PersonCategory) => {
  try {
    await cubePersonnelManagementService.deletePersonnelCategory({
      id: row.id,
    });
    getDataList();
  } catch (error : unknown ) {
    const {errorMessage}=error as {errorMessage:string}
    message.error(errorMessage);
  }
}
// 弹出框点击确认
const handleOk = async () => {
  try {
    const params = {
    ...modalForm.value,
    };  
    modalLoading.value = true;
    await modalFormRef.value?.validateFields();
    await cubePersonnelManagementService.createOrUpdatePersonnelCategory(params);
    modalLoading.value = false;
    getDataList();
    modalForm.value = {
      name: "",
      remark: "",
    };
    message.success("操作成功");
    visible.value = false;

  } catch (error) {
  }
 
};
const getDataList = async () => {
  const params = {
    pageNumber: page.pageNumber,
    pageSize: page.pageSize,
    name:form.name
  };
  isLoading.value = true;
  try {
    const result = await cubePersonnelManagementService.getPersonnelCategoryList(params)
    dataSource.value=result.records
    page.total=result.total
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
};
onMounted(() => {
  getDataList();
});
let dataSource = ref<PersonCategory[]>([]);
</script>
<style lang="less" scoped>
.posi_manage {
  height: 100%;
  width: 100%;
}
</style>
