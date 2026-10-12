<template>
  <div class="content">
    <a-spin :spinning="loading" tip="异常截图中，请耐心等待......">
      <g-layout :title="pageTitle">
        <template #content-left>
          <videoItem
            :cameraItem="{...currentPatrolVideo,id:currentPatrolVideo.deviceId}"
            ref="videoItem"
            :button="false"
            @fullScreen="fullScreen"
            :type="videoAccessMode"
            @h5sSessionChange="h5sSessionChange"
          ></videoItem>
        </template>
        <template #content-table>
          <div class="container flex-column">
            <div class="header">
              视频巡逻点（
              <span>{{ dataSource.length }}</span>
              ）
            </div>
            <div class="content">
              <a-table
                :pagination="false"
                :columns="dataColumns"
                :data-source="dataSource"
                bordered
                size="small"
                :rowClassName="
                  (record, index) =>
                    record.deviceId == currentPatrolVideo.deviceId
                      ? 'primary-color'
                      : ''
                "
              >
                <template #action="{ record }">
                  <span
                    type="link"
                    :class="
                      record.deviceId == currentPatrolVideo.deviceId
                        ? 'active'
                        : 'noActive'
                    "
                    @click="changePatorlVideo(record)"
                  >
                    {{ record.deviceName }}
                  </span>
                </template>
              </a-table>
            </div>
            <div class="footer">
              <a-space :size="16">
                <a-button
                  type="primary"
                  @click="abnormalScreenshot"
                  :disabled="currentPatrolVideo.deviceId ? false : true"
                >
                  异常截图
                </a-button>
                <a-popconfirm
                  title="是否确认结束巡逻？"
                  @confirm="submitPatrol"
                >
                  <a-button type="primary">结束巡逻</a-button>
                </a-popconfirm>
              </a-space>
            </div>
          </div>
        </template>
        <template #footer-btn>
          <a-button @click="back">返回</a-button>
        </template>
      </g-layout>
    </a-spin>
    <a-modal
      v-if="visible"
      v-model:visible="visible"
      :maskClosable="false"
      title="异常上报"
      @ok="submitExplain"
      @cancel="cancel"
    >
      <a-form :model="modalForm" ref="modalRef" :rules="rules">
        <a-form-item label="巡逻点">
          <a-input
            v-model:value="currentPatrolVideo.deviceName"
            :disabled="true"
          ></a-input>
        </a-form-item>
        <a-form-item label="情况说明" name="remark">
          <a-textarea
            :maxlength="300"
            v-model:value="modalForm.remark"
            :rows="4"
          ></a-textarea>
        </a-form-item>
        <a-form-item label="抓拍照片">
          <a-space :size="16">
            <a-image
              v-for="(item, index) in modalForm.filePathList"
              :key="index"
              :width="100"
              :src="getPreviewUrl(item.previewUrl)"
            ></a-image>
          </a-space>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
  computed,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import videoItem from "./components/videoItem.vue";
import moment from "moment";
import { usePageName } from "@ghcloud/cube-utils"

export default defineComponent({
  components: { videoItem },
  setup() {
    const videoAccessMode = window.config.feature?.videoAccessMode ?? 'H5S'
    const route = useRoute();
    const router = useRouter();
    const { id } = route.query;
    const { proxy } = getCurrentInstance();
    const modalRef = ref(null);
    const videoItem = ref(null);
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      loading: false,
      session: window.videoSession,
      dataColumns: [
        {
          dataIndex: "name",
          title: "序号",
          align: "center",
          slots: {
            customRender: "name",
          },
          customRender: ({ text, record, index }) => {
            return index + 1;
          },
        },
        {
          dataIndex: "action",
          title: "视频巡逻点",
          align: "center",
          slots: {
            customRender: "action",
          },
        },
      ],
      dataSource: [],
      currentPatrolVideo: { id: "" },
      patrolPostData: {
        cameraPatrolLineId: "",
        cameraPatrolLineName: "",
        patrolTime: "",
        completeTime: "",
        deviceModifyParams: [],
      },
      visible: false,
      modalForm: {
        remark: "",
        filePathList: [],
      },
      rules: {
        remark: [{ required: true, message: "请输入说明" }],
      },
      session:window.videoSession??''
    });
    onMounted(async () => {
      getPatrolLineDetail();
    });

    const getPreviewUrl = computed(()=>{
      return function(url){
        if(url.indexOf('http') === -1){
          url = location.origin+url
        }
        const urlObj = new URL(url);
        const params = urlObj.searchParams;  
        if(!params.session){
          params.append('session', state.session); 
        }
        return urlObj.toString();  
      }
    })
    const getPatrolLineDetail = async () => {
      const data = await proxy.$api.patrolLineId({ id: id }, "get");
      if (data) {
        state.dataSource = data.cameraPatrolDeviceVOS;
        state.patrolPostData.patrolTime = getNowTime();
        state.patrolPostData.cameraPatrolLineId = data.id;
        state.patrolPostData.cameraPatrolLineName = data.name;
        if (state.dataSource.length > 0) {
          changePatorlVideo(state.dataSource[0]);
        }
      }
    };
    const getNowTime = () => {
      return moment().format("YYYY-MM-DD HH:mm:ss");
    };
    const changePatorlVideo = record => {
      if (state.currentPatrolVideo.deviceId === record.deviceId) {
        return false;
      }
      state.currentPatrolVideo = {
        deviceId:''
      };
      setTimeout(() => {
        state.currentPatrolVideo = record;
      state.currentPatrolVideo.name = record.deviceName;
      }, 0);
      
      if (
        state.patrolPostData.deviceModifyParams.findIndex(
          item => item.deviceId == record.deviceId,
        ) == -1
      ) {
        const deviceData = {
          deviceId: record.deviceId,
          deviceCode: record.deviceCode,
          deviceName: record.deviceName,
          area: record.area,
          areaNames: record.areaNames,
          sort: state.patrolPostData.deviceModifyParams.length + 1,
          patrolTime: getNowTime(),
          result: "CAMERA_PATROL_NORMAL", //巡逻结果 CAMERA_PATROL_ABNORMAL 异常  CAMERA_PATROL_NORMAL 正常 CAMERA_PATROL_UNKNOWN 未知(未巡)
          status: "CAMERA_PATROL_COMPLETE", //未巡 CAMERA_PATROL_UNKNOWN CAMERA_PATROL_COMPLETE 已巡
          deviceRemarksModifyParams: [],
        };
        state.patrolPostData.deviceModifyParams.push(deviceData);
      }
    };
    //异常截图
    const abnormalScreenshot = () => {
      state.loading = true;
      videoScreenshot();
      let runCount = 0;
      let timerId = setInterval(async () => {
        runCount++;
        await videoScreenshot();
        if (runCount == 2) {
          clearInterval(timerId);
          setTimeout(() => {
            state.loading = false;
            state.visible = true;
          }, 3000);
        }
      }, 5000);
    };
    const videoScreenshot = async () => {
      try{
        const data = await proxy.$api.videoScreenshotHK({deviceId:state.currentPatrolVideo.deviceId});
      if (data) {
        
        state.modalForm.filePathList.push(data);
      }
      }catch{

      }
      
    };
    const submitExplain = () => {
      modalRef.value.validate().then(async () => {
        const index = state.patrolPostData.deviceModifyParams.findIndex(
          item => item.deviceId === state.currentPatrolVideo.deviceId,
        );
        if (index >= 0) {
          const params = {
            sort:state.patrolPostData.deviceModifyParams[index].deviceRemarksModifyParams.length + 1,
            remark: state.modalForm.remark,
            filePathList: JSON.stringify(
              state.modalForm.filePathList.map(e=>{
                return {
                  fileId:e.id,
                  extranetFilePath: e.previewUrl,
                  intranetFilePath: e.previewUrl,
                }
              })
            ),
          };
          state.patrolPostData.deviceModifyParams[index].deviceRemarksModifyParams.push(params);
          state.patrolPostData.deviceModifyParams[index].result ="CAMERA_PATROL_ABNORMAL";
        }
        cancel();
      });
    };
    const cancel = () => {
      modalRef.value.resetFields();
      state.modalForm = {
        remark: "",
        filePathList: [],
      };
      state.visible = false;
    };
    const submitPatrol = async () => {
      let newArray = state.dataSource.filter(
        item1 =>
          !state.patrolPostData.deviceModifyParams.some(
            item2 => item2.deviceId === item1.deviceId,
          ),
      );
      const noPatrolDevice = newArray.map((item, index) => {
        return {
          deviceId: item.deviceId,
          deviceCode: item.deviceCode,
          deviceName: item.deviceName,
          area: item.area,
          areaNames: item.areaNames,
          sort: state.patrolPostData.deviceModifyParams.length + index + 1,
          patrolTime: "",
          result: "CAMERA_PATROL_UNKNOWN",
          status: "CAMERA_PATROL_UNKNOWN",
          deviceRemarksModifyParams: [],
        };
      });
      state.patrolPostData.completeTime = getNowTime();
      state.patrolPostData.deviceModifyParams = [
        ...state.patrolPostData.deviceModifyParams,
        ...noPatrolDevice,
      ];
      const data = await proxy.$api.patrolStart("post", state.patrolPostData);
      if (data) {
        proxy.$message.success("提交成功");
        back();
      }
    };
    const fullScreen = (status, index) => {
      const element = videoItem.value.$el;
      if (status === "open") {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullScreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    };
    const back = () => {
      router.back();
    };
    return {
      ...toRefs(state),
      back,
      changePatorlVideo,
      abnormalScreenshot,
      submitExplain,
      cancel,
      modalRef,
      submitPatrol,
      fullScreen,
      videoItem,
      videoAccessMode,
      getPreviewUrl,
      h5sSessionChange:(e)=>{
        state.session = e;
      }
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.footer-btn) {
  width: 100%;
  text-align: right;
}
:deep(.content-left) {
  flex: 2;
}
:deep(.controlBtn .anticon-close){
  display: none;
}

.noActive{
  color: #000;
  cursor: pointer;
}
.active {
  color: #fff;
  cursor: pointer;
}
.content {
  width: 100%;
  height: 100%;
}
.container {
  padding: 0 16px;
  height: 100%;
  .header {
    height: 40px;
    line-height: 40px;
    padding: 0 16px;
    background: #f0f2f5;
  }
  .content {
    margin: 16px 0;
    flex: 1;
    overflow: auto;
  }
  .footer {
    height: 60px;
    line-height: 60px;
    text-align: center;
  }
}
</style>
<style lang="less">
.content {
  .ant-spin-nested-loading,
  .ant-spin-container {
    height: 100% !important;
  }
}
</style>
