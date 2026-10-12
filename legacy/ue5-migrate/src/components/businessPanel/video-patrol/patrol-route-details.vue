<template>
  <div class="patrol-router-details-box" title="">
    <a-button type="primary" @click="exitPatrol">退出巡逻</a-button>
    <a-button class="endPatrol" type="primary" @click="submitPatrol">结束巡逻</a-button>
    <div class="patrol-router-details-timeline">
      <a-timeline>
        <a-timeline-item v-for="item in cameraPatrolDeviceVOS" :key="item.id"
          :color="currentData?.id === item.id?'green':'gray'" @click="changePatrolVideo(item)">
          <div class="patrol-router-details-text">
            {{ item.deviceName }}
          </div>
        </a-timeline-item>
      </a-timeline>
    
    </div>
  </div>
  <Teleport to="body">
    <div class="real-time-monitoring">
      <div class="real-time-monitoring-title">实时监控</div>
      <div class="real-time-monitoring-video">
        <H5Video :cameraItem="currentData" control :h5sProtocol="'https:'" @h5sSessionChange="h5sSessionChange"></H5Video>
      </div>
      <div class="real-time-monitoring-operate">
        <a-button :loading="loading"  @click="abnormalScreenshot">异常截图</a-button>
      </div>
    </div>
  </Teleport>
  <a-modal v-if="visible" v-model:visible="visible" :maskClosable="false" title="异常上报" @ok="submitExplain"
    @cancel="cancel">
    <a-form :model="modalForm" ref="modalRef" :rules="rules">
      <a-form-item label="巡逻点">
        <a-input v-model:value="currentData.deviceName" :disabled="true"></a-input>
      </a-form-item>
      <a-form-item label="情况说明" name="remark">
        <a-textarea :maxlength="300" v-model:value="modalForm.remark" :rows="4"></a-textarea>
      </a-form-item>
      <a-form-item label="抓拍照片">
        <a-space :size="16">
          <a-image v-for="(item, index) in modalForm.filePathList" :key="index" :width="100"
            :src="getPreviewUrl(item.previewUrl)"></a-image>
        </a-space>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref,onMounted, computed} from 'vue'
import { storeMarket } from "@/piniaStore/other";
import { cameraPatrolLine, patrolStart, videoScreenshotHK } from '@/api/vmonitor'
import H5Video from "@/components/businessPanel/public/H5Video.vue";
import bus from "@/utils/bus";
import moment from 'moment'
import { message } from "ant-design-vue";
import {UeClient} from "@ghcloud/cube-visual-sdk";

const piniaStoreMarket = storeMarket();
const cameraPatrolDeviceVOS = ref([])
const ueClient = UeClient.getInstance();
const currentData = ref({
  id:'',
  deviceId:'',
  thirdPartyId:'',
  deviceName:'',
  name:'',
  deviceCode:'',
})
const modalForm = ref({
  filePathList:[],
  remark:''
})
const modalRef = ref(null);
const rules= {
  remark: [{ required: true, message: "请输入说明" }],
}
const loading = ref(false)
const visible = ref(false)
const session = ref('')
const patrolPostData = ref({
  cameraPatrolLineId: "",
  cameraPatrolLineName: "",
  patrolTime: "",
  completeTime: "",
  deviceModifyParams: [],
})
const getCameraPatrolLine = async ()=>{
  const res = await cameraPatrolLine(piniaStoreMarket.patrolRouterId)
  patrolPostData.value.patrolTime = moment().format("YYYY-MM-DD HH:mm:ss");
  patrolPostData.value.cameraPatrolLineId = res.id;
  patrolPostData.value.cameraPatrolLineName = res.name;
  
  cameraPatrolDeviceVOS.value = res.cameraPatrolDeviceVOS.map(e=>{
    return {
       ...e,
       steamMediaIntranetAddress:e.streamMedia?.steamMediaIntranetAddress,
       steamMediaIpAddress:e.streamMedia?.steamMediaIntranetAddress,
    }
  })
  if (res.cameraPatrolDeviceVOS.length > 0) {
    changePatrolVideo(cameraPatrolDeviceVOS.value[0]);
  }
}

const h5sSessionChange = (e)=>{
  session.value = e;
}

const getPreviewUrl = computed(()=>{
  return function(url:string){
    if(url.indexOf('http') === -1){
      url = location.origin+url
    }
    const urlObj = new URL(url);
    const params = urlObj.searchParams;  
    //@ts-ignore
    if(!params.session){
      params.append('session',session.value); 
    }
    return urlObj.toString();  
  }
})
const changePatrolVideo = record => {
  if (currentData.value.deviceId === record.deviceId) {
    return false;
  }
  currentData.value = record;
  currentData.value.name = record.deviceName;
  try {
    ueClient.send('focusActor', {
      id: currentData.value.deviceCode,
      animation: true    
  });
  } catch (error) {
//    
  }
  if (
    patrolPostData.value.deviceModifyParams.findIndex(
      item => item.deviceId == record.deviceId,
    ) == -1
  ) {
    const deviceData = {
      deviceId: record.deviceId,
      deviceCode: record.deviceCode,
      deviceName: record.deviceName,
      area: record.area,
      areaNames: record.areaNames,
      sort: patrolPostData.value.deviceModifyParams.length + 1,
      patrolTime: getNowTime(),
      result: "CAMERA_PATROL_NORMAL", //巡逻结果 CAMERA_PATROL_ABNORMAL 异常  CAMERA_PATROL_NORMAL 正常 CAMERA_PATROL_UNKNOWN 未知(未巡)
      status: "CAMERA_PATROL_COMPLETE", //未巡 CAMERA_PATROL_UNKNOWN CAMERA_PATROL_COMPLETE 已巡
      deviceRemarksModifyParams: [],
    };
    patrolPostData.value.deviceModifyParams.push(deviceData);
  }
};
const getNowTime = () => {
  return moment().format("YYYY-MM-DD HH:mm:ss");
};
const getVideoScreenshot = async () => {
  let  data = await videoScreenshotHK(currentData.value.deviceId);
  if (data) {
    modalForm.value.filePathList.push(data);
  }
};
const submitExplain = () => {
  modalRef.value.validate().then(async () => {
    const index = patrolPostData.value.deviceModifyParams.findIndex(
      item => item.deviceId === currentData.value.deviceId,
    );
    if (index >= 0) {
      const params = {
        sort:
          patrolPostData.value.deviceModifyParams[index]
            .deviceRemarksModifyParams.length + 1,
        remark: modalForm.value.remark,
        filePathList: JSON.stringify(
          modalForm.value.filePathList.map(e=>{
                return {
                  extranetFilePath: e.previewUrl,
                  intranetFilePath: e.previewUrl,
                }
              })
            ),
      };
      patrolPostData.value.deviceModifyParams[
        index
      ].deviceRemarksModifyParams.push(params);
      patrolPostData.value.deviceModifyParams[index].result =
        "CAMERA_PATROL_ABNORMAL";
    }
    cancel();
  })
};
const cancel = () => {
  modalRef.value.resetFields();
  modalForm.value = {
    remark: "",
    filePathList: [],
  };
  visible.value = false;
};
const abnormalScreenshot = () => {
    loading.value = true;
    getVideoScreenshot();
    let runCount = 0;
    
    let timerId = setInterval(async () => {
      runCount++;
    await getVideoScreenshot();
    if (runCount == 2) {
      clearInterval(timerId);
      setTimeout(() => {
        loading.value = false;
        visible.value = true;
      }, 3000);
    }
  }, 5000);
};
const submitPatrol = async () => {
  let newArray = cameraPatrolDeviceVOS.value.filter(
    item1 =>
      !patrolPostData.value.deviceModifyParams.some(
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
      sort: patrolPostData.value.deviceModifyParams.length + index + 1,
      patrolTime: "",
      result: "CAMERA_PATROL_UNKNOWN",
      status: "CAMERA_PATROL_UNKNOWN",
      deviceRemarksModifyParams: [],
    };
  });
  patrolPostData.value.completeTime = getNowTime();
  patrolPostData.value.deviceModifyParams = [
    ...patrolPostData.value.deviceModifyParams,
    ...noPatrolDevice,
  ];
  let areaFlag = true
  patrolPostData.value.deviceModifyParams.forEach(e=>{
    if (!e.area) {
      areaFlag = false
    }
  })
  if (areaFlag) {
    const data = await patrolStart(patrolPostData.value);
    if (data) {
      message.success("提交成功");
      exitPatrol()
    }
  }else{
    message.error("设备区域不能为空");
  }

};
const exitPatrol = ()=>{
  bus.emit("exitPatrol");
}
onMounted(async ()=>{
  getCameraPatrolLine()
  // let res = await loginSession();
  // session.value = res.session;
})
</script>
<style lang="less" scoped>
.patrol-router-details-box {
  padding: 10px;
  height: 100%;
  position: relative;
  .patrol-router-details-timeline {
    margin-top: 20px;
    margin-left: 50px;
    height: 80vh;
    overflow-y: auto;
    .patrol-router-details-text {
      cursor: pointer;
      color: #fff;
      font-size: 18px;
      min-height: 100px;
    }
  }
  .endPatrol{
    margin-left:20px
  }
}

:deep(.ant-timeline-item-head) {
  width: 20px;
  height: 20px;
  line-height: 20px;
  border-width: 4px;
}

:deep(.ant-timeline-item-tail) {
  border-width: 4px;
  left: 8px;
}

.real-time-monitoring {
  width: 600px;
  background-color: #ccc;
  position: absolute;
  left: 100px;
  top: 100px;

  .real-time-monitoring-title {
    font-size: 22px;
    color:#fff;
    text-indent: 10px;
  }

  .real-time-monitoring-video {
    width: 600px;
    height: 330px;
  }

  .real-time-monitoring-operate {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

:deep(.ant-input) {
  color: #fff;
}
:deep(.ant-form-item-label > label) {
  color: #fff;
}
</style>