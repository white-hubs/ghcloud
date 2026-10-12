<template>
  <div class="flow-table">
    <g-table ref="tableRef" tableCode="PROBLEMS_LIST" @reset="handleReset" :title="pageTitle" :beforeGet="beforeGet"
      :api="api" :search="search" :btns="[]" :columns="columns" bordered :scroll="{x:1500,y:scrollY}">
      <template #header-btns>
        <a-button type="primary" @click="addFlow">新增</a-button>
      </template>
      <template #pre-item="{record}">
        <a-form-item>
          <a-radio-group v-model:value="form.type" style="margin-right: 10px" @change="handleTypeChange"
            button-style="solid">
            <a-radio-button value="ALL">全部</a-radio-button>
            <a-radio-button value="WAITING">待我处理</a-radio-button>
            <a-radio-button value="SUBMIT">我发起的</a-radio-button>
            <a-radio-button value="SERVED">抄送给我</a-radio-button>
            <a-radio-button value="PROCESSED">已处理</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="状态" name="status" v-show="supportedFilter">
          <a-select allowClear v-model:value="form.status" placeholder="请选择" style="width: 180px" :options="options">
          </a-select>
        </a-form-item>
      </template>
    </g-table>
  </div>
</template>
<script setup>
import { repairList } from "../../../api/outsourcing.js";
import moment from "moment";
import { computed, h, onMounted, reactive, ref, watch, nextTick } from "vue";
import { Popover, Table, Button, message } from "ant-design-vue";
import { usePageName,queryParameter } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
const scrollY = ref(520);
const flowCode = "OUTSOURCE_REPAIR";
const tableRef = ref();
const dataSource = ref([]);
const api = {
  list: 'repairList'
}
const search = [
  {
    label: '发起时间',
    value: 'submitTime',
    component: 'a-range-picker',
    defaultDate: null,
  }
]
onMounted(()=>{
  Object.assign(form, queryParameter.getQuery());
})
/*获取table高度*/
const getScrollY = (data) => {
  const layoutContentHeight = document.getElementsByClassName("layout-content")[0];
  const contentSearchHeight = document.getElementsByClassName("content-search")[0];
  const contentDataHeight = document.getElementsByClassName("content-data")[0];
  const contentStatisticHeight = document.getElementsByClassName("statistic-data")[0];
  scrollY.value =
    layoutContentHeight.offsetHeight -
    contentSearchHeight.offsetHeight -
    contentDataHeight.offsetHeight -
    contentStatisticHeight.offsetHeight -
    50;
  const tableBody = document.getElementsByClassName("content-table")[0];
  tableBody.style.height = data && data.length === 0 ? "0px" : scrollY.value + "px";
};
const columns = [
  {
    title: "编号",
    dataIndex: "code",
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" });
    },
  },
  {
    dataIndex: "instanceName",
    title: "表单名称",
    ellipsis: true,
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" });
    },
  },
  {
    dataIndex: "objName",
    title: "委外对象",
    ellipsis: true,
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" });
    },
  },
  {
    title: "发起时间",
    dataIndex: "submitedTime",
    key: "submitedTime",
    customRender: ({ text }) => {
      const res = text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "-";
      return h(Popover, { content: res }, { default: () => res });
    },
  },
  {
    title: "发起人",
    dataIndex: "startUserName",
    key: "startUserName",
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" });
    },
  },
  {
    title: "处理状态",
    dataIndex: "status",
    key: "status",
    customRender: ({ text }) => {
      const res = text ? statusText(text) : "-";
      return h(Popover, { content: res }, { default: () => res });
    },
  },
  {
    title: "处理进度",
    dataIndex: "activeNodeName",
    key: "activeNodeName",
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" });
    },
  },
  {
    title: "处理结果",
    dataIndex: "handleResult",
    key: "handleResult",
    customRender: ({ text }) => {
      return h(Popover, { content: text || "--" }, { default: () => text || "--" });
    },
  },
  {
    title: "操作",
    dataIndex: "action",
    customRender: ({ text, record }) => {
      const btn = [
        h(
          Button,
          { type: "link", onClick: () => goDetail(record) },
          { default: () => "详情" }
        ),
      ];
      if (record.activeNodeAssignee === "381496") {
        btn.push(
          h(
            Button,
            { type: "link", onClick: () => copyLink(record) },
            { default: () => "生成审批链接" }
          )
        );
      }
      return h("div", btn);
    },
  },
];

const statusText = (str) => {
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
const handleTypeChange = (e) => {
  form.type = e.target.value;
  tableRef.value.searchRecord();
  queryParameter.setAddressQuery({
    ...form
  });
};
const beforeGet = (params) => {
  return {
    ...params,
    businessType: flowCode,
    type: form.type,
    status: form.status,
    submitTime: params.submitTime ? params.submitTime.map(item => moment(item).format('YYYY-MM-DD')).join(",") : '',
  }
}
const isLoading = ref(false);
const options = ref([
  { value: "ACTIVE", label: "处理中" },
  { value: "REJECT", label: "驳回" },
  { value: "UNDO", label: "撤销" },
  { value: "FINISHED", label: "完成" },
]);
let form = reactive({
  type: "ALL",
  time: [],
  status: null,
});
const supportFilterStatus = ["ALL", "SUBMIT", "SERVED"];
const supportedFilter = computed(() => supportFilterStatus.includes(form.type));
const handleReset = () => {
  form.type = "ALL";
  form.time = [];
  form.status = null;
  queryParameter.setAddressQuery({
    ...form
  });
};
const addFlow = () => {
  history.pushState(
    {},
    "",
    "/portal/stream-engine-render/index?businessType=OUTSOURCE_REPAIR&appName=OUTSOURCE_REPAIR&type=add&title=委外维修单"
  );
};
const goDetail = (row) => {
  const { processInstanceId, currentTaskId, status } = row;
  const target = `/portal/stream-engine-render/index?businessType=OUTSOURCE_REPAIR&processInstanceId=${processInstanceId}&currentTaskId=${currentTaskId}&status=${status}&type=detail&title=委外维修单`;
  history.pushState(history.state, "", target);
};
const copyLink = (row) => {
  const { processInstanceId } = row;
  const baseUrl = `${window.location.origin}/streamengineH5/dynamic-table`;
  const token = JSON.parse(sessionStorage.getItem("GH-Token")).access_token;
  const tenant = JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code;
  const url = `${baseUrl}?processId=${processInstanceId}&processType=HANDLING&access_token=${token}&tenant=${tenant}`;

  const input = document.createElement('input') // 创建input对象
  input.value = url // 设置复制内容
  document.body.appendChild(input) // 添加临时实例
  input.select() // 选择实例内容
  document.execCommand('Copy') // 执行复制
  document.body.removeChild(input) // 删除临时实例
  message.success('链接已复制到剪贴板')
};
watch(
  () => form.status,
  () => {
    tableRef.value.searchRecord();
  }
);


</script>
<style lang="less" scoped>
.flow-table {
  height: 100%;
}

:deep(.content-table) {
  padding-right: 2px;
  overflow: overlay !important;
}

:deep(.ant-table-placeholder) {
  border-bottom: 1px solid #f0f0f0 !important;
}

// :deep(.ant-table-placeholder){
//   margin-top: 3px;
// }</style>
