<template>
  <div class="tab-pane-content">
    <div class="sub-item">
      <div class="sub-item-header">
        <g-vertical-line title="报警详情"></g-vertical-line>
      </div>
      <div class="sub-item-content">
        <a-row type="flex" :gutter="[16, 16]">
          <a-col :span="8">报警对象：{{ detail.alarmTargetName }}</a-col>
          <a-col :span="8">报警级别：{{ detail.alarmLevelName }}</a-col>
          <a-col :span="8">报警时间：{{ putFullTime(detail.alarmTime) }}</a-col>
          <a-col :span="8">报警事件：{{ detail.alarmEventName }}</a-col>
        </a-row>
      </div>
    </div>
    <div class="sub-item">
      <div class="sub-item-header">
        <g-vertical-line title="处理结果"></g-vertical-line>
      </div>
      <div class="sub-item-content">
        <a-row
          :gutter="[16, 16]"
          v-if="detail.alarmConfirmedStatus === 'ALARM_CONFIRMED'"
        >
          <a-col :span="8">
            确认结果：{{ detail.alarmConfirmedResultName }}
          </a-col>
          <a-col :span="8">确认人员：{{ detail.alarmConfirmedName }}</a-col>
          <a-col :span="8">
            确认时间：{{ putFullTime(detail.alarmConfirmedTime) }}
          </a-col>
          <a-col :span="24">
            描述：{{ detail.alarmConfirmedResultRemark || "--" }}
          </a-col>
          <a-col :span="24">
            <span>附件：</span>
          </a-col>
          <a-col :span="24" v-if="imageList.length">
            <a-space :size="16">
              <a-image
                :width="100"
                :height="100"
                style="width: 100px; height: 100px"
                v-for="item in imageList"
                :src="item.path"
                :key="item.id"
              ></a-image>
            </a-space>
          </a-col>
          <a-col :span="24" v-if="videoList.length">
            <a-space :size="16">
              <div
                style="width: 320px; height: 200px"
                v-for="element in videoList"
                :key="element.id"
              >
                <video controls>
                  <source :src="element.path" type="video/mp4" />
                </video>
              </div>
            </a-space>
          </a-col>
          <a-empty
            v-if="!imageList.length && !videoList.length"
            description="未上传附件"
          />
        </a-row>
        <a-row :gutter="[16, 16]" v-else>
          <a-col :span="24">
            处理状态：{{ handelStatus(detail.alarmConfirmedStatus) }}
          </a-col>
        </a-row>
        <a-row :gutter="[16, 8]">
          <a-col :span="24">处理流程：</a-col>
          <a-col :span="24">
            <a-table
              :dataSource="data"
              :columns="columns"
              :pagination="false"
              bordered
              size="small"
            ></a-table>
          </a-col>
        </a-row>
      </div>
    </div>
  </div>
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  computed,
} from "vue";
import { putFullTime } from "@/utils/common";
import { alarmStatus } from "@/utils/enumerate";
import { useRoute } from "vue-router";
export default defineComponent({
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const { id } = route.query;
    const handelStatus = computed(() => key => {
      const data = alarmStatus.find(item => {
        return item.value == key;
      });
      if (data) {
        return data?.label || "--";
      }
    });
    const state = reactive({
      detail: {},
      imageList: [],
      videoList: [],
      putFullTime: putFullTime,
      data: [],
      columns: [
        {
          title: "时间",
          dataIndex: "operatorTime",
          slots: {
            customRender: "operatorTime",
          },
          customRender: ({ text }) => {
            return putFullTime(text);
          },
        },
        {
          title: "操作人",
          dataIndex: "operatorByName",
        },
        {
          title: "处理内容",
          dataIndex: "operatorContent",
        },
      ],
    });
    onMounted(() => {
      alarmRecordDetail();
      getAlarmHandleProcess();
    });
    const alarmRecordDetail = async () => {
      const data = await proxy.$api.alarmRecordDetail({ id: id });
      if (data) {
        state.detail = data;
        state.imageList = data.handlerFileVOS.filter(
          item => item.type !== "mp4",
        );
        state.videoList = data.handlerFileVOS.filter(
          item => item.type == "mp4",
        );
        emit("getDetail", data);
      }
    };
    // 获取处理流程
    const getAlarmHandleProcess = async () => {
      const data = await proxy.$api.getAlarmHandleProcess({ id: id });
      if (data) {
        state.data = data;
      }
    };
    return {
      ...toRefs(state),
      handelStatus,
      alarmRecordDetail,
      getAlarmHandleProcess,
    };
  },
});
</script>

<style></style>
