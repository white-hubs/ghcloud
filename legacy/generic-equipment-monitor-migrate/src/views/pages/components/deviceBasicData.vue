<template>
  <ups v-if="applicationCode === 'ROTATINGMANAGE' && dataType === 'builtin.usage::ups'" :baseInfo="deviceData"
    :propsCodeList="propsCodeList" :attributeValue="attributeValue" class="ups-baseHeight" />
  <humiture
    v-else-if="(applicationCode === 'ROTATINGMANAGE' && dataType === 'builtin.usage::temp')||(applicationCode === 'GAS_MANAGEMENT' && dataType === 'builtin.usage::combustible.gas.monitor')"
    :baseInfo="deviceData" :propsCodeList="propsCodeList" :attributeValue="attributeValue" class="baseHeight" />
  <battery v-else-if="applicationCode === 'ROTATINGMANAGE' && dataType === 'builtin.usage::battery'"
    :baseInfo="deviceData" :propsCodeList="propsCodeList" :attributeValue="attributeValue" class="baseHeight" />
  <electric v-else-if="applicationCode === 'ELECTRICMANAGE' && dataType === 'builtin.usage::electrical.monitor'"
    :id="deviceId" :propsCodeList="propsCodeList" :dataArr="dataArr" :attributeValue="attributeValue"
    :subscribeRealTimeData="subscribeRealTimeData" :baseInfo="deviceData" class="baseHeight" />
  <fireControl v-else-if="(applicationCode === 'FIRECONTROL')&&dataType==='builtin.usage::liquid.level.sensors'"
    :baseInfo="deviceData" :attributeValue="attributeValue" class="baseHeight" :readAndWritData="readAndWritData"
    :attrData="hydraulicsData" />
  <div v-else class="baseHeight">
    <div class="header-name">
      <div class="item-title">基本信息</div>
    </div>
    <div class="fireControlMsg" v-if="deviceData">
      <div class="fireControlMsg-item">
        <div class="fireControlMsg-item-left">设备名称：</div>
        <div class="fireControlMsg-item-right">{{ deviceData.baseArchivesInfo.name }}</div>
      </div>
      <div class="fireControlMsg-item">
        <div class="fireControlMsg-item-left">设备编码：</div>
        <div class="fireControlMsg-item-right">
          {{ deviceData.baseArchivesInfo.code || '--' }}
        </div>
      </div>
      <div class="fireControlMsg-item">
        <div class="fireControlMsg-item-left">产品名称：</div>
        <div class="fireControlMsg-item-right">
          {{ deviceData.productInfo.name || '--' }}
        </div>
      </div>
      <div class="fireControlMsg-item">
        <div class="fireControlMsg-item-left">设备状态：</div>
        <div class="fireControlMsg-item-right">
          <span v-if="deviceData.baseArchivesInfo.status.onlineState" style="color: #5ccd4d">
            在线
          </span>
          <span v-else style="color: #fba33f">
            离线
          </span>
        </div>
      </div>
      <div class="fireControlMsg-item">
        <div class="fireControlMsg-item-left">所属区域：</div>
        <div class="fireControlMsg-item-right">
          {{ deviceData.areaName ?? '--'}}
        </div>
      </div>
      <div class="fireControlMsg-item">
        <div class="fireControlMsg-item-left">产品图片：</div>
        <div class="fireControlMsg-item-right bg">
          <a-image v-if="deviceData.picture" :width="80" :height="80" :src="deviceData.picture"
            style="object-fit: contain;width: 80px;height: 80px"></a-image>
          <a-image v-else :width="80" :height="80" :src="img.devicePng"
            style="object-fit: contain;width: 80px;height: 80px"></a-image>
        </div>
      </div>
    </div>
    <template v-if="deviceData&&deviceData.baseArchivesInfo.status.onlineState">
      <template v-if="applicationCode==='COOLINGWATER'||(applicationCode==='ELECTRICMANAGE'&&getCurrentAttr())">
        <echart-data :id="deviceId" :subscribeRealTimeData="subscribeRealTimeData"></echart-data>
      </template>
      <template v-else>
        <div v-if="readData.length">
          <div class="item-title">现场数据</div>
          <div class="fireControlMsg">
            <div class="fireControlMsg-item" v-for="(item, index) in readData" :key="index">
              <div class="fireControlMsg-item-left">{{ item.attributeName }}：</div>
              <div class="fireControlMsg-item-right">
                <template
                  v-if="item.attributeKeyValueVos.length&&(item.dataType === 'enum'||item.dataType === 'boolean')">
                  {{ item.attributeKeyValueVos.find(e=>e.value.toString() ===
                  attributeValue[item.attributeCode].toString())?.label ||'--' }}
                </template>
                <template v-else>
                  {{ attributeValue[item.attributeCode] ? `${attributeValue[item.attributeCode]} ${item.unitName}`
                  :"--"}}
                </template>
              </div>
            </div>
          </div>
          <!-- 用气管理 气体弄吐使用图表展示-->

        </div>
        <!-- 消防管理 现场属性-水压s、液位改成图表展示-->
        <div v-if="showFireWater">
          <div class="item-title">现场数据</div>
          <attr-chart-data :attributeValue="attributeValue" :attrData="fireWaterData"></attr-chart-data>
        </div>
        <div v-if="showGasCharts">
          <div class="item-title">现场数据</div>
          <use-gas-chart :attributeValue="attributeValue" :attrData="gasData" />
        </div>
        <div v-if="readAndWritData.length" :style="show? 'width: 180%;transform: translateX(-200px)':''">
          <div class="item-title">设备控制</div>
          <div class="fireControlMsg-control">
            <a-row :gutter="[16, 16]" style="margin-left: 0; margin-right: 0">
              <a-col :span="8" v-for="item in readAndWritData" :key="item.attributeCode">
                <div class="column">
                  <switch-attribute v-if="item.dataType.toLowerCase() === 'boolean'" :attributeItem="item"
                    :deviceId="deviceId" :curValue="attributeValue[item.attributeCode]"></switch-attribute>
                  <enumerate-attribute v-else-if="item.dataType.toLowerCase() === 'enum'" :attributeItem="item"
                    :deviceId="deviceId" :curValue="attributeValue[item.attributeCode]"></enumerate-attribute>
                  <set-string-attribute v-else-if="item.dataType.toLowerCase() === 'string'" :attributeItem="item"
                    :deviceId="deviceId" :curValue="attributeValue[item.attributeCode]"></set-string-attribute>
                  <set-value-attribute v-else :attributeItem="item" :deviceId="deviceId"
                    :curValue="attributeValue[item.attributeCode]"></set-value-attribute>
                </div>
              </a-col>
            </a-row>
          </div>
        </div>
        <div v-if="isDroneDevice" :style="show ? 'width: 180%;transform: translateX(-200px)' : ''">
          <div class="item-title">无人机操控</div>
          <div class="drone-control-panel">
            <div class="drone-control-header">
              <span class="drone-control-label">授权控制</span>
              <a-switch
                :checked="droneAuthorized"
                :loading="droneLoading.permission"
                checked-children="开"
                un-checked-children="关"
                @change="handleDroneControlPermission"
              />
            </div>
            <div class="drone-control-main">
              <div class="drone-control-actions">
                <a-button type="primary" :disabled="!droneAuthorized" :loading="droneLoading.powerOn" @click="handleDronePowerOn">开机</a-button>
                <a-button :disabled="!droneAuthorized" :loading="droneLoading.takeOff" @click="handleDroneTakeOff">起飞</a-button>
                <a-button :disabled="!droneAuthorized" :loading="droneLoading.hover" @click="handleDroneHover">悬停</a-button>
                <a-button :disabled="!droneAuthorized" :loading="droneLoading.returnPrecision" @click="handleDroneReturnPrecision">一键返航</a-button>
              </div>
              <div class="drone-control-direction">
                <div class="drone-direction-box">
                  <div class="drone-direction-title">飞行方向</div>
                  <div class="drone-direction-grid">
                    <a-button :disabled="!droneAuthorized" :loading="droneLoading.flyAction" @click="handleDroneFlyAction('forward')">前进</a-button>
                    <a-button :disabled="!droneAuthorized" :loading="droneLoading.flyAction" @click="handleDroneFlyAction('backward')">后退</a-button>
                    <a-button :disabled="!droneAuthorized" :loading="droneLoading.flyAction" @click="handleDroneFlyAction('left')">左移</a-button>
                    <a-button :disabled="!droneAuthorized" :loading="droneLoading.flyAction" @click="handleDroneFlyAction('right')">右移</a-button>
                  </div>
                </div>
                <div class="drone-direction-box">
                  <div class="drone-direction-title">设备方向</div>
                  <div class="drone-direction-grid">
                    <a-button :disabled="!droneAuthorized" :loading="droneLoading.flyAction" @click="handleDroneFlyAction('up')">上升</a-button>
                    <a-button :disabled="!droneAuthorized" :loading="droneLoading.flyAction" @click="handleDroneFlyAction('down')">下降</a-button>
                    <a-button :disabled="!droneAuthorized" :loading="droneLoading.flyAction" @click="handleDroneFlyAction('rotateLeft')">左旋</a-button>
                    <a-button :disabled="!droneAuthorized" :loading="droneLoading.flyAction" @click="handleDroneFlyAction('rotateRight')">右旋</a-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  onActivated,
  onDeactivated,
  getCurrentInstance,
  ref,
  computed,
  onUnmounted,
  nextTick,
  watch
} from "vue";
import { useStore } from "vuex";
const devicePng = '/resource/v1/generic-equipment-monitor-migrate/device.png'
import EnumerateAttribute from './deviceAttribute/enumerateAttribute.vue'
import setValueAttribute from './deviceAttribute/setValueAttribute.vue'
import setStringAttribute from './deviceAttribute/setStringAttribute.vue'
import switchAttribute from './deviceAttribute/switchAttribute.vue'
import echartData from "./echartData.vue";
import attrChartData from './attrChartData.vue'
import useGasChart from "./useGasChart.vue";
import { GHIotSocket } from "@ghcloud/cube-iot-socket";
import { authStore } from "@/api/auth-store";
import { cubeFileService, cubeMdataService, cubeDeviceCenterService } from "@/api/service";
import { message } from "ant-design-vue";
import ups from "../rotating-ring/ups/index.vue";
import humiture from "../rotating-ring/humiture/index.vue";
import battery from "../rotating-ring/battery/index.vue";
import electric from '../rotating-ring/electric/index.vue'
import fireControl from '../rotating-ring/fire-control/index.vue'

const droneFlyActionMap = Object.freeze({
  forward: 0,
  backward: 1,
  left: 2,
  right: 3,
  rotateLeft: 4,
  rotateRight: 5,
  up: 6,
  down: 7,
})

export default defineComponent({
  name: "",
  components: {
    EnumerateAttribute,
    setValueAttribute,
    setStringAttribute,
    switchAttribute,
    echartData,
    attrChartData,
    useGasChart,
    ups,
    humiture,
    battery,
    electric,
    fireControl
  },
  props: {
    deviceId: {
      type: String,
      default: "",
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const getCurrentAttr = () => {
      const attr = ['ua', 'ia', 'temp_a', 'temp_b', 'temp_c', 'uab', 'iab']
      let flag = true
      for (let i = 0; i < attr.length; i++) {
        const attrData = state.deviceAttributes.find(e => e.attributeCode.includes(attr[i]))
        if (attrData !== undefined) {
          flag = true
          break
        } else {
          flag = false
        }
      }
      return flag

    }
    const messageMsg = (message) => {
      switch (message.msgType) {
        case "WELCOME":
          break;
        case "SUBSCRIBE_PUSH":
          subscribeRealTimeData.value = JSON.parse(message.content).msg.updates;
          subscribeRealTimeData.value.forEach((item) => {
            if (state.attributeValue.hasOwnProperty(item.key)) {
              state.attributeValue[item.key] = item.value;
            }
          });
          break;
        default:
          return false;
      }
    };
    let iotSocket;
    const applicationCode = ref('')
    const subscribeRealTimeData = ref();
    const store = useStore();
    const state = reactive({
      deviceData: null,
      deviceAttributes: [],
      readData: [],
      readAndWritData: [],
      attributeValue: {},
      showFireWater: false,
      fireWaterData: [],
      hydraulicsData: [],
      showGasCharts: false,
      gasData: [],
      propsCodeList: [],
      dataArr:[],
      deviceType: '',
      droneNestSn: '',
      droneAuthorized: false,
      droneLoading: {
        permission: false,
        powerOn: false,
        takeOff: false,
        hover: false,
        returnPrecision: false,
        flyAction: false,
      }
    });
    const { proxy } = getCurrentInstance();
    const isDroneDevice = computed(() => state.deviceData?.productInfo?.name?.includes('无人机'));

    const normalizeDroneNestSn = (value) => {
      if (value === undefined || value === null) {
        return '';
      }
      return String(value).trim();
    }

    const resolveDroneNestSn = (dataArr) => {
      if (!Array.isArray(dataArr)) {
        return '';
      }

      const droneSnItem = dataArr.find((item) => item?.attributeCode === 'droneSn');
      const droneSn = normalizeDroneNestSn(droneSnItem?.value);
      if (droneSn) {
        return droneSn;
      }

      return '';
    }

    const refreshDroneNestSn = () => {
      state.droneNestSn = resolveDroneNestSn(state.readData);
    }

    const getDroneNestSn = () => {
      const nestSn = normalizeDroneNestSn(state.droneNestSn);
      if (!nestSn) {
        message.warning('现场数据缺少 droneSn，无法执行无人机操控');
        return '';
      }
      return nestSn;
    }

    const ensureDroneAuthorized = () => {
      if (state.droneAuthorized) {
        return true;
      }
      message.warning('请先开启授权控制，再执行操控');
      return false;
    }

    const requestDroneCommand = async (loadingKey, requestFn, successMsg, extraPayload = {}) => {
      if (state.droneLoading[loadingKey]) {
        return;
      }

      if (!ensureDroneAuthorized()) {
        return;
      }

      const nestSn = getDroneNestSn();
      if (!nestSn) {
        return;
      }

      state.droneLoading[loadingKey] = true;
      try {
        await requestFn({
          nestSn,
          ...extraPayload,
        });
        message.success(successMsg);
      } catch (error) {
        message.error('无人机操控失败，请稍后重试');
      } finally {
        state.droneLoading[loadingKey] = false;
      }
    }

    const handleDroneControlPermission = async (checked) => {
      if (state.droneLoading.permission) {
        return;
      }

      const nestSn = getDroneNestSn();
      if (!nestSn) {
        return;
      }

      state.droneLoading.permission = true;
      try {
        await proxy.$api.setDroneControlPermission({
          nestSn,
          authorized: checked,
        });
        state.droneAuthorized = checked;
        message.success(checked ? '获取控制权限成功' : '释放控制权限成功');
      } catch (error) {
        message.error('授权控制操作失败，请稍后重试');
      } finally {
        state.droneLoading.permission = false;
      }
    }

    const releaseDroneControlPermission = async () => {
      if (!state.droneAuthorized || state.droneLoading.permission) {
        return;
      }

      const nestSn = normalizeDroneNestSn(state.droneNestSn);
      state.droneLoading.permission = true;
      try {
        if (nestSn) {
          await proxy.$api.setDroneControlPermission({
            nestSn,
            authorized: false,
          });
        }
      } catch (error) {
      } finally {
        state.droneAuthorized = false;
        state.droneLoading.permission = false;
      }
    }

    const handleDronePowerOn = async () => requestDroneCommand('powerOn', proxy.$api.dronePowerOn, '开机指令已发送');

    const handleDroneTakeOff = async () => requestDroneCommand(
      'takeOff',
      proxy.$api.droneTakeOff,
      '起飞指令已发送',
      { scheduleId: 88888 }
    );

    const handleDroneHover = async () => requestDroneCommand('hover', proxy.$api.droneHover, '悬停指令已发送');

    const handleDroneReturnPrecision = async () => requestDroneCommand('returnPrecision', proxy.$api.droneReturnPrecision, '返航指令已发送');

    const handleDroneFlyAction = async (action) => {
      if (state.droneLoading.flyAction) {
        return;
      }

      const type = droneFlyActionMap[action];
      if (type === undefined) {
        return;
      }

      if (!ensureDroneAuthorized()) {
        return;
      }

      const nestSn = getDroneNestSn();
      if (!nestSn) {
        return;
      }

      state.droneLoading.flyAction = true;
      try {
        await proxy.$api.droneFlyAction({
          nestSn,
          type,
        });
      } catch (error) {
        message.error('飞行操控失败，请稍后重试');
      } finally {
        state.droneLoading.flyAction = false;
      }
    }

    // 获取设备属性
    const getBasicData = async () => {
      const data = await proxy.$api.getDeviceInfo({ deviceId: props.deviceId });
      if (data) {
        // 基础信息
        state.deviceData = data;
        // 反查设备区域
        getDeviceAreaName(data.baseArchivesInfo.area?.pathId)
        // 反查设备图片
        if (data.productInfo.picture) {
          cubeFileService.getFileInfo(data.productInfo.picture).then(res => {
            state.deviceData.picture = res.path
          })
        }
        if (!iotSocket) {
          return
        }
        // 设备详情
        const deviceDetail = await iotSocket.deviceDetail({
          deviceId: props.deviceId,
          withSnapShot: true,
          withPropertySpec: true,
        })
        state.propsCodeList = deviceDetail?.deviceInfo?.productPropVoList
        
        const { dataArr } = deviceDetail
        state.dataArr = dataArr
        if (dataArr) {
          // 基础信息
          
          state.deviceAttributes = dataArr;
          subscribeRealTimeData.value = dataArr;
          const excludeCode = ["pressure", "natural_gas_concentration"];
          // 现场只读
          state.readData = dataArr.filter(
            (item) =>
              item.permission === "READ" && !excludeCode.includes(item.attributeCode)
          );
          // 读写数据
          state.readAndWritData = dataArr.filter((item) => item.permission === "READ_WRITE");
          // 将设备所有属性用对象包装起来，方便订阅过来的数据填充值
          state.attributeValue = Object.fromEntries(
            state.deviceAttributes.map((item) => [item.attributeCode, item.value])
          );
          refreshDroneNestSn();
          getGasData(state.deviceAttributes);
          getFireWater(state.deviceAttributes);
        }
      }
    };
    const dataType = ref('')
    const tagCode = [
      'builtin.usage::ups',
      'builtin.usage::battery',
      'builtin.usage::temp',
      'builtin.usage::fire',
      'builtin.usage::combustible.gas.monitor',
      'builtin.usage::liquid.level.sensors',
      'builtin.usage::electrical.monitor'
    ]
    const getDeviceTagCode = () => {
      try {
        cubeDeviceCenterService.getDeviceTagCode([props.deviceId]).then(res => {
          tagCode.forEach(e => {
            res[props.deviceId].tags.forEach((item) => {
              if (e === item.tagCode) {
                dataType.value = item.tagCode
              }
            })
          })
        })
      } catch (error) {
      }
    }
    onActivated(() => {
      state.droneAuthorized = false;
    });
    onDeactivated(() => {
      releaseDroneControlPermission()
    });
    onUnmounted(() => {
      releaseDroneControlPermission()
      window.removeEventListener('resize', getScrollHeight)
      iotSocket && iotSocket.unsubscribe();
      iotSocket && iotSocket.dispose()
    });

    const getDeviceAreaName = (pathId) => {
      if (!pathId) return
      try {
        pathId.endsWith('-') && (pathId = pathId.slice(0, -1))
        pathId = pathId.split('-')
        pathId = pathId[pathId.length - 1]
        cubeMdataService.getAreaNamesById(pathId).then(res => {
          state.deviceData.areaName = res
        })
      } catch (error) {
        message.error('获取设备区域失败')
      }
    }
    // 消防水压
    const getFireWater = (data) => {
      state.showFireWater = Object.keys(state.attributeValue).includes('pressure') && applicationCode.value === 'FIRECONTROL'
      state.fireWaterData = data.filter(item => item.attributeCode === 'pressure')
      state.hydraulicsData = data.filter(item => item.attributeCode === 'hydraulics')
    };
    const getGasData = (data) => {
      state.gasData = data.filter(item => item.attributeCode === 'natural_gas_concentration')
      state.showGasCharts = Object.keys(state.attributeValue).includes('natural_gas_concentration') && applicationCode.value === 'GAS_MANAGEMENT'
    }

    /*获取table高度*/
    const getScrollHeight = async () => {
      // 等待下一个DOM更新周期
      await nextTick()
      
      const tableBody = document.getElementsByClassName("content-table")[0];
      const tabBar = document.getElementsByClassName("ant-tabs-bar")[1]
      const pageContent = document.getElementsByClassName('baseHeight')[0]
      const deviceControl = document.getElementsByClassName('fireControlMsg-control')[0]
      const droneControl = document.getElementsByClassName('drone-control-panel')[0]
    
      // 确保所有元素都存在
      if (!tableBody || !pageContent) return;
    
      // 计算高度时进行空值检查
      const tabBarHeight = tabBar?.clientHeight ?? 0
      const deviceControlHeight = deviceControl?.clientHeight ?? 0
      const droneControlHeight = droneControl?.clientHeight ?? 0
      
      // 设置最小高度，确保内容可见
      const minHeight = 500
      const calculatedHeight = Math.max(
        tableBody.clientHeight - tabBarHeight - deviceControlHeight - droneControlHeight - 40,
        minHeight
      )
      pageContent.style.height = `${calculatedHeight}px`
    };
    watch(
      () => state.readAndWritData,
      async () => {
        await nextTick()
        await getScrollHeight()
      }
    )
    watch(
      () => state.readData,
      () => {
        refreshDroneNestSn()
      },
      { deep: true }
    )
    onMounted(async () => {
      applicationCode.value = JSON.parse(sessionStorage.getItem('GH-currentApplication')).code
      state.droneAuthorized = false;
      window.addEventListener('resize', getScrollHeight)
      try {
        const authInfo = { ...authStore }
        authInfo.accessToken = authInfo.token
        iotSocket = new GHIotSocket(authInfo);
        iotSocket.onmessage(messageMsg);
      } catch (error) {
      }
      await getBasicData();
      await getDeviceTagCode();
      await getScrollHeight();
    });
    return {
      ...toRefs(state),
      applicationCode,
      img: {
        devicePng,
      },
      dataType,
      tagCode,
      getCurrentAttr,
      subscribeRealTimeData,
      messageMsg,
      getBasicData,
      getDeviceAreaName,
      getFireWater,
      getGasData,
      getDeviceTagCode,
      getScrollHeight,
      isDroneDevice,
      handleDroneControlPermission,
      handleDronePowerOn,
      handleDroneTakeOff,
      handleDroneHover,
      handleDroneReturnPrecision,
      handleDroneFlyAction
    };
  },
});
</script>
<style scoped lang="less">
.fireControlMsg {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  flex-wrap: wrap;
  margin-bottom: 20px;

  // height: 200px;
  .fireControlMsg-item {
    width: 30%;
    display: flex;
    justify-content: flex-start;
    margin-top: 20px;
    margin-left: 20px;
    font-size: 15px;

    .fireControlMsg-item-left {
      font-weight: 400;
    }

    .fireControlMsg-item-right {
      margin-left: 10px;
    }
  }

  .bg {
    width: 82px;
    height: 82px;
    background: #f8f8f8;
    border-radius: 4px 4px 4px 4px;
    opacity: 1;
    border: 1px solid #f2f2f2;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.item-title {
  width: 100%;
  text-align: left;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #000000d9;
  border-bottom: 1px solid #e8e8e88c;
  padding-bottom: 6px;
  padding-top: 5px;
  font-family: "PingFang SC-Medium";


}

.fireControlMsg-control {
  .column {
    min-height: 50px;
    display: flex;
    align-items: center;
    background: rgba(250, 250, 250, 1);
    padding: 10px 16px;
  }
}

.drone-control-panel {
  background: rgba(250, 250, 250, 1);
  padding: 16px;
}

.drone-control-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.drone-control-label {
  font-size: 14px;
  font-weight: 500;
  color: #000000d9;
}

.drone-control-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drone-control-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.drone-control-direction {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.drone-direction-box {
  background: #ffffff;
  border: 1px solid #f0f0f0;
  padding: 16px;
}

.drone-direction-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #000000d9;
}

.drone-direction-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.baseHeight {
  overflow: auto !important;
  padding-right: 15px !important;
  padding-bottom: 15px !important;
}
</style>
