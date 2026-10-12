<template>
  <device-panel-templat :color="'#fff'" @closeDevicePanel="closeDevicePanel" class="modal-table-device"
    :title="deviceData.name">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="basic" tab="理货机信息">
        <div class="model-top">
          <div class="model-personnel">
            <div class="personnel-headSculpture">
              <img
                :src="tallyMachineData.supplierInfo.fileVO?tallyMachineData.supplierInfo.fileVO:getAssetsImage('head-sculpture.png')"
                alt="">
            </div>
            <div class="personnel-info">
              <div class="personnel-name">{{tallyMachineData.supplierInfo.name}}
                <!-- - <span style="color: #FFAB10;">白条</span> -->
              </div>
              <div class="personnel-infoRow">
                <span class="personnel-label">联系人：</span>
                <span class="personnel-label">{{tallyMachineData.supplierInfo.liaison || '--'}}</span>
              </div>
              <!-- <div class="personnel-infoRow">
                <span class="personnel-label">联系电话：</span>
                <span class="personnel-label">{{tallyMachineData.supplierInfo.phone || '--'}}</span>
              </div> -->
              <div class="personnel-infoRow">
                <span class="personnel-label">所在区域：</span>
                <span class="personnel-label">{{address || '--'}}</span>
              </div>
            </div>
          </div>
          <div class="quantityTally">
            <div class="quantityTally-title">该批次理货总片数</div>
            <div class="quantityTally-total">
              <span style="color:#FFAB10 ;">{{tallyMachineData.porkArrange.slices}}</span>
              <span>/{{ tallyMachineData.porkArrange.slices }}</span>
              <!-- <span>/{{ tallyMachineData.porkReport.reportSlices }}</span> -->
              <span style="font-size: 12px;">片</span>
            </div>
          </div>
          <div class="TallyingWeight">
            <div class="quantityTally-title">该批次理货总重量</div>
            <count-to :startVal="0" :endVal="Number(tallyMachineData.porkArrange.weight)" :decimals="2"></count-to>
            <span class="unit">kg</span>
          </div>
          <div class="tallyingStatus">
            <img :src="getAssetsImage(tallyMachineData.porkArrangeStatus+'.png')" alt="">
            <div :class="tallyMachineData.porkArrangeStatus">{{ PorkArrangeStatus[tallyMachineData.porkArrangeStatus ] }}
            </div>
          </div>
        </div>
        <div class="middle-foot">
          <div class="cargo—info">
            <p>重量： </p>
            <p :style="{color: '#2989ff'}">{{tallyMachineData.porkArrangeDetail.weight}}kg</p>
          </div>
          <div class="cargo—info">
            <p>电子标签：</p>
            <p>{{tallyMachineData.porkArrangeDetail.label || '--'}}</p>
          </div>
          <div class="cargo—info">
            <p>理货编码：</p>
            <p>{{tallyMachineData.porkArrangeDetail.footMarkCode || '--'}}</p>
          </div>
          <div class="cargo—info">
            <p>时 间：</p>
            <p>{{tallyMachineData.porkArrangeDetail.porkArrangeTime?
              moment(tallyMachineData.porkArrangeDetail.porkArrangeTime).format('YYYY-MM-DD HH:mm:ss') || '--':'--'}}</p>
          </div>
        </div>
        <div>
          <p class="data-title">报备数据</p>
          <div class="flex-box report">
            <div class="odd-bg" style="text-align: center;">
              <div style="margin-top: 10px;">报备单号</div>
              <div class="odd-numbers" :title="tallyMachineData.porkReport.code">{{tallyMachineData.porkReport.code}}
              </div>
            </div>
            <div>
              <p><span class="item-title">来货车辆：</span><span class="item">{{tallyMachineData.porkReport.vehiclePlate ||
                  '--'}}</span></p>
              <p><span class="item-title">报备重量：</span><span
                  class="item">{{tallyMachineData.porkReport.reportWeight}}kg</span></p>

            </div>
            <div>
              <p><span class="item-title">报备片数：</span><span class="item">{{tallyMachineData.porkReport.reportSlices ||
                  '--'}}片</span></p>
              <p><span class="item-title">屠 宰 场：</span><span class="item">{{tallyMachineData.porkReport.abattoirName ||
                  '--'}}</span></p>


            </div>
            <div>
              <p class="status-title">报备情况</p>
              <div class="flex-box">
                <a-progress type="circle" :size="[20, 20]" :percent="ReportingData" :format="percent => `${percent}%`" />
                <div class="status">
                  <p>报备总数</p>
                  <p>{{tallyMachineData.porkReportStatAudit.total}}次</p>
                </div>
                <div class="status">
                  <p>审核不通过</p>
                  <p><span :style="{color:'#E93434'}">{{ tallyMachineData.porkReportStatAudit.porkReportAuditFailedNum
                      }}</span>次</p>
                </div>
              </div>
            </div>
            <div>
              <p class="status-title">理货情况</p>
              <div class="flex-box">
                <a-progress type="circle" :percent="TallyingData" :format="percent => `${percent}%`" />
                <div class="status">
                  <p>理货次数</p>
                  <p>{{tallyMachineData.porkStatArrangeAudit.total}}次</p>
                </div>
                <div class="status">
                  <p>审核不通过</p>
                  <p><span
                      :style="{color:'#FFAB10'}">{{tallyMachineData.porkStatArrangeAudit.porkArrangeAuditFailedNum}}</span>次
                  </p>
                </div>
              </div>
            </div>
            <div></div>
            <div></div>
          </div>
          <p style="margin:5px 0"><span class="item-title">检疫证号：</span><span
              class="item">{{tallyMachineData.porkReport.pratiqueCode
              || '--'}}</span></p>
          <p><span class="item-title">检疫证明：</span>
            <span class="prove">
              <a-image v-for="item in tallyMachineData.porkReport.files" :src="item.path" />
            </span>
          </p>
        </div>
        <div>
          <p class="data-title">设备数据</p>
          <div>
            <span class="item-title">通信状态：</span><span :style="{color:'#2989FF'}">{{ deviceData.communicationStatus
              }}</span>
            <span style="margin-left: 10px;" class="item-title">故障状态：</span><span :style="{color:'#2989FF'}">{{
              deviceStatus }}</span>
          </div>
          <div class="flex-box device">
            <div><span class="item-title">设备编码：</span><span>{{ deviceData.code }}</span></div>
            <div><span class="item-title">品牌型号：</span><span>{{ deviceData.modelName }}</span></div>
            <div><span class="item-title">运维部门：</span><span>{{ deviceData.departmentName }}</span></div>
            <div><span class="item-title">所在区域：</span><span>{{ deviceData.areaName }}</span></div>
            <!-- <div><span class="item-title">巡检信息：</span><span>正常<span :style="{color:'#2989FF'}">{{ inspectData.normalTask
                  }}</span>次，异常<span :style="{color:'#FFAB10'}">{{ inspectData.abnormalTask }}</span>次</span></div> -->
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="video" tab="视频信息" force-render>
        <div class="middle">
          <div class="model-middle">
            <template v-if="cameraList.length > 0">
              <div class="middle-video" v-for="(item, index) in cameraList" :key="index">
                <H5Video :cameraItem="item" :idStr="item.token + index"></H5Video>
              </div>
            </template>
            <NoData v-else />
            <div class="middle-right">
              <div class="middle-img" v-for="item in tallyMachineData.porkArrangeDetail.picPaths.split(',')">
                <a-image :width="170"  :src="item+ '?session='+sessionData" />
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </device-panel-templat>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted} from 'vue'
import H5Video from "@/components/businessPanel/public/H5Video.vue";
import NoData from "@/components/businessPanel/public/noData.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { getAssetsImage } from '@/utils/getImage';
import { arrangeLastInfo } from "@/api/slide";
import { getDeviceInfo, runningAttr } from "@/api/equipment";
import { MachinePanelInformation, PorkArrangeStatus } from "@/api/models/slide";
import { associatedVideos } from '@/api/device'
import DevicePanelTemplat from './devicePanelTemplat.vue';
import { loginSession } from "@/api/mdata";
import moment from "moment"
import areaOpions from "./area.json";
const emit = defineEmits(['close'])
interface Props {
  id:string
}
const ReportingData = ref(0)
const TallyingData = ref(0)
const props = withDefaults(defineProps<Props>(),{
})
const addressData = ref([])
const activeKey = ref('basic')
const deviceData = reactive<any>({})
const sessionData = ref('')
const address = ref('')
const deviceStatus = ref('')
const inspectData = ref({
  normalTask:0,
  abnormalTask:0,
})
let deviceStatusType = {
  ALARM: "报警",
  TROUBLE: "故障",
  OFFLINE: "离线",
  NORMAL: "正常",
};
const cameraList = ref([])
const tallyMachineData = reactive<MachinePanelInformation>({
porkArrange: {
  slices:0,
  porkReportSlices:0,
  weight:0,
  porkReportWeight:0,
},
porkArrangeAuditStatus: "",
porkArrangeDetail: {
picPaths:'',
supplierId: '',
label: '',
weight: 0,
porkArrangeTime: '',
footMarkCode: '',
goodsCategoryId: '',
goodsCategoryName: '',
id: '',
picFilePaths: [],
porkReportCode: ''
},
porkArrangeStatus: "",
porkReport: {
  pratiqueCode:'',
abattoirCode: '',
abattoirId: '',
abattoirName: '',
arrivedTime: '',
code: '',
files: [],
goodsCategoryName: '',
id: '',
pratiqueCodes: [],
reportSlices: 0,
reportTime: '',
reportWeight: 0,
vehiclePlate: ''
},
porkReportStatAudit: {
porkReportAuditFailedNum: 0,
porkReportAuditPassedNum: 0,
total: 0,
},
porkStatArrangeAudit: {
porkArrangeAuditFailedNum: 0,
porkArrangeAuditPassedNum: 0,
total: 0
},
supplierInfo: {
address: '',
area: '',
code: '',
fileVO: '',
id: '',
liaison: '',
name: '',
phone: ''
}
}) 
const closeDevicePanel = ()=>{
  emit('close')
}
const getAreaName = (value, arr) => {
      arr.forEach((item) => {
        if (value.indexOf(item.value) > -1) {
          addressData.value.push(item.label);
        }
        if (item.children && item.children.length > 0) {
          getAreaName(value, item.children);
        }
      });
      return addressData.value;
    };
// 获取理货机面板数据
 const getTallyMachineInfo =async ()=>{
 let res = await arrangeLastInfo(props.id)
 if(res){
  Object.assign(tallyMachineData,res)
 }
 let state= await runningAttr(props.id)

  state.deviceAttributesOfRunning.forEach(item=>{
    if (item.attributeCode === 'faultState') {
    Number(item.translatedValue) === 0 ?deviceStatus.value='正常':deviceStatus.value='故障'
    }
  })
 //设备数据
 let data = await getDeviceInfo(props.id)
 
 Object.assign(deviceData,data.detail)
 //监控视频
 associatedVideos(props.id).then((res) => {
   cameraList.value = res;
  });
  // 获取Session
   let session =  await loginSession()
   sessionData.value = session.session
   addressData.value = []
   address.value =  getAreaName(tallyMachineData.supplierInfo.area,areaOpions).join("/") 
   ReportingData.value =Number(((tallyMachineData.porkReportStatAudit.porkReportAuditPassedNum/tallyMachineData.porkReportStatAudit.total)*100).toFixed(2)) || 0 
   TallyingData.value = Number(((tallyMachineData.porkStatArrangeAudit.porkArrangeAuditPassedNum/tallyMachineData.porkStatArrangeAudit.total)*100).toFixed(2)) || 0 
}
onMounted(()=>{
  getTallyMachineInfo()
})
</script>


<style  lang="less" scoped>
p {
  margin: 0;
}

.model-top {
  color: #fff;
  // width: 1164px;
  // height: 132px;
  margin: 4px 0;
  border: 1px solid rgba(255, 255, 255, 0.1018);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  background: rgba(255, 255, 255, 0.1);

  .quantityTally-title {
    font-size: 16px;
  }

  .model-personnel {
    display: flex;
    align-items: center;
    color: #fff;
    width: 300px;

    .personnel-headSculpture {
      width: 76px;
      height: 76px;
      margin-right: 4px;

      img {
        width: 76px;
        height: 76px;
      }
    }

    .personnel-info {
      font-size: 14px;

      .personnel-name {
        font-size: 20px;
      }

      .personnel-infoRow {
        font-size: 12px;
      }
    }

  }

  .quantityTally {
    width: 200px;

    .quantityTally-total {
      font-size: 48px;
    }
  }

  .TallyingWeight {
    :deep(.gh-count-to) {
      font-size: 48px;
    }
  }

  .tallyingStatus {
    position: relative;
    width: 162px;

    img {
      width: 162px;
      height: 162px;
    }

    div {
      position: absolute;
      width: 162px;
      text-align: center;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 24px;
      font-weight: bold;
    }
  }
}

.middle {
  background: rgba(255, 255, 255, 0.1);
  border-left: 5px solid #2989ff;
  border-right: 5px solid #2989ff;
  height: 450px;
}

.model-middle {
  font-size: 12px;
  color: #fff;

  padding: 15px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .middle-video {
    width: 464px;
    height: 410px;
    margin-right: 8px;
  }

  .middle-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    height: 410px;
  }

  .middle-img {
    :deep(.ant-image-img){
      height: 205px;
    }
  }
}

.cargo—info {
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &>p:first-child {
    color: #A9C2C5;
    font-weight: 400;
    font-size: 16px;
  }

  &>p:last-child {
    font-size: 24px;
    font-weight: 400;
    color: #FFFFFF;
  }
}

.middle-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 10px;
}

.data-title {
  background: rgba(41, 137, 255, 0.2);
  font-size: 14px;
  font-weight: 600;
  opacity: .9;
  margin: 4px 0px;
  color: #FFFFFF;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    background: #FFAB10;
    margin: 4px 6px;
    border-radius: 50%;
  }

}

.flex-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-title {
  color: #8e9190;
}

.item {
  color: #ffffff
}

.report {
  font-size: 14px;
  color: #FFFFFF;
  .odd-bg{
    background: url("/resource/v1/ue5-migrate/assets/images/odd-bg.png");
    background-position: 50% 50%;
    background-size:100%;
    background-repeat: no-repeat;
    width: 76px;
    height: 76px;
  }
  .odd-numbers {
    width: 100px;
    text-align: left;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    -o-text-overflow: ellipsis;
  }

  .status-title {
    margin-bottom: 10px;
  }

  .status {
    border-left: 4px solid #3d4242;
    margin: 0px 10px;
    padding: 0px 10px;
  }
}

.device {
  font-size: 14px;
  color: #FFFFFF;
  margin: 4px 0px;
}
</style>
<style lang="less">
.modal-table-device {
  :deep(.sub-panel) {
    width: 1200px !important;
  }


  .ant-tabs-tab-btn {
    color: #fff;
  }
}

.ant-progress-inner {
  width: 40px !important;
  height: 40px !important;
  font-size: 12px !important;
}

.ant-progress-text {
  color: #fff !important;
}

.FINISHED {
  color: #58FAB6;
}

.PAUSED,.UNKNOWN ,.WAITED {
  color: rgb(255, 171, 16);
}

.PROGRESSED {
  color: #328bf7;
}

.prove {

  .ant-image-img {
    width: 56px;
    height: 34px;
    margin-left: 5px;
  }
}
</style>