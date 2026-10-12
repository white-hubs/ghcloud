<template>
  <div class="flow-table">
    <g-layout title="工单中心">

      <template #content-search>
        <a-form layout="inline" :model="form">
          <a-form-item label="发起时间" name="submitTime">
            <a-range-picker v-model:value="form.submitTime" value-format="YYYY-MM-DD" />
          </a-form-item>
          <a-form-item label="发起部门">
            <a-select v-model:value="form.organizationId" placeholder="请选择" style="width: 180px"
              :field-names="{ label: 'name', value: 'id' }" :options="deptOptions">
            </a-select>
          </a-form-item>
          <a-form-item label="业务类型" name="username">
            <a-select v-model:value="form.businessType" placeholder="请选择" style="width: 180px"
              :options="businessTypedeptOptions">
            </a-select>
          </a-form-item>
          <a-form-item label="" name="username">
            <a-input v-model:value="form.username" placeholder="请输入发起人名称" />
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
        <a-table :dataSource="dataSource" :columns="columns" :loading="isLoading" bordered :pagination="false"
          :scroll="{ x: 1000, y: 520 }" size="middle">
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'action'">
              <a-button type="link" @click="goDetail(record)">详情</a-button>
            </template>
          </template>
        </a-table>
      </template>
      <!-- <template #footer-page>
        <a-pagination show-size-changer v-if="page.total > 0" v-model:pageSize="page.pageSize"
          v-model:current="page.pageNumber" :total="page.total" @change="pageChange" :default-current="1"
          :show-total="(total: number) => `共 ${total} 条数据`"></a-pagination>
      </template> -->
    </g-layout>
  </div>
</template>
<script setup lang="ts">

import gLayout from "@/components/common/gLayout.vue"
import type { SelectProps, TableColumnsType } from "ant-design-vue"
import moment from "moment"
import {RouteRecordName, useRoute} from 'vue-router'
import {
  ComponentInternalInstance, computed, getCurrentInstance,
  onMounted,
  reactive,
  ref,
  watch
} from "vue"
import {usePageName} from '@/hooks/usePageName'
import { getOrganizationsList, getprocessPage } from '../api/ouua'
const route=useRoute()
const routerName=ref(route.name)
const { title }=usePageName()




const deptOptions=ref([])
// 主应用配置得子应用name
const applicantName = "governmentManagement";
 interface FormState {
  businessType:string
  submitTime:string[]
  pageNumber:number
  pageSize:number
  organizationId:string
  username:string
  total:number
  applicationCode:string
}
interface Props {
  /** 标题 */
  title?: string;
  flowCode?: string;
}
interface rowState {
  formNo: string;
  processInstanceId: string;
  startUserId: string;
  formInstanceId: number | null;
  startUserName: string;
  submitedTime: number;
  businessType:string,
  lastTaskCompletedTime: string | null;
  status: string;
  activeNodeName: string;
  currentTaskId: string;
  variables: any;
}
interface pageResult {
  data: {
    records: rowState[];
    total: number;
    pages?: number;
  };
}
const businessTypedeptOptions=ref([
{
  label:'全部',
value:''
},
{
  label:'事项审批',
value:'OFFICIAL_FOCUS_WORK'
},
{
  label:'处理审批',
value:'OFFICIAL_FOCUS_WORK_REPLY'
},
{
  label:'事项变更',
value:'OFFICIAL_FOCUS_WORK_UPDATE'
},
{
  label:'事项催办',
value:'OFFICIAL_URGENT_WORK'
},
{
  label:'制度征求',
value:'OFFICIAL_REGULATION'
},
{
  label:'议题预报',
value:'OFFICIAL_TOPIC'
},
{
  label:'用印申请',
value:'OFFICIAL_SEAL'
},
{
  label:'公文传阅',
value:'OFFICIAL_DOCUMENT_CIRCULATION'
},
{
  label:'来文处理',
value:'OFFICIAL_DOCUMENT_RECEIVED'
},
{
  label:'部门工作',
value:'OFFICIAL_KEY_WORK'
},

])
const props = withDefaults(defineProps<Props>(), {
  title: "",
  flowCode: "OFFICIAL_REGULATION", //流程code 用于跳转页面及获取表格数据
});
const columns: TableColumnsType = [
  {
    title: "编号",
    dataIndex: "formNo",
    key: "formNo",
    customRender: ({ text }) => {
      return text || "--";
    },
  },
  {
    dataIndex: "instanceName",
    title: "申请名称",
    slots: {
      customRender: "instanceName",
    },
    ellipsis: true,
    customRender: ({ text }) => {
      return text || "--"
    },
  },
  {
    title: "发起人",
    dataIndex: "startUserName",
    key: "startUserName",
    customRender: ({ text }) => {
      return text || "--";
    },
  },
  {
    dataIndex: "startUserInfo",
    title: "发起部门",
    slots: {
      customRender: "startUserInfo",
    },
    ellipsis: true,
    customRender: ({ text }) => {
      return text ? text.organizationName ?? '--' : "--"
    },
  },
  {
    title: "发起时间",
    dataIndex: "submitedTime",
    key: "submitedTime",
    customRender: ({ text }) => {
      return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--";
    },
  },
  {
    title: "处理状态",
    dataIndex: "status",
    key: "status",
    customRender: ({ text }) => {
      return text ? statusText(text) : "--";
    },
  },
  {
    title: "处理进度",
    dataIndex: "activeNodeName",
    key: "activeNodeName",
    customRender: ({ text }) => {
      return text || "--";
    },
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
  },
];

const statusText = (str: string) => {
  const statusMap = new Map([
    ["SUBMIT", "提交"],
    ["UNDO", "撤销"],
    ["REPEAT", "重新提交"],
    ["APPROVAL", "审批"],
    ["BACK", "撤回"],
    ["COPY", "抄送"],
    ["REJECT", "驳回"],
    ["FINISHED", "完成"],
  ]);
  return statusMap.get(str) || "处理中";
};

const isLoading = ref(false);
const options = ref();
let form = reactive<FormState>({
businessType: '',
submitTime: [],
pageNumber: 10,
pageSize: 1,
organizationId: '',
username: '',
total: 0,
applicationCode: ''
});



const handleReset = () => {
  Object.assign(form,{
businessType: '',
submitTime: [],
pageNumber: 10,
pageSize: 1,
organizationId: '',
username: '',
total:0
})
  getTableData();
};

const goDetail = (row: rowState) => {
  const { processInstanceId, currentTaskId, status ,businessType} = row;
  const target = `/portal/stream-engine-render/index?businessType=${businessType
    }&appName=${applicantName}&processInstanceId=${processInstanceId}&currentTaskId=${currentTaskId}&status=${status}&type=detail&title=${title.value}`
  history.pushState(history.state, "", target)
};

const handleSearch = () => {
  form.pageNumber = 10;
  getTableData()
}

const getTableData = async () => {
  const params = {
pageNumber: form.pageNumber,
pageSize: form.pageSize,
submitTime: form.submitTime.join(","),
businessType:form.businessType ,
organizationId: form.organizationId,
username: form.username,
total: form.total,
applicationCode:'OFFICIAL_MANAGEMENT'
};
  isLoading.value = true;
  try {
    const reslut: pageResult = (await getprocessPage(params)) as pageResult;
    const { records, total } = reslut.data;
    dataSource.value = records;
    form.total = total;
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
};
const pageChange = (pageNumber: number, pageSize: number) => {
  form.pageNumber = pageNumber;
  form.pageSize = pageSize;
  getTableData();
};
onMounted(async() => {
  const orgOption = await getOrganizationsList();
  deptOptions.value = orgOption.data;
  getTableData();
});
const dataSource = ref<rowState[]>([
 
]);
</script>
<style lang="less" scoped>
.flow-table {
  height: 100%;
}

:deep(.content-table) {
  padding-right: 2px;
  overflow: overlay !important;
}
</style>
