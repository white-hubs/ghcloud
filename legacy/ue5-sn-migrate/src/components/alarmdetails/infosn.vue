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
            <a >
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
            {{ form?.alarmHandlerName || '--' }}
          </div>
        </div>
        <div class="form-item">
          <div class="form-item-label">报警通知人:</div>
          <div class="form-item-content" style="color: #ff9737">
            {{ form?.alarmNotifyUsername ?? "--" }}
          </div>
        </div>
        <div class="form-item">
          <div class="form-item-label">超时状态:</div>
          <div class="form-item-content" style="color: #ff9737">
            {{ form?.alarmHandlerTimeoutStatusName ?? "--" }}
          </div>
        </div>
        <div class="info-item">
      <!-- <div class="info-item-title">
        <div class="title-icon"></div>
        <div class="title-text">报警原因</div>
      </div> -->
      <!-- <a-row type="flex" :gutter="[32, 16]" style="padding:0px 0 0px 20px ;" v-if="alarmSnapshotDetail.length">
        <a-col :span="100" v-for="item in alarmSnapshotDetail" :key="item.time" style="color: #fff">
          {{ item.propName }} {{ item.propValue }}{{ item.unit }}
        </a-col>
      </a-row>
      <div v-else style="color: #fff;padding:0px 0 0px 20px ;">暂无报警触发数据</div> -->
      <AlarmData :alarmInfo="form" :isSn="true"></AlarmData>
    </div>
      </div>
    </div>
    <div class="info-item" v-if="videoList.length > 0" >
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
        <div v-if="videoList.length === 0" style="color: #fff;font-size: 12px;">无录像</div>
      </div>
    </div>
    <div class="info-item" v-if="imageList && imageList?.length > 0">
      <div class="info-item-title">
        <div class="title-icon"></div>
        <div class="title-text">现场抓拍</div>
      </div>
      <div class="info-item-form">
        <a-image-preview-group>
          <div class="form-video" v-for="item in imageList" :key="item.id">
            <a-image
              :id="item.id"
              v-if="imageLoadStatus[item.id] !== false"
              :src="
                serveIp === 'http'
                  ? item.intranetFilePath + `${session ? '?session=' + session : ''}`
                  : item.extranetFilePath + `${session ? '?session=' + session : ''}`
              "
              @error="handleImageError"
              ></a-image>
          </div>
        </a-image-preview-group>
        <div v-if="!imageList || imageList?.length === 0 || Object.values(imageLoadStatus).every(status => !status)" style="color: #fff;font-size: 12px;">无抓拍</div>
      </div>
    </div>
    <div class="a" >
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
              {{
              form?.handler?.createTime
              ? new Date(form?.handler?.createTime)
              .toLocaleString()
              .replaceAll("/", "-")
              : "--"
              }}
            </div>
          </div>
          <div class="form-item" style="width: 100%">
            <div class="form-item-label">现场图片:</div>
            <div class="form-item-content">
              <a-image-preview-group>
                <div class="form-image" v-for="item in form?.handler?.fileVOS" :key="item.id">
                  <!-- <a-image :src="httpImgUrl(item.path)" style='width:60px;height:60px'/> -->
                  <a-image :src="httpImgUrl(item.endpointPath || item.path)" style='width:60px;height:60px'/>
                </div>
              </a-image-preview-group>
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
              {{ form?.handler?.createUserName || '--' }}
            </div>
          </div>
          <div class="form-item">
            <div class="form-item-label">报警原因:</div>
            <div class="form-item-content">
              {{ form?.handler?.recordHandlerReason?.alarmReason || '--'}}
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
              <div class="form-image" v-for="item in (form?.handler?.fileVOS || form?.suspend?.fileVOS)" :key="item.id">
                <!-- <a-image :src="httpImgUrl(item.path)"  /> -->
                <a-image :src="httpImgUrl(item.endpointPath || item.path)" style='width:60px;height:60px'/>
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
                <div style="
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    width: 200px;
                  ">
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

import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted } from "vue";
import moment from "moment";
import { getNorthDeviceDetailSn,alarmEventOperatesSn,getVideoFilePathsSn,loginSessionSn, getStreamMediaConfigSn,getAlarmRecordIdSn } from "../../api/snMarket.ts";
import { message } from "ant-design-vue";
import { isHttpUrl, fallback } from "@/utils/common";
import AlarmData from "../alarm-chart-components/alarm-data.vue";

export default defineComponent({
  props: {
    id: {
      type: Object,
      default: null,
    },
    businessKey: {
      type: Object,
      default: null,
    },
  },
  components:{AlarmData},
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const serveIp = window.location.protocol;
    const state = reactive({
      session: '',
      form: {
        handlerFileVOS: [],
        handler: {
          fileVOS: []
        },
      },
      alarmSnapshotDetail: [],
      handelStatusDetail: {},
      videoList: [],
      imageList: [],
      imageLoadStatus: {}, // 添加图片加载状态
    });
    const handleAlarmSnapshot = async () => {
      // attributeKeyValueVos 属性值匹配数据如无直接显示value
      const numberDataType=['int', 'long', 'float', 'double']
      try {
        const {alarmSnapshot,alarmTargetKey}= state.form
        if(!alarmSnapshot){
          state.alarmSnapshotDetail=[]
          return;
        } 
      const { matchSnapshot }=typeof alarmSnapshot==='string'? JSON.parse(alarmSnapshot) : alarmSnapshot
      const params = { deviceId: alarmTargetKey,withPropertySpec:true,withSnapShot:true }
      const result = await getNorthDeviceDetailSn(params)
      const alarmSnapshotDetail = matchSnapshot.map(item => {
          const valueReg= /(?<=\[)(.+?)(?=\])/g
          let configAlarmValue=''
          const matchValues= item.condition.match(valueReg);
          if(matchValues.length){
            configAlarmValue=matchValues.at(-1)
          }
          let propValue = ''
          const deviceAttribute = result.productPropVoList.find(attr => attr.propCode === item.propCode)
          if (deviceAttribute.dataType==='enum') {
            const findValue = deviceAttribute.dataConstraint.find(keyValue => keyValue.value === item.propValue)
            propValue = findValue ? findValue.label : item.propValue
          } else {
            propValue = item.propValue
          }
          return {
              propName: deviceAttribute.propName,
              propValue,
              propCode: item.propCode,
              configAlarmValue,
              minValue:numberDataType.includes(deviceAttribute.dataType)? Math.min(...deviceAttribute.dataConstraint):0,
              maxValue:numberDataType.includes(deviceAttribute.dataType)? Math.max(...deviceAttribute.dataConstraint):0,
              unit: deviceAttribute.unitName || '',
              time: item.propValueTs
          }
      })
        state.alarmSnapshotDetail = alarmSnapshotDetail
      } catch (error) {
      }
      // 
    }
    const getData = () => {
      getAlarmRecordIdSn(props.id).then((res) => {
        state.form = {
          ...res,
          alarmTime: moment(res.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
          alarmConfirmedTime: res.alarmConfirmedTime
            ? moment(res.alarmConfirmedTime).format("YYYY-MM-DD HH:mm:ss")
            : "--",
        };
        // handleAlarmSnapshot()
        getVideoFilePathshand();
      }).catch((error) => {
        message.destroy()
        error && message.error({
          content: error,
          style: {
            position: "fixed",
            zIndex: 1000,
            top: `10%`,
            left: '46%'
          }
        })
      });

    };
    const getVideoFilePathshand = () => {
    const token = sessionStorage.getItem("market-token");
    const baseUrl = sessionStorage.getItem("market-baseUrl");
    const tenant = sessionStorage.getItem("market-tenant");
      getVideoFilePathsSn(props.businessKey,baseUrl).then((res) => {
        const withBaseUrl = (item) => {
          if (item.intranetFilePath && !isHttpUrl(item.intranetFilePath)) {
            item.intranetFilePath = baseUrl + item.intranetFilePath
          }
          if (item.extranetFilePath && !isHttpUrl(item.extranetFilePath)) {
            item.extranetFilePath = baseUrl + item.extranetFilePath
          }
          return item
        }

        state.videoList = res.filter((item) => item.type === "VIDEOTAPE").map(withBaseUrl)
        state.imageList = res.filter((item) => item.type === "PHOTOGRAPH").map((item) => {
          const fixed = withBaseUrl(item)
          state.imageLoadStatus[fixed.id] = true
          return fixed
        })
      });
    };
    const httpImgUrl = (path) => {
      let url = ''
      if(!isHttpUrl(path)){
        url = baseUrl + path
      }else{
        url = path
      }
      return url
    }
    // 获取处理结果
    const getAlarmEventOperates = () => {
      alarmEventOperatesSn({ id: props.id }).then((res) => {
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
      try {
        let res = await loginSessionSn();
        state.session = res.session;
      } catch (error) {
        state.session = null;
      }
    };
    onMounted(async () => {
      await getSessionData()
      getAlarmEventOperates();
      getData();
    });
    const toDevaceInfo = () => {
      emit("toDeviceInfo", state.form);
    };
    const handleImageError = (event) => {
      const img = event.target;
      img.status = 'error';
      img.style.display = 'none';
      state.imageLoadStatus[img.id] = false; // 更新图片加载状态为失败
    };
    return {
      toDevaceInfo,
      getSessionData,
      getData,
      getAlarmEventOperates,
      getVideoFilePathshand,
      ...toRefs(state),
      serveIp,
      httpImgUrl,
      fallback,
      handleImageError
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
            width: 80px;
            height: 20px;
            text-align: left;
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
        // height: 110px;
        height: auto;
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
