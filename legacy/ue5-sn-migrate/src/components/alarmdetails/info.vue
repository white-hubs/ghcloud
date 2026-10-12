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
        <div class="form-item">
          <div class="form-item-label">处理人:</div>
          <div class="form-item-content" style="color: #ff9737">
            {{ form?.alarmHandlerName == "" ? "--" : form?.alarmHandlerName }}
          </div>
        </div>
        <div class="form-item">
          <div class="form-item-label">报警通知人:</div>
          <div class="form-item-content" style="color: #ff9737;cursor: pointer">
            <a @click="handleClickUser(item.userId)" v-for="item in form.alarmNotifyUsers" :key="item.id"> {{
              item.userName
              }} <span v-if="item != form.alarmNotifyUsers[form.alarmNotifyUsers.length - 1]">,</span> </a>
          </div>
        </div>
      </div>
    </div>
    <div class="info-item">
      <div class="info-item-title">
        <div class="title-icon"></div>
        <div class="title-text">报警快照</div>
      </div>
      <AlarmData :alarmInfo="form" :isSn="false"></AlarmData>
    </div>
    <div class="info-item">
      <div class="info-item-title">
        <div class="title-icon"></div>
        <div class="title-text">现场录像</div>
      </div>
      <div class="info-item-form">
        <div class="form-video" v-for="item in videoList" :key="item.id">
          <video controls style="width: 100%; object-fit: fill">
            <source :src="
                serveIp === 'http:'
                  ? item.intranetFilePath + `${session ? '?session=' + session : ''}`
                  : item.extranetFilePath + `${session ? '?session=' + session : ''}`
              " type="video/mp4" />
          </video>
        </div>
        <div v-if="videoList.length === 0" style="color: #fff">无录像</div>
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
            <a-image :src="
                serveIp === 'http'
                  ? item.intranetFilePath + `${session ? '?session=' + session : ''}`
                  : item.extranetFilePath + `${session ? '?session=' + session : ''}`
              "></a-image>
          </div>
        </a-image-preview-group>
        <div v-if="imageList.length === 0" style="color: #fff">无抓拍</div>
      </div>
    </div>
    <div class="a"
      v-if="form.alarmStatus == 'ALARM_HANDLER' || form.alarmStatus == 'ALARM_SUSPEND' || form.alarmStatus==='ALARM_PROGRESS_CONFIRMED'">
      <div class="info-item" v-if="form.handler||(!!form.followUps.length && form.followUps)">
        <div class="info-item-title">
          <div class="title-icon"></div>
          <div class="title-text">处理结果</div>
        </div>
        <div class="info-item-form" v-for="item in form.followUps" :key="item.id">
          <div class="form-item">
            <div class="form-item-label">跟进记录:</div>
            <div class="form-item-content">
              <a-tooltip>
                <template #title> {{item.content}}</template>
                <div class="ellipsis-four" style="width:150px">{{item.content}}</div>
              </a-tooltip>
            </div>
          </div>
          <div class="form-item" style="width: 60%;">
            <div class="form-item-label" style="padding-right: 8px;">现场图片:</div>
            <div class="form-item-content">
              <div class="form-image" v-for="file in item.files" :key="file.id">
                <a-image :src="file.path" />
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
              {{
              form?.handler?.createTime
              ? new Date(form?.handler?.createTime)
              .toLocaleString()
              .replaceAll("/", "-")
              : "--"
              }}
            </div>
          </div>
          <div class="form-item">
            <div class="form-item-label">报警原因:</div>
            <div class="form-item-content ellipsis">
                {{
                form?.handler?.recordHandlerReason?.alarmReason || "--"
                }}
              </div>
            <a-tooltip>
              <template #title>{{form?.handler?.recordHandlerReason?.alarmReason}}</template>
              <div class="form-item-content ellipsis">
                {{
                form?.handler?.recordHandlerReason?.alarmReason || "--"
                }}
              </div>
            </a-tooltip>
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
                <a @click="handleUserClick(form?.handler?.userId)" style="
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    width: 200px;
                  ">
                  {{ form?.handler?.createUserName }}
                </a>
              </a-tooltip>
            </div>
          </div>
        </div>
      </div>
      <div class="info-item" v-if="form.alarmStatus == 'ALARM_SUSPEND'">
        <div class="info-item-title">
          <div class="title-icon"></div>
          <div class="title-text">
            {{
            form.alarmStatus == "ALARM_SUSPEND"
            ? "报警挂起"
            : form.alarmStatus == "ALARM_HANDLER"
            ? "处理结果"
            : ""
            }}
          </div>
        </div>
        <div class="info-item-form">
          <div class="form-item">
            <div class="form-item-label">预计处理时间:</div>
            <div class="form-item-content">
              {{
              form?.suspend?.estimatedProcessTime
              ? new Date(form?.suspend?.estimatedProcessTime)
              .toLocaleString()
              .replaceAll("/", "-")
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
              {{
              form?.suspend?.createTime
              ? new Date(form?.suspend?.createTime)
              .toLocaleString()
              .replaceAll("/", "-")
              : "--"
              }}
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
                <a @click="handleUserClick(form?.suspend?.userId)" style="
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    width: 200px;
                  ">
                  {{ form?.suspend?.createUserName }}
                </a>
              </a-tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Modal :show="userInfoModal.visible" title="用户信息" @close="userInfoModal.visible = false" width="600px"
    wrapClassName="user-modal">
    <div class="user-info">
      <div class="info-item-form">
        <div class="form-item">
          <div class="form-item-label">姓名:</div>
          <div class="form-item-content">{{ userInfoModal.userInfo.name ?? "--" }}</div>
        </div>
        <div class="form-item">
          <div class="form-item-label">电话号码:</div>
          <div class="form-item-content">
            {{ genderObj[userInfoModal.userInfo.mobile] ?? "--" }}
          </div>
        </div>
        <div class="form-item">
          <div class="form-item-label">性别:</div>
          <div class="form-item-content">
            {{ userInfoModal.userInfo.gender ?? "--" }}
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
            {{ userInfoModal.userInfo.positions[0]? userInfoModal.userInfo.positions[0].name:'--'}}
          </div>
        </div>
      </div>
    </div>

  </Modal>
</template>

<script>
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted } from "vue";
import moment from "moment";
import Modal from "../modal-table/modal.vue";
import { loginSession } from "@/api/mdata";
import { getAlarmRecordId, alarmEventOperates } from "../../api/alarm.ts";
import { getVideoFilePaths } from "../../api/linkage.ts";
import { cubeOuaaService } from '@/api/service'
import AlarmData from "../alarm-chart-components/alarm-data.vue";
export default defineComponent({
  props: {
    id: {
      type: String,
      default: null,
    },
  },
  components: { AlarmData, Modal },
  setup(props, { emit }) {
    const genderObj = {
      NONE: '保密',
      MALE: '男',
      FEMALE: '女'
    }
    const { proxy } = getCurrentInstance();
    const serveIp = window.location.protocol;
    const state = reactive({
      session: window.videoSession,
      form: {
        handlerFileVOS: [],
      },
      handelStatusDetail: {},
      userInfoModal: {
        visible: false,
        userInfo: {
          gender: '',
          name: '',
          mobile: '',
          organizations: [{
            name: ''
          }],
          positions: [{
            name: ''
          }],
        }
      },
      videoList: [],
      imageList: [],
    });
    const getData = () => {
      getAlarmRecordId(props.id).then((res) => {
        state.form = {
          ...res,
          alarmTime: moment(res.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
          alarmConfirmedTime: res.alarmConfirmedTime
            ? moment(res.alarmConfirmedTime).format("YYYY-MM-DD HH:mm:ss")
            : "--",
        };
        getVideoFilePathshand(res.businessKey);
      });
    };
    const handleClickUser = async (userId) => {
      if (!userId) {
        proxy.$message.error('人员ID异常')
        return
      }
      const result = await cubeOuaaService.getPersonInfo(userId)
      state.userInfoModal.userInfo = result
      state.userInfoModal.visible = true
    }
    const getVideoFilePathshand = (businessKey) => {
      getVideoFilePaths(businessKey).then((res) => {
        state.imageList = res.filter((item) => item.type === "PHOTOGRAPH");
        state.videoList = res.filter((item) => item.type === "VIDEOTAPE");
      });
    };
    // 获取处理结果
    const getAlarmEventOperates = () => {
      alarmEventOperates({ id: props.id }).then((res) => {
        let result = res.find((item) => item.alarmStatusEvent == "PROCESSED");
        if (result) {
          let videoList = result.operationParam.fileVOS.filter(
            (item) => item.type == "mp4" || item.type == "AVI" || item.type == "MKV"
          );
          let imageList = result.operationParam.fileVOS.filter(
            (item) => item.type !== "mp4" && item.type !== "AVI" && item.type !== "MKV"
          );
          state.handelStatusDetail = { ...result, videoList, imageList };
        }
      });
    };
    // 获取session
    const getSessionData = async () => {
      let res = await loginSession();
      state.session = res ? res.session : null;
    };
    onMounted(() => {
      getSessionData()
      getData();
      getAlarmEventOperates();
    });
    const toDevaceInfo = () => {
      emit("toDeviceInfo", state.form);
    };
    return {
      toDevaceInfo,
      handleClickUser,
      ...toRefs(state),
      genderObj,
      serveIp,
    };
  },
});
</script>

<style lang="less" scoped>
.alarmDetail-info {
  font-size: 16px;

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
          background: #2989ff;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }


  }
}

.user-info {
  width: 100%;
  height: 300px;
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

    .ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    >div {
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

.ellipsis-four {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}
</style>
