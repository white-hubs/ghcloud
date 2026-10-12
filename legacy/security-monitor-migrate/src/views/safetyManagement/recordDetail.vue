<template>
  <div class="content flex-column">
    <div class="detail-container">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="patrolRecord" tab="巡逻记录">
          <div class="pane-header">
            <g-vertical-line title="基本信息"></g-vertical-line>
          </div>
          <div class="pane-content">
            <a-row :gutter="[16, 8]">
              <a-col :span="8">
                <span>
                  巡逻时间：{{
                    detail.patrolTime
                      ? moment(detail.patrolTime).format("YYYY-MM-DD HH:mm:ss")
                      : "--"
                  }}
                </span>
              </a-col>
              <a-col :span="8">
                <span>路线名称：{{ detail.cameraPatrolLineName }}</span>
              </a-col>
              <a-col :span="8">
                <span>巡逻点数：{{ detail.num }}</span>
              </a-col>
              <a-col :span="8">
                <span>本次巡逻点数：{{ detail.completeNum }}</span>
              </a-col>
              <a-col :span="8">
                <span>巡逻人员：{{ detail.userName }}</span>
              </a-col>
              <a-col :span="8">
                <span>任务耗时：{{ detail.duration }}</span>
              </a-col>
            </a-row>
          </div>
          <div class="pane-header">
            <g-vertical-line title="巡逻记录"></g-vertical-line>
          </div>
          <div class="pane-content">
            <a-table
              :pagination="false"
              :columns="dataColumns"
              :data-source="dataSource"
              bordered
              size="middle"
            ></a-table>
          </div>
        </a-tab-pane>
        <a-tab-pane key="abnormal" tab="异常情况">
          <div class="pane-header">
            <g-vertical-line title="异常情况"></g-vertical-line>
          </div>
          <div class="pane-content">
            <a-table
              :pagination="false"
              :columns="tableColumns"
              :data-source="tableData"
              bordered
              size="middle"
            >
              <template #filePathList="{ record }">
                <a-image
                  :width="100"
                  v-for="(item, index) in record.filePathList"
                  :src="
                    serveIp == 'http:'
                      ? item.intranetFilePath + '?session=' + session
                      : item.extranetFilePath + '?session=' + session
                  "
                  :key="index"
                ></a-image>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
    <div class="footer-btn">
      <a-button @click="back">返回</a-button>
    </div>
  </div>
</template>

<script lang="jsx">
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs } from "vue";
import { useRoute, useRouter } from "vue-router";
import { patrolStatus } from "@/utils/enumerate";
import moment from "moment";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const { id } = route.query;
    const state = reactive({
      session: window.videoSession,
      serveIp: window.location.protocol,
      activeKey: "patrolRecord",
      dataColumns: [
        {
          dataIndex: "sort",
          title: "巡逻序号",
        },
        {
          dataIndex: "deviceName",
          title: "设备名称",
        },
        {
          dataIndex: "areaNames",
          title: "所属区域",
        },
        {
          dataIndex: "status",
          title: "巡逻状态",
          slots: {
            customRender: "status",
          },
          customRender: ({ text }) => {
            return patrolStatus[text];
          },
        },
        {
          dataIndex: "abnormalNum",
          title: "异常数",
        },
      ],
      dataSource: [],
      tableColumns: [
        {
          dataIndex: "sort",
          title: "巡逻序号",
        },
        {
          dataIndex: "remark",
          title: "异常情况说明",
          slots: {
            customRender: "remark",
          },
          customCell: () => {
            return {
              style: {
                wordWrap: "break-word",
                wordBreak: "break-all",
                whiteSpace: "normal",
                minHeight: "50px",
              },
            };
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text}</PopOver>;
          },
        },
        {
          dataIndex: "filePathList",
          title: "现场照片",
          slots: {
            customRender: "filePathList",
          },
        },
        {
          dataIndex: "deviceName",
          title: "巡逻点",
        },
      ],
      tableData: [],
      detail: {},
    });
    onMounted(() => {
      getPatrolRecordDetail();
      getRecordList();
      getPatrolAbnormalList();
    });
    // 记录详情
    const getPatrolRecordDetail = async () => {
      const data = await proxy.$api.patrolRecordId({ id: id });
      if (data) {
        state.detail = data;
      }
    };
    const getRecordList = async () => {
      const data = await proxy.$api.patrolRecordList("get", { id: id });
      if (data) {
        state.dataSource = data;
      }
    };
    // 异常记录
    const getPatrolAbnormalList = async () => {
      const data = await proxy.$api.getPatrolAbnormalList({ id: id });
      if (data) {
        state.tableData = data;
      }
    };
    const back = () => {
      history.back();
      // router.back();
    };
    return {
      ...toRefs(state),
      back,
      moment: moment,
    };
  },
});
</script>

<style lang="less" scoped>
.content {
  height: 100%;
  padding: 0 16px;
  background: #fff;
  .pane-header {
    padding: 16px 0;
  }
  .pane-content {
    padding: 0 16px;
  }
  .detail-container {
    height: calc(100% - 72px);
    overflow: auto;
  }
  .footer-btn {
    height: 72px;
    border-top: 1px solid #f3f3f3;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
}
:deep(.ant-tabs-bar) {
  margin: 0;
}
:deep(.ant-image) {
  margin-left: 16px;
}
</style>
