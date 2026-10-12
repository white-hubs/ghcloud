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
            <a @click="toDevaceInfo()">
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
      <div class="c" style="display: flex">
        <div class="form-item" style="display: flex; color: rgba(226, 226, 226, 0.5); margin-left: 48px">
          <div class="form-item-label" style="width: 60px">处理人:</div>
          <div class="form-item-content" style="width: 325px; word-break: break-all">
            {{ form?.alarmHandlerName == "" ? "--" : form?.alarmHandlerName }}
          </div>
        </div>
        <div class="form-item" style="display: flex; color: rgba(226, 226, 226, 0.5); margin-left: -32px">
          <div class="form-item-label" style="width: 81px">报警通知人:</div>
          <div class="form-item-content" style="width: 325px; word-break: break-all">
            <collapse :value="form?.alarmNotifyUsername">
              {{ form?.alarmNotifyUsername || "--" }}
            </collapse>
          </div>
        </div>
      </div>
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
        <div v-if="videoList.length === 0">无录像</div>
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
        <div v-if="imageList.length === 0">无抓拍</div>
      </div>
    </div>
    <div class="a" v-if="form.alarmStatus == 'ALARM_HANDLER' || form.alarmStatus == 'ALARM_SUSPEND'">
      <div class="info-item" v-if="form.alarmStatus !== 'ALARM_SUSPEND'">
        <div class="info-item-title">
          <div class="title-icon"></div>
          <div class="title-text">处理结果</div>
        </div>
        <div class="info-item-form">
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
          <div class="form-item" style="width: 100%">
            <div class="form-item-label">现场图片:</div>
            <div class="form-item-content">
              <div class="form-image" v-for="item in form?.handler?.fileVOS" :key="item.id">
                <a-image :src="item.path" />
              </div>
              <!-- <div v-if="form?.handler || hform?.handler?.fileVOS.length === 0">
              --
            </div> -->
            </div>
          </div>

          <div class="form-item">
            <div class="form-item-label">处理说明:</div>
            <div class="form-item-content">
              {{ form?.handler?.alarmHandlerResultRemark ?? "--" }}
            </div>
          </div>
          <div class="form-item">
            <div class="form-item-label">处理人员:</div>
            <div class="form-item-content">
              <a-tooltip placement="topLeft" :title="form?.handler?.createUserName">
                <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; width: 200px">
                  {{ form?.handler?.createUserName }}
                </div>
              </a-tooltip>
            </div>
          </div>
        </div>
      </div>
      <div class="info-item" v-if="form.alarmStatus == 'ALARM_SUSPEND'">
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
                <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; width: 200px">
                  {{ form?.suspend?.createUserName }}
                </div>
              </a-tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted } from "vue";
import { watch } from "vue";

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
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const serveIp = window.location.protocol;
    const state = reactive({
      session: window.videoSession,
      form: {
        handlerFileVOS: [],
      },
      handelStatusDetail: {},
      videoList: [],
      imageList: [],
    });
    const getData = () => {
      proxy.$api.getAlarmRecordId(props.id).then((res) => {
        state.form = {
          ...res,
          alarmTime: moment(res.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
          alarmConfirmedTime: res.alarmConfirmedTime ? moment(res.alarmConfirmedTime).format("YYYY-MM-DD HH:mm:ss") : "--",
        };
        getVideoFilePaths(res.businessKey);
      });
    };
    const getVideoFilePaths = (businessKey) => {
      proxy.$api.getVideoFilePaths(businessKey).then((res) => {
        state.imageList = res.filter((item) => item.type === "PHOTOGRAPH");
        state.videoList = res.filter((item) => item.type === "VIDEOTAPE");
      });
    };
    // 获取处理结果
    const getAlarmEventOperates = () => {
      proxy.$api.alarmEventOperates({ id: props.id }).then((res) => {
        let result = res.find((item) => item.alarmStatusEvent == "PROCESSED");
        if (result) {
          let videoList = result.operationParam.fileVOS.filter((item) => item.type == "mp4" || item.type == "AVI" || item.type == "MKV");
          let imageList = result.operationParam.fileVOS.filter((item) => item.type !== "mp4" && item.type !== "AVI" && item.type !== "MKV");
          state.handelStatusDetail = { ...result, videoList, imageList };
        }
      });
    };
    watch(
      () => props.id,
      () => {
        if (props.id) {
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
    const toDevaceInfo = () => {
      emit("toDeviceInfo", state.form);
    };
    return {
      toDevaceInfo,
      ...toRefs(state),
      serveIp,
    };
  },
});
</script>

<style lang="less" scoped>
.alarmDetail-info {
  .info-item {
    border-bottom: 1px #394254 dashed;
    padding-bottom: 4px;
    margin-bottom: 16px;

    &:last-child {
      border-bottom: none;
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
        color: #ffffff;
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

      .form-item {
        display: flex;
        width: 33.33%;
        line-height: 14px;
        color: rgba(226, 226, 226, 0.5);
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
            color: rgba(226, 226, 226, 1);
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
}
</style>
