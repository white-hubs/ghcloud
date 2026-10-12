<template>
  <div class="flow-table">
    <g-layout :title="props.title">
      <template #header-btn>
        <Button type="primary" @click="addFlow">新增</Button>
      </template>
      <template #content-search>
        <Form layout="inline" :model="form">
          <FormItem>
            <RadioGroup v-model:value="form.type" style="marginright: 10px" button-style="solid"
              @change="handleTypeChange">
              <RadioButton value="ALL">全部</RadioButton>
              <RadioButton value="WAITING">待我处理</RadioButton>
              <RadioButton value="SUBMIT">我发起的</RadioButton>
              <RadioButton value="SERVED">抄送给我</RadioButton>
              <RadioButton value="PROCESSED">已处理</RadioButton>
            </RadioGroup>
          </FormItem>
          <FormItem label="状态" name="status" v-show="supportedFilter">
            <Select v-model:value="form.status" placeholder="请选择" style="width: 180px" :options="options">
            </Select>
          </FormItem>
          <FormItem label="发起时间" name="time">
            <RangePicker v-model:value="form.time as [string, string]" value-format="YYYY-MM-DD" />
          </FormItem>
          <FormItem>
            <Button type="primary" @click="handleSearch">查询</Button>
          </FormItem>
          <FormItem>
            <Button type="primary" @click="handleReset">重置</Button>
          </FormItem>
        </Form>
      </template>
      <template #content-table>
        <AliasTable 
          :dataSource="dataSource" 
          :columns="columns" 
          :loading="isLoading" 
          :pagination="false"
          :applicationCode="applicationCode"
          :tableCode="'FLOW_TABLE_LIST_'+props.flowCode"
          :scrollY="scrollY"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'action'">
              <Button type="link" @click="goDetail(record)">详情</Button>
            </template>
          </template>
        </AliasTable>
      </template>
      <template #footer-page>
        <Pagination show-size-changer v-if="page.total > 0" v-model:pageSize="page.pageSize"
          v-model:current="page.pageNumber" :total="page.total" @change="pageChange" :default-current="1"
          :show-total="(total: number) => `共 ${total} 条数据`"></Pagination>
      </template>
    </g-layout>
  </div>
</template>
<script setup lang="ts">
import { type flowPageState, getFlowProcessPage } from "../../api/flowConfig"
import gLayout from "../../components/common/gLayout.vue"
import type { RadioChangeEvent, SelectProps, TableColumnsType } from "ant-design-vue"
import dayjs from 'dayjs'
import {
computed,
  h,
onMounted,
reactive,
ref,
watch
} from "vue"
import { AliasTable } from "@ghcloud/generic-component"
import { Button } from 'ant-design-vue'
import { queryParameter } from "@ghcloud/cube-utils";

// 主应用配置得子应用name
const applicantName = "work-report"
const applicationCode = __ENV__.applicationCode
interface FormState {
  time: string[]
  type: string
  status: string|undefined
}
interface rowState {
  formNo: string
  processInstanceId: string
  startUserId: string
  formInstanceId: number | null
  startUserName: string
  submitedTime: number
  lastTaskCompletedTime: string | null
  status: string
  activeNodeName: string
  currentTaskId: string
  variables: any
}
interface pageResult {
  records: rowState[]
  total: number
  pages?: number
}
const props = withDefaults(defineProps<{
  title?: string
  flowCode?: string
}>(), {
  title: "",
  flowCode: "WORK_REPORT", //流程code 用于跳转页面及获取表格数据
})
const columns: TableColumnsType = [
  {
    title: "编号",
    dataIndex: "formNo",
    key: "formNo",
    customRender: ({ text }) => {
      return text || "-"
    },
  },
  {
    title: "发起人",
    dataIndex: "startUserName",
    key: "startUserName",
    customRender: ({ text }) => {
      return text || "-"
    },
  },
  {
    title: "发起时间",
    dataIndex: "submitedTime",
    key: "submitedTime",
    customRender: ({ text }) => {
      return text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-"
    },
  },
  {
    title: "处理状态",
    dataIndex: "status",
    key: "status",
    customRender: ({ text }) => {
      return text ? statusText(text) : "-"
    },
  },
  {
    title: "处理进度",
    dataIndex: "activeNodeName",
    key: "activeNodeName",
    customRender: ({ text }) => {
      return text || "-"
    },
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
    customRender: ({ record }) => {
      return h(Button, { type: "link", size: "small", onClick: () => goDetail(record) }, () => "查看")
    },
  },
]

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
  ])
  return statusMap.get(str) || "处理中"
}
const handleTypeChange = (e: RadioChangeEvent) => {
  form.type = (e.target as HTMLInputElement).value
  page.value.pageNumber = 1
  getTableData()
  queryParameter.setAddressQuery({
    ...form,
    ...{ pageSize: page.value.pageSize, pageNumber: page.value.pageNumber },
  });
}
const isLoading = ref(false)
const options = ref<SelectProps["options"]>([
  { value: "ACTIVE", label: "处理中" },
  { value: "REJECT", label: "驳回" },
  { value: "UNDO", label: "撤销" },
  { value: "FINISHED", label: "完成" },
])
let form = reactive<FormState>({
  type: "ALL",
  time: [],
  status: undefined,
})
const supportFilterStatus = ["ALL", "SUBMIT", "SERVED"]
const supportedFilter = computed(() => supportFilterStatus.includes(form.type))
const page = ref({
  pageSize: 10,
  pageNumber: 1,
  total: 1,
})
const scrollY=ref(500)
const handleReset = () => {
  form.type = "ALL"
  form.time = []
  form.status = ''
  queryParameter.setAddressQuery({
    ...form,
    ...{ pageSize: page.value.pageSize, pageNumber: page.value.pageNumber },
  });
  getTableData()
}
const addFlow = () => {
  const target = `/portal/stream-engine-render/index?businessType=${props.flowCode
    }&appName=${applicantName}&type=add&title=${props.title}`
  history.pushState(history.state, "", target)
}
const goDetail = (row: rowState) => {
  const { processInstanceId, currentTaskId, status } = row
  const target = `/portal/stream-engine-render/index?businessType=${props.flowCode
    }&appName=${applicantName}&processInstanceId=${processInstanceId}&currentTaskId=${currentTaskId}&status=${status}&type=detail&title=${props.title}`
  history.pushState(history.state, "", target)
}
watch(() => form.status, () => {
  handleSearch()
})
const handleSearch = () => {
  queryParameter.setAddressQuery({
    ...form,
    ...{ pageSize: page.value.pageSize, pageNumber: page.value.pageNumber },
  });
  page.value.pageNumber = 1
  getTableData()
}

const getTableData = async () => {
  const params: flowPageState = {
    pageNumber: page.value.pageNumber,
    pageSize: page.value.pageSize,
    type: form.type,
    status: form.status,
    submitTime: form.time.join(","),
    businessType: props.flowCode,
  }
  isLoading.value = true
  try {
    const { records, total } = (await getFlowProcessPage(params)) as pageResult
    dataSource.value = records
    page.value.total = total
    isLoading.value = false
  } catch (error) {
    isLoading.value = false
  }
  scrollY.value = document.querySelector('.content-right')!.clientHeight-document.querySelector('.content-search')!.clientHeight-50
}
const pageChange = (pageNumber: number, pageSize: number) => {
  page.value.pageNumber = pageNumber
  page.value.pageSize = pageSize
  getTableData()
}
onMounted(() => {
  Object.assign(form, {
    ...queryParameter.getQuery("time"),
  });
  Object.assign(page.value, queryParameter.getQuery());
  getTableData()
})
const dataSource = ref<rowState[]>([])
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
