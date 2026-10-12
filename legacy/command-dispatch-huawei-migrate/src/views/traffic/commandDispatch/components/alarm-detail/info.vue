<template>
  <div class="alarmDetail-info">
    <div class="info-item">
      <div class="info-item-title">
        <div class="title-icon"></div>
        <div class="title-text">报警信息</div>
      </div>
      <div class="info-item-form">
        <div class="form-item">
          <div class="form-item-label">报警时间:</div>
          <div class="form-item-content">{{ form?.alarmTime ?? "--" }}</div>
        </div>
        <div class="form-item">
          <div class="form-item-label">报警设备:</div>
          <div class="form-item-content">
            <a @click="toDevaceInfo()" style="color: #216cc3">
              {{ form?.alarmTargetName ?? "--" }}
            </a>
          </div>
        </div>
        <div class="form-item">
          <div class="form-item-label">报警级别:</div>
          <div class="form-item-content">
            {{ form?.alarmLevelName ?? "--" }}
          </div>
        </div>
        <div class="form-item">
          <div class="form-item-label">设备事件:</div>
          <div class="form-item-content">
            {{ form?.alarmEventName ?? "--" }}
          </div>
        </div>
        <div class="form-item">
          <div class="form-item-label">报警区域:</div>
          <div class="form-item-content">{{ form?.areaName ?? "--" }}</div>
        </div>
        <div class="form-item">
          <div class="form-item-label">状态:</div>
          <div class="form-item-content" style="color: #ff9737">
            {{ form?.alarmStatusName ?? "--" }}
          </div>
        </div>
      </div>
      <div class="c" style="display: flex; margin-bottom: 12px">
        <div class="form-item" style="display: flex; color: #000000; margin-left: 48px">
          <div class="form-item-label" style="width: 60px">处理人:</div>
          <div class="form-item-content" style="width: 258px; padding-right: 30px; word-break: break-all">
            <a v-if="form?.alarmHandlerName" @click="handleClickUser(form?.alarmHandlerBy)">{{ form?.alarmHandlerName }}</a>
            <span v-else>--</span>
          </div>
        </div>
        <div class="form-item" style="display: flex; color: #000000; margin-left: -32px">
          <div class="form-item-label" style="width: 81px">报警通知人:</div>
          <div class="form-item-content" style="width: 130px; word-break: break-all">
            <collapse :value="form?.alarmNotifyUsername">
              <a style="color: #216cc3" @click="handleClickUser(item.userId)" v-for="item in form.alarmNotifyUsers" :key="item.id">
                {{ item.userName }}
                <span v-if="item != form.alarmNotifyUsers[form.alarmNotifyUsers.length - 1]" style="color: #216cc3">,</span>
              </a>
            </collapse>
          </div>
        </div>
        <div class="form-item" style="display: flex; color: #000000; margin-left: 48px">
          <div class="form-item-label" style="margin-right: 5px">报警事件类型:</div>
          <div class="form-item-content" style="color: #000000">
            {{ form?.alarmEventTypeName ?? "--" }}
          </div>
        </div>
      </div>
    </div>
    <div class="info-item">
      <div class="info-item-title">
        <div class="title-icon"></div>
        <div class="title-text">报警快照</div>
      </div>
      <AlarmData :alarmInfo="form"></AlarmData>
    </div>
    <div class="info-item">
      <div class="info-item-title">
        <div class="title-icon"></div>
        <div class="title-text">现场录像</div>
      </div>
      <div class="info-item-form">
        <div class="form-video" v-for="item in videoList" :key="item.id">
          <video controls style="width: 100%; object-fit: fill">
            <source
              :src="serveIp === 'http:' ? item.intranetFilePath + '?session=' + session : item.extranetFilePath + '?session=' + session"
              type="video/mp4"
            />
          </video>
        </div>
        <div v-if="videoList.length === 0" class="empty-text">无录像</div>
      </div>
    </div>
    <div class="info-item">
      <div class="info-item-title">
        <div class="title-icon"></div>
        <div class="title-text">现场抓拍</div>
      </div>
      <div class="info-item-form">
        <a-image-preview-group>
          <div class="form-video" v-for="item in imageList" :key="item.id">
            <a-image
              :src="serveIp === 'http' ? item.intranetFilePath + '?session=' + session : item.extranetFilePath + '?session=' + session"
            ></a-image>
          </div>
        </a-image-preview-group>
        <div v-if="imageList.length === 0" class="empty-text">无抓拍</div>
      </div>
    </div>
    <div
      class="a"
      v-if="form.alarmStatus == 'ALARM_HANDLER' || form.alarmStatus == 'ALARM_SUSPEND' || form.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'"
    >
      <div class="info-item" v-if="form.handler || (form.followUps && !!form.followUps.length)">
        <div class="info-item-title">
          <div class="title-icon"></div>
          <div class="title-text">处理结果</div>
        </div>
        <div v-if="form.followUps">
          <div class="info-item-form" v-for="item in form?.followUps" :key="item.id">
            <div class="form-item">
              <div class="form-item-label">跟进记录:</div>
              <div class="form-item-content">
                <a-tooltip>
                  <template #title> {{ item.content }}</template>
                  <div class="ellipsis-four" style="width: 150px">{{ item.content }}</div>
                </a-tooltip>
              </div>
            </div>
            <div class="form-item" style="width: 60%">
              <div class="form-item-label" style="padding-right: 8px">现场图片:</div>
              <div class="form-item-content">
                <div class="form-image" v-for="file in item.files" :key="file.id">
                  <a-image :src="file.path" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="info-item-form" v-if="form.alarmStatus === 'ALARM_HANDLER'">
          <div class="form-item">
            <div class="form-item-label">处理结果:</div>
            <div class="form-item-content">
              {{ form?.handler?.alarmHandlerResultName ?? "--" }}
            </div>
          </div>
          <div class="form-item">
            <div class="form-item-label">处理时间:</div>
            <div class="form-item-content">
              {{ form?.handler?.createTime ? new Date(form?.handler?.createTime).toLocaleString().replaceAll("/", "-") : "--" }}
            </div>
          </div>
          <div class="form-item">
            <div class="form-item-label">报警原因:</div>
            <a-tooltip>
              <template #title>{{ form?.handler?.recordHandlerReason?.alarmReason }}</template>
              <div class="form-item-content ellipsis">
                {{ form?.handler?.recordHandlerReason?.alarmReason }}
              </div>
            </a-tooltip>
          </div>
          <div class="form-item" style="width: 100%">
            <div class="form-item-label" style="padding-right: 8px">现场图片:</div>
            <div class="form-item-content">
              <div class="form-image" v-for="item in form?.handler?.fileVOS" :key="item.id">
                <a-image :src="item.path" />
              </div>
            </div>
          </div>

          <div class="form-item">
            <div class="form-item-label">处理说明:</div>
            <a-tooltip>
              <template #title> {{ form?.handler?.alarmHandlerResultRemark ?? "--" }}</template>
              <div class="form-item-content ellipsis">
                {{ form?.handler?.alarmHandlerResultRemark ?? "--" }}
              </div>
            </a-tooltip>
          </div>
          <div class="form-item">
            <div class="form-item-label">处理人员:</div>
            <div class="form-item-content">
              <a-tooltip placement="topLeft" :title="form?.handler?.createUserName">
                <a
                  @click="handleClickUser(form?.handler?.userId)"
                  style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; width: 200px"
                >
                  {{ form?.handler?.createUserName }}
                </a>
              </a-tooltip>
            </div>
          </div>
        </div>
      </div>
      <div class="info-item" v-if="form.alarmStatus === 'ALARM_SUSPEND'">
        <div class="info-item-title">
          <div class="title-icon"></div>
          <div class="title-text">
            {{ form.alarmStatus == "ALARM_SUSPEND" ? "报警挂起" : form.alarmStatus == "ALARM_HANDLER" ? "处理结果" : "" }}
          </div>
        </div>
        <div class="info-item-form">
          <div class="form-item">
            <div class="form-item-label">预计处理时间:</div>
            <div class="form-item-content">
              {{
                form?.suspend?.estimatedProcessTime
                  ? new Date(form?.suspend?.estimatedProcessTime).toLocaleString().replaceAll("/", "-")
                  : "--"
              }}
            </div>
          </div>
          <div class="form-item">
            <div class="form-item-label">挂起原因:</div>
            <div class="form-item-content">
              {{ form?.suspend?.remark || "--" }}
            </div>
          </div>
          <div class="form-item">
            <div class="form-item-label">处理时间:</div>
            <div class="form-item-content">
              {{ form?.suspend?.createTime ? new Date(form?.suspend?.createTime).toLocaleString().replaceAll("/", "-") : "--" }}
            </div>
          </div>
          <div class="form-item" style="width: 100%">
            <div class="form-item-label">现场图片:</div>
            <div class="form-item-content">
              <div class="form-image" v-for="item in form?.suspend?.fileVOS" :key="item.id">
                <a-image :src="item.path" />
              </div>
              <!-- <div v-if="form?.handler || hform?.handler?.fileVOS.length === 0">
              --
            </div> -->
            </div>
          </div>
          <div class="form-item">
            <div class="form-item-label">操作挂起人员:</div>
            <div class="form-item-content">
              <a-tooltip placement="topLeft" :title="form?.suspend?.createUserName">
                <a
                  @click="handleClickUser(form?.suspend?.userId)"
                  style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; width: 200px"
                >
                  {{ form?.suspend?.createUserName }}
                </a>
              </a-tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
    <custom-modal
      className="userInfo-modal"
      v-model:visible="userInfoModal.visible"
      :isMinimized="userInfoModal.isMinimized"
      @changeIsMinimized="changeIsMinimized"
      title="人员详情"
      @close="handleClose"
    >
      <div class="info-item-form">
        <div class="form-item">
          <div class="form-item-label">姓名:</div>
          <div class="form-item-content">{{ userInfoModal.userInfo.name ?? "--" }}</div>
        </div>
        <div class="form-item">
          <div class="form-item-label">联系电话:</div>
          <div class="form-item-content">
            {{ userInfoModal.userInfo.mobile ?? "--" }}
          </div>
        </div>
        <div class="form-item">
          <div class="form-item-label">性别:</div>
          <div class="form-item-content">
            {{ genderObj[userInfoModal.userInfo.gender] ?? "--" }}
          </div>
        </div>
        <div class="form-item">
          <div class="form-item-label">所属部门:</div>
          <div class="form-item-content">
            {{ userInfoModal.userInfo.organizations[0] ? userInfoModal.userInfo.organizations[0].name : "--" }}
          </div>
        </div>
        <div class="form-item">
          <div class="form-item-label">职位:</div>
          <div class="form-item-content">
            {{ userInfoModal.userInfo.organizations[0] ? userInfoModal.userInfo.positions[0].name : "--" }}
          </div>
        </div>
      </div>
    </custom-modal>
  </div>
</template>

<script>
import moment from "moment";
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted, onBeforeUnmount, ref } from "vue";
import { watch } from "vue";

import CustomModal from "../custom-modal/index.vue";
import AlarmData from "@/components/alarm-chart-components/alarm-data.vue";
import collapse from "@/components/collapse.vue";

export default defineComponent({
  props: {
    id: {
      type: String,
      default: null,
    },
  },
  components: {
    collapse,
    CustomModal,
    AlarmData,
  },
  setup(props, { emit }) {
    const genderObj = {
      NONE: "保密",
      MALE: "男",
      FEMALE: "女",
    };
    const { proxy } = getCurrentInstance();
    const serveIp = window.location.protocol;

    // 添加组件销毁标志，防止组件销毁后继续执行异步操作
    const isDestroyed = ref(false);

    const state = reactive({
      session: window.videoSession,
      userInfoModal: {
        visible: false,
        isMinimized: false,
        userInfo: {
          gender: "",
          name: "",
          mobile: "",
          organizations: [
            {
              name: "",
            },
          ],
          positions: [
            {
              name: "",
            },
          ],
        },
      },
      form: {
        handlerFileVOS: [],
      },
      handelStatusDetail: {},
      videoList: [],
      imageList: [],
    });
    const handleClickUser = async (id) => {
      if (!id) {
        proxy.$message.error("人员ID异常");
        return;
      }
      const result = await proxy.$api.userId({ id }, "get");
      state.userInfoModal.userInfo = result;
      state.userInfoModal.visible = true;
    };
    const changeIsMinimized = (bol) => {
      state.userInfoModal.isMinimized = bol;
    };
    const handleClose = () => {
      state.userInfoModal.visible = false;
    };
    const getData = () => {
      // 防止组件销毁后继续执行
      if (isDestroyed.value) return;

      proxy.$api
        .getAlarmRecordId(props.id)
        .then((res) => {
          // 再次检查组件是否已销毁
          if (isDestroyed.value) return;

          state.form = {
            ...res,
            alarmTime: moment(res.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
            alarmConfirmedTime: res.alarmConfirmedTime ? moment(res.alarmConfirmedTime).format("YYYY-MM-DD HH:mm:ss") : "--",
          };
          getVideoFilePaths(res.businessKey);
        })
        .catch((error) => {
          // 添加错误处理，避免未处理的Promise错误
          if (!isDestroyed.value) {
            console.error("获取报警记录失败:", error);
          }
        });
    };
    const getVideoFilePaths = (businessKey) => {
      // 防止组件销毁后继续执行
      if (isDestroyed.value) return;

      proxy.$api
        .getVideoFilePaths(businessKey)
        .then((res) => {
          // 再次检查组件是否已销毁
          if (isDestroyed.value) return;

          state.imageList = res.filter((item) => item.type === "PHOTOGRAPH");
          state.videoList = res.filter((item) => item.type === "VIDEOTAPE");
        })
        .catch((error) => {
          // 添加错误处理
          if (!isDestroyed.value) {
            console.error("获取视频文件路径失败:", error);
          }
        });
    };
    // 获取处理结果
    const getAlarmEventOperates = () => {
      // 防止组件销毁后继续执行
      if (isDestroyed.value) return;

      proxy.$api
        .alarmEventOperates({ id: props.id })
        .then((res) => {
          // 再次检查组件是否已销毁
          if (isDestroyed.value) return;

          let result = res.find((item) => item.alarmStatusEvent == "PROCESSED");
          if (result) {
            let videoList = result.operationParam.fileVOS.filter((item) => item.type == "mp4" || item.type == "AVI" || item.type == "MKV");
            let imageList = result.operationParam.fileVOS.filter(
              (item) => item.type !== "mp4" && item.type !== "AVI" && item.type !== "MKV",
            );
            state.handelStatusDetail = { ...result, videoList, imageList };
          }
        })
        .catch((error) => {
          // 添加错误处理
          if (!isDestroyed.value) {
            console.error("获取报警事件操作失败:", error);
          }
        });
    };
    watch(
      () => props.id,
      () => {
        if (props.id && !isDestroyed.value) {
          getData();
          getAlarmEventOperates();
        }
      },
    );
    onMounted(() => {
      if (!props.id) return;
      getData();
      getAlarmEventOperates();
    });

    // 组件销毁时清理资源
    onBeforeUnmount(() => {
      isDestroyed.value = true;
      // 清理状态，防止内存泄漏
      state.form = { handlerFileVOS: [] };
      state.videoList = [];
      state.imageList = [];
      state.userInfoModal.visible = false;
    });

    const toDevaceInfo = () => {
      emit("toDeviceInfo", state.form);
    };
    return {
      toDevaceInfo,
      ...toRefs(state),
      handleClickUser,
      changeIsMinimized,
      handleClose,
      genderObj,
      serveIp,
    };
  },
});
</script>

<style lang="less" scoped>
.alarmDetail-info {
  .info-item {
    border-bottom: 1px var(--dispatch-border-soft, #dbe4ef) dashed;
    padding-bottom: 4px;
    margin-bottom: 16px;

    &:last-child {
      border-bottom: none;
      margin-bottom: 0px;
    }

    .info-item-title {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      margin-bottom: 16px;

      .title-text {
        font-size: 14px;
        font-family: PingFang SC-Medium;
        font-weight: 500;
        color: #000000;
      }

      .title-icon {
        width: 14px;
        height: 14px;
        background: rgba(41, 137, 255, 0.5);
        border-radius: 50%;
        position: relative;
        margin-right: 4px;

        &::before {
          content: "";
          position: absolute;
          width: 8px;
          height: 8px;
          background: #216cc3;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }

    .info-item-form {
      display: flex;
      flex-wrap: wrap;

      .ellipsis {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .ellipsis-four {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
      }

      .form-item {
        display: flex;
        width: 33.33%;
        line-height: 14px;
        color: #000000;
        font-size: 14px;
        margin-bottom: 12px;
        padding-left: 18px;

        > div {
          display: inline-block;

          &.form-item-label {
            width: 100px;
            height: 20px;
            text-align: right;
            vertical-align: top;
            margin-right: 5px;
          }

          &.form-item-content {
            width: calc(100% - 70px);
            color: #000000;
          }
        }
      }

      .form-video {
        width: 200px;
        height: 110px;
        margin-right: 8px;
        margin-bottom: 8px;
        overflow: hidden;

        video {
          width: 100%;
          height: 100%;
        }

        img {
          width: 100%;
          height: 100%;
        }
      }

      .form-image {
        width: 60px;
        height: 60px;
        background: wheat;
        margin-right: 8px;
        display: inline-block;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
        }
      }

      .empty-text {
        color: #000000;
      }
    }
  }
}
</style>
<style lang="less">
.userInfo-modal {
  width: 800px;
  height: 400px;
  position: fixed;
  top: calc(50% - 185px);
  left: calc(50% - 390px);
  background: var(--dispatch-modal-bg, rgba(255, 255, 255, 0.98));
  border: 1px solid var(--dispatch-border, #dbe4ef);
  box-shadow: var(--dispatch-shadow-strong, 0 12px 32px rgba(26, 54, 93, 0.18));
  color: var(--dispatch-text, #1f2d3d);
  z-index: 999;

  .info-item-form {
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;

    .ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .form-item {
      display: flex;
      width: 33.33%;
      line-height: 14px;
      color: var(--dispatch-text-secondary, #64748b);
      font-size: 14px;
      margin-bottom: 12px;
      padding-left: 18px;

      > div {
        display: inline-block;

        &.form-item-label {
          width: 100px;
          height: 20px;
          text-align: right;
          vertical-align: top;
          margin-right: 5px;
        }

        &.form-item-content {
          width: calc(100% - 70px);
          color: var(--dispatch-text, #1f2d3d);
        }
      }
    }

    .form-video {
      width: 200px;
      height: 110px;
      margin-right: 8px;
      margin-bottom: 8px;
      overflow: hidden;

      video {
        width: 100%;
        height: 100%;
      }

      img {
        width: 100%;
        height: 100%;
      }
    }

    .form-image {
      width: 60px;
      height: 60px;
      background: wheat;
      margin-right: 8px;
      display: inline-block;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
      }
    }
  }
}
.ant-btn:focus {
  color: #216cc3;
}
.ant-btn-link {
  color: #216cc3 !important;
}
</style>
