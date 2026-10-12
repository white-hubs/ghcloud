<template>
  <div class="posi_manage" ref="posi_manage_ref">
    <gLayout :title="pageTitle">
      <template #header-btn>
        <a-button type="primary" @click="addPosi">新增</a-button>
      </template>
      <template #content-search>
        <a-form layout="inline" :model="form">
          <a-form-item label="状态">
            <a-select v-model:value="form.status" placeholder="请选择" allowClear style="width: 180px" :options="options">
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleReset">重置</a-button>
          </a-form-item>
        </a-form>
        <!--  -->
      </template>
      <template #content-table>
        <a-table :dataSource="dataSource" :columns="columns" :loading="isLoading" :pagination="false"
          :scroll="{ x: 1000, y: 520 }" size="middle">
          <template #bodyCell="{ column, text, record, index }">
            <template v-if="column.key === 'enable'">
              <a-switch v-model:checked="record[column.key]" :checkedValue="true" :unCheckedValue="false"
                @change="(checked: boolean) => changeSwitch(checked, record.id, index)" />
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" @click="editPosi(record)">编辑</a-button>
            </template>
          </template>
        </a-table>
      </template>
      <template #footer-page>
        <a-pagination show-size-changer v-if="page.total > 0" v-model:pageSize="page.pageSize"
          v-model:current="page.pageNumber" @change="pageChange" :total="page.total" :default-current="1"
          :show-total="(total: number) => `共 ${total} 条数据`"></a-pagination>
      </template>
    </gLayout>
    <a-modal v-model:visible.sync="visible" :getContainer="() => $refs.posi_manage_ref" destroyOnClose centered
      @cancel="handleCancel" @ok="handleOk" width="600px" :title="title + '岗位'">
      <a-form :model="modalForm" :rules="modalFormRules" ref="modalFormRef">
        <a-form-item label="岗位名称" name="name">
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
import { getAppointmentForPage, handleAppointment } from "@/api/index";
import gLayout from "@/components/common/gLayout.vue";
import type { FormInstance } from "ant-design-vue";
import { message, SelectProps, TableColumnsType } from "ant-design-vue";
import { Rule } from "ant-design-vue/lib/form";
import moment from "moment";
import { onMounted, reactive, ref } from "vue";
import { useTitle } from '../hooks/useTitle';
interface FormState {
  status: string | null;
}
interface modalFormState {
  name: string;
  remark: string;
}

const options: SelectProps["options"] = [
  { value: "1", label: "启用" },
  { value: "0", label: "禁用" },
];
const columns: TableColumnsType = [
  {
    title: "岗位名称",
    dataIndex: "name",
    key: "name",
    ellipsis: true,
  },
  {
    title: "岗位描述",
    dataIndex: "remark",
    key: "remark",
    ellipsis: true,
    customRender: ({ text }) => {
      return text || "-";
    },
  },
  {
    title: "最近一次编辑时间",
    dataIndex: "updateTime",
    key: "updateTime",
    customRender: ({ text }) => {
      return moment(text).format("YYYY-MM-DD HH:mm:ss");
    },
  },
  {
    title: "状态",
    dataIndex: "enable",
    key: "enable",
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
  },
];
let form = reactive<FormState>({
  status: null,
});
const visible = ref(false);
const isLoading = ref(false);
const pageTitle=useTitle()
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
const addPosi = () => {
  visible.value = true;
  title.value = "新增";
};
const pageChange = (pageNumber: number, pageSize: number) => {
  page.pageNumber = pageNumber;
  page.pageSize = pageSize;
  getAppointmentPage();
};
const changeSwitch = async (checked: boolean, id: string, index: number) => {
  const params = {
    ...dataSource.value[index],
  };
  isLoading.value = true;
  await handleAppointment(params);
  message.success("操作成功");
  isLoading.value = false;
  dataSource.value[index].enable = checked;
};
const editPosi = (row: modalFormState) => {
  const formRow = { ...row };
  modalForm.value = formRow;
  title.value = "编辑";
  visible.value = true;
};

const handleSearch = () => {
  page.pageNumber = 1;
  getAppointmentPage();
};
const handleReset = () => {
  form.status = null;
  page.pageNumber = 1;
  getAppointmentPage();
};
const handleCancel = () => {
  modalForm.value = {
    name: "",
    remark: "",
  };
  visible.value = false;
};
// 弹出框点击确认
const handleOk = async () => {
  const params = {
    ...modalForm.value,
  };
  await modalFormRef.value?.validateFields();
  await handleAppointment(params);
  getAppointmentPage();
  modalForm.value = {
    name: "",
    remark: "",
  };
  message.success("操作成功");
  visible.value = false;
};
interface rowState {
  name: string;
  remark: string;
  updateTime: string;
  enable: boolean;
}
const getAppointmentPage = async () => {
  const params = {
    pageNumber: page.pageNumber,
    pageSize: page.pageSize,
    enable:
      form.status === null ? form.status : form.status === "0" ? false : true,
  };
  isLoading.value = true;
  try {
    const reslut: personnelManagement.successResult =
      (await getAppointmentForPage(
        params
      )) as personnelManagement.successResult;
    const { records, total } = reslut.data;
    dataSource.value = records as rowState[];
    page.total = total;
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
};
onMounted(() => {
  getAppointmentPage();
});
let dataSource = ref<rowState[]>([
  {
    name: "岗位",
    remark: "描述",
    updateTime: "2022-11-11",
    enable: true,
  },
]);
</script>
<style lang="less" scoped>
.posi_manage {
  height: 100%;
  width: 100%;
}
</style>
