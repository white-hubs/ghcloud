<template>
  <div class="flow-table">
    <g-layout :title="pageTitle">
      <template #content-search>
        <a-form layout="inline" :model="form">
          <a-form-item label="事项状态">
            <a-select v-model:value="form.status" placeholder="请选择" style="width: 180px" :options="options">
            </a-select>
          </a-form-item>
          <a-form-item label="责任部门">
            <a-select v-model:value="form.deptId" placeholder="请选择" style="width: 180px"
              :field-names="{ label: 'name', value: 'id' }" :options="deptOptions">
            </a-select>
          </a-form-item>
          <a-form-item label="第一责任人">
            <a-select v-model:value="form.firstUserId" placeholder="请选择" :field-names="{ label: 'name', value: 'id' }"
              style="width: 180px" :options="firstUserOptions">
            </a-select>
          </a-form-item>
          <a-form-item label="完成时间">
            <a-range-picker v-model:value="form.period" value-format="YYYY-MM-DD" />
          </a-form-item>
          <a-form-item>
            <a-input v-model:value="form.keyword" placeholder="请输入事项名称" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
          </a-form-item>
          <a-form-item>
            <a-button @click="handleReset">重置</a-button>
          </a-form-item>
        </a-form>
      </template>
      <template #content-table>
        <AliasTable 
          tableCode="EVENT_HANDLE" 
          applicationCode="OFFICIAL_MANAGEMENT" :dataSource="dataSource" :columns="columns" :pagination="false" :loading="isLoading" bordered
          :scrollX="1000" size="middle">
        </AliasTable>
      </template>
      <template #footer-page>
        <a-pagination show-size-changer v-if="page.total > 0" v-model:pageSize="page.pageSize"
          v-model:current="page.pageNumber" :total="page.total" :default-current="1" @change="pageChange"
          :show-total="(total: number) => `共 ${total} 条数据`"></a-pagination>
      </template>
    </g-layout>
    <a-modal v-model:visible.sync="visible" destroyOnClose :confirm-loading="confirmLoading" centered
      @cancel="handleCancel" @ok="handleOk" width="600px" title="回复">
      <a-row style="margin-bottom: 16px;">
        <a-col span="12">
          <div style="display: flex;">
            <label style="width: 80px;text-align: right;margin-right: 10px;">督办事项：</label> {{ checkData.workDesc }}
          </div>
        </a-col>
        <a-col span="12">
          <div style="display: flex;">
            <label style="margin-right: 10px;flex-shrink: 0;">完成进度情况：</label> {{
            checkData.percentage?`${checkData.percentage}%`:'--' }}
          </div>
        </a-col>

      </a-row>
      <a-row style="margin-bottom: 16px;">
        <a-col span="12">
          <div style="display: flex;">
            <label style="width: 80px;text-align: right;margin-right: 10px;">状态：</label> {{ STATUS[checkData.status as
            SuperviseMangagement.TYPES] }}
          </div>
        </a-col>
      </a-row>
      <a-form :model="modalForm" :rules="modalFormRules" ref="modalFormRef">
        <a-form-item label="附件" name="fileList">
          <file-upload :sceneCode="GLOBAL_SCENE_CODE.officialWorkFail" v-model:value="modalForm.fileList" />
        </a-form-item>
        <a-form-item label="未完成原因" name="failReason">
          <a-textarea v-model:value="modalForm.failReason"
            @keyup="modalForm.failReason = modalForm.failReason.replace(/\s+/g, '')" placeholder="请输入事项描述"
            maxlength="200" :auto-size="{ minRows: 5, maxRows: 10 }" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script setup lang="ts">
import { getOrganizationsList } from "@/api/ouua";
import {
  getFirstUsersOption,
  getFocusWorkHandleApprovalList,
  replyFocusWorkHandle,
  getreplyFocusWorkContent
} from "@/api/superviseManage";
import gLayout from "@/components/common/gLayout.vue";
import fileUpload from '@/components/common/file-upload.vue';
import { Button, message, type SelectProps, type TableColumnsType } from "ant-design-vue";
import { FormInstance, Rule } from "ant-design-vue/es/form";
import {
h,
  onMounted,
  reactive,
  ref,
} from "vue";
import type {OSSFile} from '@/api/file/index'
import { useRouter } from "vue-router";
import { queryParameter } from "@ghcloud/cube-utils";
import { appFunctionCodes } from '@/permission'
import { AliasTable } from '@ghcloud/generic-component'
import { hasPermission } from '@ghcloud/cube-permission-codes'
import { usePageName } from '@ghcloud/cube-utils'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
interface modalFormState {
  failReason: string;
  fileList: OSSFile[];
  id: string;
}
const { pageTitle } = usePageName()
const router = useRouter();
const permission=appFunctionCodes.officialEventHandle
const modalFormRules: Record<string, Rule[]> = {
  failReason: [
    { pattern: new RegExp(/^[\a-\z\A-\Z0-9\u4e00-\u9fe5]+$/), message: '只能输入中文英文及数字', trigger: "blur" },
    { required: true, message: "请输入未完成原因", trigger: "blur" },
  ],
};
const path = window.location.pathname.split("/").reverse()[0];
let modalForm = ref({} as modalFormState);
const modalFormRef = ref<FormInstance>();
const visible = ref(false);
const confirmLoading = ref(false);
const checkData=ref<any>({})

enum STATUS {
  "UNDONE" = "未完成",
  "STOP" = "已终止",
  "PROCESSING" = "处理中",
  "FINISH" = "已完成",
}
interface FormState {
  period: string[];
  name: string | null;
  deptId: string | null;
  firstUserId: string | null;
  status: string | null;
  keyword: string | null;
}
const columns: TableColumnsType = [
  {
    title: "督办事项",
    dataIndex: "workDesc",
    key: "workDesc",
    ellipsis: true,
    width: 200,
    customRender: ({ text }) => {
      return text || "--";
    },
  },
  {
    title: "督办任务下发人",
    dataIndex: "focusWorkStarter",
    key: "focusWorkStarter",
    ellipsis: true,
    width: 200,
    customRender: ({ text }) => {
      return text || "--";
    },
  },
  {
    title: "工作要求",
    dataIndex: "requirement",
    key: "requirement",
    ellipsis: true,
    customRender: ({ text }) => {
      return text || "--";
    },
  },
  {
    title: "责任部门",
    dataIndex: "deptName",
    key: "deptName",
    customRender: ({ text }) => {
      return text || "--";
    },
  },
  {
    title: "第一责任人",
    dataIndex: "firstUserName",
    key: "firstUserName",
    customRender: ({ text }) => {
      return text || "--";
    },
  },
  {
    title: "第二责任人",
    dataIndex: "secondUserName",
    key: "secondUserName",
    customRender: ({ text }) => {
      return text || "--";
    },
  },
  {
    title: "完成时限",
    dataIndex: "completeTimeStr",
    key: "completeTimeStr",
    ellipsis: true,
    customRender: ({ text }) => {
      return text || "--";
    },
  },
  {
    title: "变更后时限",
    dataIndex: "updateCompleteTimeStr",
    key: "updateCompleteTimeStr",
    ellipsis: true,
    customRender: ({ text }) => {
      return text || "--";
    },
  },
  {
    title: "事项状态",
    dataIndex: "status",
    key: "status",
    customRender: ({ text }) => {
      return STATUS[text as SuperviseMangagement.TYPES];
    },
  },
  {
    title: "距超期",
    dataIndex: "timeLimitDesc",
    key: "timeLimitDesc",
    customRender: ({ text }) => {
      return text || "--";
    },
  },
  {
    title: "完成进度情况",
    dataIndex: "percentage",
    key: "percentage",
    customRender: ({ text }) => {
      return text ? `${text}%` : "--";
    },
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
    customRender: ({ record }) => {
      return [
      hasPermission(permission.details)?h(
          Button,
          { type: 'link', size: 'small', onClick: () => handleDetail(record) },
          { default: () => '详情' }
        ):null,
        (record.firstUserId.split(',').includes(userid) ||record.secondUserId.split(',').includes(userid))&&
        ['PROCESSING'].includes(record.status)&&hasPermission(permission.feedback)?h(
          Button,
          { type: 'link', size: 'small', onClick: () => handleFeedback(record) },
          { default: () => '反馈' }
        ):null,
        ((record.firstUserId.split(',').includes(userid) ||record.secondUserId.split(',').includes(userid))&&record.status==='UNDONE')
        &&hasPermission(permission.feedback)?h(
          Button,
          { type: 'link', size: 'small', onClick: () => handleReply(record) },
          { default: () => '回复' }
        ):null,
      ]
    }
  },
];
const pageChange = (pageNumber: number, pageSize: number) => {
  page.value.pageNumber = pageNumber;
  page.value.pageSize = pageSize;
  getTableData();
};
const handleCancel = () => {
  modalForm.value = {
    failReason: '',
    fileList: [],
    id:'',
  };
  visible.value=false
};
const handleOk =async () => {
  try {
    confirmLoading.value=true
  await replyFocusWorkHandle({focusWorkId:checkData.value.id,failReason:modalForm.value.failReason,fileIds:modalForm.value.fileList.map(item=>item.id).join(',')})
  message.success('回复成功')
  visible.value = false
  } finally  {
    confirmLoading.value=false
  }

}
const handleReply=async (item: any)=>{
  const {data} = await getreplyFocusWorkContent(item.id)
  if(data){
    modalForm.value.failReason=data.failReason
    modalForm.value.fileList=data.fileList
  }
  checkData.value = item
  visible.value = true
}
const getTableData = async () => {
  isLoading.value = true;
  const params = {
    period: form.period.join(","),
    status: form.status,
    deptId: form.deptId,
    firstUserId: form.firstUserId,
    pageNumber: page.value.pageNumber,
    pageSize: page.value.pageSize,
    keyword: form.keyword,
  };

  const result = await getFocusWorkHandleApprovalList(params);
  dataSource.value = result.data.records;
  page.value.total = result.data.total;
  isLoading.value = false;
};
const handleFeedback = (record: any) => {
  const target = `/portal/stream-engine-render/index?businessType=OFFICIAL_FOCUS_WORK_REPLY&appName=governmentManagement&type=add&title=${pageTitle}&businessKey=${record.id}`;
  history.pushState(history.state, "", target);
};
const options = ref<SelectProps["options"]>([
  { value: "UNDONE", label: STATUS.UNDONE },
  { value: "STOP", label: STATUS.STOP },
  { value: "PROCESSING", label: STATUS.PROCESSING },
  { value: "FINISH", label: STATUS.FINISH },
]);
const deptOptions = ref<SelectProps["options"]>([]);
const isLoading = ref(false);
const firstUserOptions = ref<SelectProps["options"]>([]);
let form = reactive({
  period: [],
  status: null,
  deptId: null,
  firstUserId: null,
  keyword: null,
  name: null,
} as FormState);
const page = ref({
  pageSize: 10,
  pageNumber: 1,
  total: 1,
});
const userid = ref<string>("");
onMounted(async () => {
  Object.assign(form, queryParameter.getQuery("period"));
  Object.assign(page.value, queryParameter.getQuery());
  userid.value = JSON.parse(sessionStorage.getItem("GH-UserInfo") as any).id;
  const orgOption = await getOrganizationsList();
  const firstUserOptionList = await getFirstUsersOption();
  firstUserOptions.value = firstUserOptionList.data;
  deptOptions.value = orgOption.data;
  getTableData();
});
const handleSearch = () => {
  queryParameter.setAddressQuery({
    ...form,
    pageNumber: page.value.pageNumber,
    pageSize: page.value.pageSize,
  });
  page.value.pageNumber = 1;
  getTableData();
};
const handleReset = () => {
  form.deptId = null;
  form.firstUserId = null;
  form.name = null;
  form.period = [];
  form.status = null;
  form.keyword = null;
  page.value.pageNumber = 1;
  queryParameter.setAddressQuery({
    ...form,
    pageNumber: page.value.pageNumber,
    pageSize: page.value.pageSize,
  });
  getTableData();
};
const handleDetail = (row: SuperviseMangagement.rowState) => {
  const target = `/portal/governmentManagement/eventHandleDetail?id=${row.id}`;
  history.pushState(history.state, "", target);
};
const dataSource = ref([]);
</script>
<style lang="less" scoped>
:deep(.content-table) {
  padding-right: 2px;
  overflow: overlay !important;
}



.flow-table {
  width: 100%;
  height: 100%;
}
</style>
