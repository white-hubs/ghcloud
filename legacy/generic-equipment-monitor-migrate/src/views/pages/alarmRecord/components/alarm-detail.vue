<template>
  <!-- 线损管理：预警详情布局（报警信息 / 现场数据 / 处理结果） -->
  <div v-if="isLineLossManagement" class="alarm-detail--line-loss">
    <template v-if="alarmDetail">
      <div class="section-title-bar">报警信息</div>
      <a-form :labelCol="{ span: 8 }" :wrapperCol="{ span: 16 }">
        <a-row :gutter="[16, 16]">
          <a-col :span="8">
            <a-form-item label="报警时间">
              {{ alarmDetail?.alarmTime ? dayjs(alarmDetail.alarmTime).format("YYYY-MM-DD HH:mm:ss") : "--" }}
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="线路名称">
              <span>{{ alarmDetail?.alarmTargetName || "--" }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="报警级别">
              <span :style="{ color: alarmLevelColor(alarmDetail?.alarmLevelName) }">{{ alarmDetail?.alarmLevelName || "--" }}</span>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="[16, 16]">
          <a-col :span="8">
            <a-form-item label="报警事件">{{ alarmDetail?.alarmEventName || "--" }}</a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="处理时限">{{ alarmDetail?.timeoutProcessTimesName || "--" }}</a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="处理状态">
              <span :style="{ color: alarmHandleStatusColor(alarmDetail?.alarmStatusName) }">{{
                alarmDetail?.alarmStatusName || "--"
              }}</span>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="[16, 16]">
          <a-col :span="8">
            <a-form-item label="处理人">
              <a type="link" @click="showUserInfo(alarmDetail?.alarmHandlerBy ?? '')">{{ alarmDetail?.alarmHandlerName || "--" }}</a>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="超时状态">
              <span
                :style="{
                  color:
                    alarmDetail?.alarmHandlerTimeoutStatusName === '已超时' || alarmDetail?.alarmHandlerTimeoutStatusName === '超时'
                      ? '#D9001B'
                      : '#70B603',
                }"
              >
                {{ alarmDetail?.alarmHandlerTimeoutStatusName || "--" }}
              </span>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <div class="section-title-bar">现场数据</div>
      <div class="line-loss-rate-text">线损率 {{ lineLossRateDisplay }}</div>
      <div class="line-loss-topology-wrap">
        <LineLossTopologyViewer :alarm-snapshot="alarmDetail?.alarmSnapshot" />
      </div>

      <div v-if="alarmDetail?.handler && showResult(alarmDetail?.alarmStatus)" class="line-loss-result-wrap">
        <div class="section-title-bar">处理结果</div>
        <div class="handel-content line-loss-handel">
          <a-row :gutter="[0, 16]">
            <a-col :span="24">
              <span class="line-loss-label">处理说明：</span>
              {{ alarmDetail?.handler?.alarmHandlerResultRemark || "--" }}
            </a-col>
            <a-col :span="24" class="line-loss-images-row">
              <span class="line-loss-label">现场图片：</span>
              <a-image-preview-group v-if="alarmDetail?.handler?.fileVOS?.length">
                <a-image v-for="item in alarmDetail.handler.fileVOS" :key="item.id" :src="item.path" :width="100" />
              </a-image-preview-group>
              <span v-else>--</span>
            </a-col>
            <a-col :span="24">
              <span class="line-loss-label">处理时间：</span>
              {{ alarmDetail?.handler?.createTime ? dayjs(alarmDetail.handler.createTime).format("YYYY-MM-DD HH:mm:ss") : "--" }}
            </a-col>
            <a-col :span="24">
              <span class="line-loss-label">处理人员：</span>
              <a type="link" @click="showUserInfo(alarmDetail?.handler?.userId ?? '')">{{
                alarmDetail?.handler?.createUserName || "--"
              }}</a>
            </a-col>
          </a-row>
        </div>
      </div>
    </template>
  </div>

  <div v-else>
    <div class="title">报警信息</div>
    <a-form :labelCol="{ span: layout.span }" :wrapperCol="{ span: 24 - layout.span }">
      <a-row :gutter="16">
        <a-col :span="layout.span">
          <a-form-item label="报警时间">
            {{ alarmDetail?.alarmTime ? dayjs(alarmDetail?.alarmTime).format("YYYY-MM-DD HH:mm:ss") : "--" }}
          </a-form-item>
        </a-col>
        <a-col :span="layout.span">
          <a-form-item label="报警设备">
            <a type="link" @click="toDeviceDetail">
              {{ alarmDetail?.alarmTargetName || "--" }}
            </a>
          </a-form-item>
        </a-col>
        <a-col :span="layout.span">
          <a-form-item label="报警级别">
            {{ alarmDetail?.alarmLevelName || "--" }}
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="layout.span">
          <a-form-item label="报警规则">
            {{ alarmDetail?.alarmEventName || "--" }}
          </a-form-item>
        </a-col>
        <a-col :span="layout.span">
          <a-form-item label="报警区域">
            {{ alarmDetail?.areaName || "--" }}
          </a-form-item>
        </a-col>
        <a-col :span="layout.span">
          <a-form-item label="处理时限">
            {{ alarmDetail?.timeoutProcessTimesName || "--" }}
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="layout.span">
          <a-form-item label="处理人">
            <a type="link" @click="showUserInfo(alarmDetail?.alarmHandlerBy ?? '')">
              {{ alarmDetail?.alarmHandlerName || "--" }}
            </a>
          </a-form-item>
        </a-col>
        <a-col :span="layout.span">
          <a-form-item label="报警通知人">
            <collapse :value="alarmDetail.alarmNotifyUsername" v-if="alarmDetail">
              <a @click="showUserInfo(item.userId)" v-for="item in alarmDetail.alarmNotifyUsers" :key="item.id">
                {{ item.userName }} <span v-if="item != alarmDetail.alarmNotifyUsers[alarmDetail.alarmNotifyUsers.length - 1]">,</span>
              </a>
            </collapse>
          </a-form-item>
        </a-col>
        <a-col :span="layout.span">
          <a-form-item label="超时状态">
            {{ alarmDetail?.alarmHandlerTimeoutStatusName || "--" }}
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="layout.span">
          <a-form-item label="处理状态">
            {{ alarmDetail?.alarmStatusName || "--" }}
          </a-form-item>
        </a-col>
        <a-col :span="layout.span">
          <a-form-item label="详细位置">
            {{ alarmDetail?.alarmTargetAddress || "--" }}
          </a-form-item>
        </a-col>
        <a-col :span="layout.span">
          <a-form-item label="任务耗时">
            {{ alarmDetail?.processingTime ? formateTime(alarmDetail.processingTime) : "--" }}
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <AlarmData v-if="alarmDetail?.businessKey" :id="props.id" :alarmInfo="alarmDetail" />
    <VideoLinkage
      v-if="alarmDetail?.businessKey"
      :alarmStatus="alarmDetail.alarmStatus"
      :id="alarmDetail.businessKey"
      :show-real-monitor-action="canPlayRealMonitor"
      @play-real-monitor="openRealMonitor"
    />
    <div v-if="alarmDetail?.handler || (alarmDetail?.followUps && !!alarmDetail?.followUps.length)" style="margin-top: 12px; width: 100%">
      <div class="title">处理结果</div>
      <div class="handel-content" v-if="alarmDetail?.handler || alarmDetail?.followUps">
        <a-row :gutter="[32, 16]" style="margin-bottom: 24px" v-for="item in alarmDetail?.followUps ?? []" :key="item.id">
          <a-col :span="24">
            跟进记录:
            {{ item.content || "--" }}
          </a-col>
          <a-col :span="24" style="display: flex; align-items: center">
            <span>现场图片：</span>
            <a-image-preview-group v-if="item.files?.length">
              <a-image v-for="file in item.files" :key="file.id" :src="file.path" :width="100" height="100px"></a-image>
            </a-image-preview-group>
            <span v-else>--</span>
          </a-col>
        </a-row>
        <a-row :gutter="[32, 16]" v-if="showResult(alarmDetail?.alarmStatus)">
          <a-col :span="24"> 处理结果：{{ alarmDetail?.handler?.alarmHandlerResultName || "--" }} </a-col>
          <a-col :span="24"> 报警原因：{{ alarmDetail?.handler?.recordHandlerReason?.alarmReason || "--" }} </a-col>
          <a-col :span="24">
            处理说明:
            {{ alarmDetail?.handler?.alarmHandlerResultRemark || "--" }}
          </a-col>
          <a-col :span="24">
            <span>现场图片：</span>
            <a-image-preview-group v-if="alarmDetail?.handler?.fileVOS?.length">
              <a-image v-for="item in alarmDetail?.handler?.fileVOS" :key="item.id" :src="item.path" :width="100"></a-image>
            </a-image-preview-group>
            <span v-else>--</span>
          </a-col>
          <a-col :span="24">
            处理时间：{{ alarmDetail?.handler?.createTime ? dayjs(alarmDetail?.handler?.createTime).format("YYYY-MM-DD HH:mm:ss") : "--" }}
          </a-col>
          <a-col :span="24">
            <div style="display: flex">
              <div>处理人员:</div>
              <a type="link" @click="showUserInfo(alarmDetail?.handler?.userId ?? '')">
                {{ alarmDetail?.handler?.createUserName }}
              </a>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>
    <div v-if="alarmDetail?.alarmStatus === 'ALARM_SUSPEND'">
      <div class="title">报警挂起</div>
      <div class="handel-content" v-if="alarmDetail?.alarmStatus == 'ALARM_SUSPEND'">
        <a-row :gutter="[32, 16]">
          <a-col :span="24">
            预计处理时间：{{
              alarmDetail?.suspend?.estimatedProcessTime == null
                ? "--"
                : !alarmDetail?.suspend?.estimatedProcessTime
                  ? "--"
                  : dayjs(alarmDetail?.suspend?.estimatedProcessTime).format("YYYY-MM-DD HH:mm:ss")
            }}
          </a-col>
          <a-col :span="24">
            挂起原因:
            {{ alarmDetail?.suspend?.remark || "--" }}
          </a-col>
          <a-col :span="24">
            <span>现场图片：</span>
            <a-image-preview-group v-if="alarmDetail?.suspend?.fileVOS.length">
              <a-image v-for="item in alarmDetail?.suspend?.fileVOS" :key="item.id" :src="item.path" :width="100"></a-image>
            </a-image-preview-group>
            <span v-else>--</span>
          </a-col>
          <a-col :span="24">
            挂起时间：
            {{ alarmDetail?.suspend?.createTime ? dayjs(alarmDetail?.suspend?.createTime).format("YYYY-MM-DD HH:mm:ss") : "--" }}
          </a-col>
          <a-col :span="24">
            <div style="display: flex">
              <div>操作挂起人员:</div>
              <a-tooltip placement="topLeft" :title="alarmDetail?.suspend?.createUserName">
                <a type="link" @click="showUserInfo(alarmDetail?.suspend?.userId ?? '')">
                  {{ alarmDetail?.suspend?.createUserName }}
                </a>
              </a-tooltip>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>
  </div>
  <a-modal centered width="800px" v-model:visible="userInfoModal.visible" title="用户详情" :footer="null">
    <div class="user-info">
      <a-form layout="inline">
        <a-form-item label="姓名">
          {{ userInfoModal.userInfo?.name }}
        </a-form-item>
        <a-form-item label="联系电话">
          {{ userInfoModal.userInfo?.mobile }}
        </a-form-item>
        <a-form-item label="性别">
          {{ genderObj[userInfoModal.userInfo?.gender ?? "NONE"] ?? "--" }}
        </a-form-item>
        <a-form-item label="所属部门">
          {{ userInfoModal.userInfo?.organizations[0] ? userInfoModal.userInfo.organizations[0].name : "--" }}
        </a-form-item>
        <a-form-item label="职位">
          {{ userInfoModal.userInfo?.positions[0] ? userInfoModal.userInfo.positions[0].name : "--" }}
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
  <a-modal title="实时监控" centered width="800px" v-model:visible="realMonitorVisible" :footer="null" :destroyOnClose="true">
    <AlarmMonitor
      v-if="realMonitorVisible && canPlayRealMonitor"
      :alarmStatus="alarmDetail?.alarmStatus"
      :id="alarmDetail?.businessKey"
      :showTitle="false"
    />
  </a-modal>
</template>
<script lang="ts" setup>
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import { computed, onMounted, reactive, ref, shallowRef } from "vue";

import type { AlarmDetails } from "@ghcloud/cube-alarm-center-service";
import type { UserInfo } from "@ghcloud/cube-ouaa-service";

import AlarmData from "./alarm-data.vue";
import AlarmMonitor from "./alarm-monitor.vue";
import LineLossTopologyViewer from "./line-loss-topology-viewer.vue";
import VideoLinkage from "./videoLinkage.vue";
import { cubeAlarmCenterService, cubeOuaaService } from "@/api/service";
import collapse from "@/components/collapse.vue";
import { getAlarmHandleEnumeTimes, LINE_LOSS_ALARM_TYPE_CODE } from "@/utils/enumerate";
const layout = {
  span: 8,
};
const props = defineProps({
  id: {
    type: String,
    default: "",
  },
});

const emit = defineEmits<{
  (e: "detail-loaded", payload: AlarmDetails): void;
}>();

const genderObj = {
  NONE: "保密",
  MALE: "男",
  FEMALE: "女",
};
const alarmDetail = ref<AlarmDetails>();
const realMonitorVisible = shallowRef(false);

const isLineLossManagement = computed(() => alarmDetail.value?.alarmTypeCode === LINE_LOSS_ALARM_TYPE_CODE);

const canPlayRealMonitor = computed(
  () => Boolean(alarmDetail.value?.businessKey) && alarmDetail.value?.alarmStatus !== "ALARM_HANDLER" && !isLineLossManagement.value,
);

const openRealMonitor = () => {
  if (canPlayRealMonitor.value) {
    realMonitorVisible.value = true;
  }
};

const alarmLevelColor = (name?: string): string => {
  const map: Record<string, string> = {
    一级: "rgb(255, 59, 52)",
    二级: "rgb(255, 110, 52)",
    三级: "rgb(255, 194, 52)",
    四级: "rgb(24, 144, 255)",
  };
  return name && map[name] ? map[name] : "#333";
};

const alarmHandleStatusColor = (name?: string): string => {
  const map: Record<string, string> = {
    已挂起: "#02A7F0",
    待确认: "#D9001B",
    待接收: "#D9001B",
    处理中: "#e8b130",
    已关闭: "#7F7F7F",
    已处理: "#70B603",
  };
  return name && map[name] ? map[name] : "#333";
};

const lineLossRateDisplay = computed(() => {
  const d = alarmDetail.value as Record<string, unknown> | null | undefined;
  if (!d) {
    return "--";
  }
  const v = d.lineLossRate ?? d.lossRate ?? d.alarmThreshold;
  if (v === undefined || v === null || v === "") {
    return "--";
  }
  const num = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(num)) {
    return String(v);
  }
  if (num <= 1 && num >= 0) {
    return `${(num * 100).toFixed(2)}%`;
  }
  return `${num}%`;
});

const userInfoModal = reactive<{
  visible: boolean;
  userInfo: UserInfo | null;
}>({
  visible: false,
  userInfo: null,
});
const formateTime = (time: number) => {
  const h = parseInt((time / 3600).toString());
  const minute = parseInt(((time / 60) % 60).toString());
  const second = Math.ceil(time % 60);

  const hours = h < 10 ? "0" + h : h;
  const formatSecond = second > 59 ? 59 : second;
  return `${h > 0 ? `${hours}时` : ""}${minute < 10 ? "0" + minute : minute}分${formatSecond < 10 ? "0" + formatSecond : formatSecond}秒`;
};
const toDeviceDetail = () => {
  if (alarmDetail.value) {
    history.pushState(
      { current: location.pathname + location.search },
      "",
      "/portal/genericEquipmentMonitor/equipmentMoitorDetail?type=detail&deviceId=" + alarmDetail.value.alarmTargetKey,
    );
  }
};
const showUserInfo = async (userId: string) => {
  if (!userId) {
    return;
  }
  try {
    message.loading("人员查询中");
    const result = await cubeOuaaService.getPersonInfo(userId);
    userInfoModal.userInfo = result;
    userInfoModal.visible = true;
  } catch (error) {
  } finally {
    message.destroy();
  }
};
const showResult = (status) => {
  return status === "ALARM_HANDLER" ? true : false;
};
const getData = () => {
  realMonitorVisible.value = false;
  cubeAlarmCenterService.getAlarmDetails(props.id).then((res) => {
    alarmDetail.value = res;
    emit("detail-loaded", res);
  });
};
onMounted(() => {
  getData();
});
defineExpose({
  getData,
});
</script>
<style scoped lang="less">
.title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
}

.handel-content {
  padding: 0 32px;
  margin-bottom: 16px;
}

.alarm-detail--line-loss {
  .section-title-bar {
    font-size: 16px;
    font-weight: 600;
    margin: 16px 0 12px;
    padding-left: 10px;
    border-left: 4px solid #d9d9d9;
    color: rgba(0, 0, 0, 0.85);
  }

  .section-title-bar:first-child {
    margin-top: 0;
  }

  .line-loss-rate-text {
    color: #cf1322;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .line-loss-topology-wrap {
    margin-bottom: 16px;
  }

  .line-loss-result-wrap {
    margin-top: 8px;
  }

  .line-loss-label {
    color: rgba(0, 0, 0, 0.65);
    margin-right: 4px;
  }

  .line-loss-images-row {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
