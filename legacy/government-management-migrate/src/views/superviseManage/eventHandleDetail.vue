<template>
  <!-- <div>事件处理详情</div> -->
  <div class="event-handle-detail">
    <g-layout title="事项详情">
      <template #header-btn>
        <a-button type="primary" @click="printRef.print()">打印</a-button>
      </template>
      <template #content-table>
        <a-tabs v-model:activeKey="activeKey" type="card" @change="changeTabs">
          <a-tab-pane key="1" tab="事项信息">
            <div class="basic-info">
              <!-- 基本情况 -->
              <g-vertical-line title="基本信息"></g-vertical-line>
              <div class="info">
                <a-row>
                  <a-col :span="item.span" v-for="item in basicPropsForLabel" :key="item.prop">
                    <div class="item">
                      <label>{{ item.label }}：</label>
                      <span>{{ focusWork[item.prop] || "--" }}</span>
                    </div>
                  </a-col>
                </a-row>
              </div>
              <!-- 处理情况 -->
              <g-vertical-line title="当前处理情况"></g-vertical-line>
              <div class="info">
                <a-row>
                  <a-col :span="item.span" v-for="item in handlePropsForLabel" :key="item.prop">
                    <div class="item">
                      <label>{{ item.label }}：</label>
                      <span>{{ focusWorkReply[item.prop] || "--" }}</span>
                    </div>
                  </a-col>
                </a-row>
              </div>
              <!-- 处理情况 -->
              <div v-if="focusWorkFail">
                <g-vertical-line title="未完成回复"></g-vertical-line>
                <div class="info">
                  <a-row>
                    <a-col :span="item.span" v-for="item in resultPropsForLabel" :key="item.prop">
                      <div class="item">
                        <label>{{ item.label }}：</label>
                        <span v-if="item.prop==='fileList'">
                          <file-upload readonly v-model:value="focusWorkFail[item.prop]" />
                        </span>
                        <span v-else>{{ focusWorkFail[item.prop] || "--" }}</span>
                      </div>
                    </a-col>
                  </a-row>
                </div>
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="2" tab="反馈记录">
            <a-table :dataSource="dataSource" :columns="columns" :pagination="false" size="middle" bordered />
          </a-tab-pane>
        </a-tabs>
      </template>
      <template #footer-page>
        <a-button @click="goBack">返回</a-button>
        <span v-if="userId.firstUserId.includes(userid) ||userId.secondUserId.includes(userid)">
          <a-button type="primary" @click="handleFeedback" v-if="['PROCESSING'].includes(focusWork.status)">反馈</a-button>
        </span>
      </template>
    </g-layout>
    <print ref="printRef" />
  </div>
</template>
<script setup lang="ts">
import { getFocusWorkDetail, getFocusWorkReply } from "@/api/superviseManage";
import gLayout from "@/components/common/gLayout.vue";
import GVerticalLine from "@/components/common/gVerticalLine.vue";
import fileUpload from '@/components/common/file-upload.vue';
import print from "@/components/print.vue";
import { TableColumnsType,Popover } from "ant-design-vue";
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'

import moment from "moment";
import {
onMounted,
reactive,
ref,
h
} from "vue";
import { useRoute, useRouter } from "vue-router";
const router = useRouter();
const route = useRoute();
const printRef = ref();
const { id } = route.query;

const activeKey = ref("1");
type typeResult = { [key: string]: any };
const focusWork = ref<typeResult>({});
const focusWorkReply = ref<typeResult>({});
const focusWorkFail=ref<typeResult|null>({});
interface propsForLabelItem {
  span: number;
  label: string;
  prop: string;
}

// 基本信息字段对应Prop
const basicPropsForLabel: propsForLabelItem[] = [
  {
    span: 12,
    label: "督办事项",
    prop: "workDesc",
  },
  {
    span: 12,
    label: "督办任务下发人",
    prop: "applicantName",
  },
  {
    span: 24,
    label: "工作要求",
    prop: "requirement",
  },
  {
    span: 12,
    label: "责任部门",
    prop: "deptName",
  },
  {
    span: 12,
    label: "第一责任人",
    prop: "firstUserName",
  },
  {
    span: 12,
    label: "第二责任人",
    prop: "secondUserName",
  },
  {
    span: 12,
    label: "完成时限",
    prop: "completeTime",
  },
];
// 处理情况对应prop
const handlePropsForLabel: propsForLabelItem[] = [
  {
    span: 12,
    label: "完成进度",
    prop: "percentage",
  },
  {
    span: 12,
    label: "完成时间",
    prop: "applyDoneTime",
  },
  {
    span: 24,
    label: "下一步工作描述",
    prop: "nextWorkDesc",
  },
  {
    span: 24,
    label: "未完成原因",
    prop: "undoneReason",
  },
  {
    span: 24,
    label: "需要协调的问题",
    prop: "assistProblem",
  },
];
// 未完成回复
const resultPropsForLabel: propsForLabelItem[] = [
{
    span: 12,
    label: "原因",
    prop: "failReason",
  },
  {
    span: 12,
    label: "文件",
    prop: "fileList",
  }
]
const goBack = () => {
  router.back()
};

const handleFeedback = () => {
  let detailId = id;
  if (!detailId) {
    detailId = sessionStorage.getItem("detailId");
  }
  sessionStorage.setItem("detailId", detailId as string);
  const target = `/portal/stream-engine-render/index?businessType=OFFICIAL_FOCUS_WORK_REPLY&appName=governmentManagement&type=add&title=事项反馈&businessKey=${id}`
  history.pushState(history.state, "", target)
};
const userId=reactive<{
  secondUserId:string[]
  firstUserId:string[]
}>({
  firstUserId:[],
  secondUserId:[]

})
const getDetail = async () => {
  let detailId = id;
  if (!detailId) {
    detailId = sessionStorage.getItem("detailId");
    sessionStorage.removeItem("detailId");
  }
  const detail = await getFocusWorkDetail(detailId as string);
  focusWork.value = detail.data.focusWork;
  Object.assign(userId,{
    firstUserId:focusWork.value.firstUserId.split(','),
    secondUserId:focusWork.value.secondUserId.split(',')
  })
  // 处理时间
  focusWork.value.completeTime = moment(
    detail.data.focusWork.completeTime
  ).format("YYYY-MM-DD HH:mm:ss");
  focusWorkReply.value = detail.data.focusWorkReply;
  focusWorkReply.value.percentage = detail.data.focusWorkReply.percentage + "%";
  focusWorkReply.value.applyDoneTime = detail.data.focusWorkReply.applyDoneTime
    ? moment(detail.data.focusWorkReply.applyDoneTime).format(
      "YYYY-MM-DD HH:mm:ss"
    )
    : "--";
    focusWorkFail.value=detail.data.focusWorkFail
};
const getFeedback = async () => {
  let detailId = id;
  if (!detailId) {
    detailId = sessionStorage.getItem("detailId");
  }
  const feedBackLog = await getFocusWorkReply(detailId as string);
  dataSource.value = feedBackLog.data;
};
const columns: TableColumnsType = [
  {
    title: "姓名",
    dataIndex: "applicantName",
    key: "applicantName",
  },
  {
    title: "部门",
    dataIndex: "applicantDeptName",
    key: "applicantDeptName",
  },
  {
    title: "反馈时间",
    dataIndex: "applyTime",
    key: "applyTime",
    customRender: ({ text }) => {
      return moment(text).format("YYYY-MM-DD HH:mm:ss");
    },
  },
  {
    title: "完成进度",
    dataIndex: "percentage",
    key: "percentage",
    customRender: ({ text }) => {
      return text + '%';
    },
  },
  {
    title: "反馈审批时间",
    dataIndex: "applyDoneTime",
    key: "applyDoneTime",
    customRender: ({ text }) => {
      return moment(text).format("YYYY-MM-DD HH:mm:ss");
    },
  },
  {
    title: "下一步工作描述",
    dataIndex: "nextWorkDesc",
    key: "nextWorkDesc",
    width:250,
    ellipsis:true,
    customRender: ({ text }) => {
      return  h(Popover, { content: text || '--' }, text || '--')
    },
  },
  {
    title: "未完成原因",
    dataIndex: "undoneReason",
    key: "undoneReason",
    width:'250px',
    ellipsis:true,
    customRender: ({ text }) => {
      return h(Popover, { content: text || '--' }, text || '--')
    },
  },
  {
    title: "需要协调的问题",
    dataIndex: "assistProblem",
    key: "assistProblem",
    width:'200px',
    ellipsis:true,
    customRender: ({ text }) => {
      return h(Popover, { content: text || '--' }, text || '--')
    },
  },
];
type keyForFunction = { [key: string]: () => void };
const changeTabs = (key: string) => {
  const tabForMethod: keyForFunction = {
    "1": getDetail,
    "2": getFeedback,
  };
  tabForMethod[key]();
};
const userid=ref<string>('')
onMounted(() => {
  userid.value = JSON.parse(sessionStorage.getItem("GH-UserInfo") as any).id;

  
  getDetail();
});
const dataSource = ref([]);
</script>
<style lang="less" scoped>
:deep(.ant-tabs-content-holder) {
  overflow-y: auto !important;
}

.event-handle-detail {
  width: 100%;
  height: 100%;

  .basic-info {
    padding: 40px;

    .info {
      padding: 20px;

      .item {
        margin-bottom: 20px;
        display: flex;

        :deep(.ant-upload-list-item) {
          margin-top: 0px !important;
        }

        label {
          flex-shrink: 0;
          width: 120px;
          display: inline-block;
          text-align: right;
        }

        span {
          padding: 0 10px;
          word-break: break-all;
        }
      }
    }
  }
}
</style>
