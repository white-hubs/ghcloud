<template>
  <div class="control" v-if="onlineState">
    <template v-if="readData.length > 0">
      <div class="state">
        <div class="fireControlMsg">
          <div class="fireControlMsg-item" v-for="(item, index) in readData" :key="index">
            <div class="fireControlMsg-item-left">{{ item.attributeName }}：</div>
            <div class="fireControlMsg-item-right">
              <template v-if="item.attributeKeyValueVos.length && item.attributeKeyValueVos[0].value!==null&& item.attributeKeyValueVos[0].value!==undefined">
                {{ 
                  item.attributeKeyValueVos.find(e=>e.value==attributeValueRead[item.attributeCode])?.keyName ||
                  item.attributeKeyValueVos.find(e=>e.value==attributeValueRead[item.attributeCode])?.label ||
                   '--' }}
              </template>
              <template v-else>
                {{ attributeValueRead[item.attributeCode] || '--'}}{{ attributeValueRead[item.attributeCode]?item.unitName:'' }}
              </template>
            </div>
          </div>
        </div>
      </div>
      <template v-if="dashboardTagCode">
        <ElectricDashboard 
          v-if="BuildInTagCodesEnum.ELECTRICAL_MONITOR === dashboardTagCode || 'ELECTRICMANAGE' === dashboardTagCode" 
          :data="attributeValueRead"
          :productPropVoList="productPropVoList"
          :showAllElectricEnergy="'ELECTRICMANAGE' === dashboardTagCode"
        />
        <UpsDashboard 
          v-else-if="BuildInTagCodesEnum.UPS === dashboardTagCode" 
          :data="attributeValueRead" 
          :productPropVoList="productPropVoList" 
          :deviceInfo="deviceBaseInfo"
        />
        <HumidityDashboard 
          v-else-if="[BuildInTagCodesEnum.TEMP,BuildInTagCodesEnum.COMBUSTIBLE_GAS_MONITOR].includes(dashboardTagCode as BuildInTagCodesEnum)" 
          :data="attributeValueRead" 
          :productPropVoList="productPropVoList" 
          :deviceInfo="deviceBaseInfo"
        />
        <FirePressureDashboard
          v-else-if="BuildInTagCodesEnum.FIRE_WATER_PRESSURE === dashboardTagCode" 
          :data="attributeValueRead" 
          :productPropVoList="productPropVoList" 
          :deviceInfo="deviceBaseInfo"
        />
        <LiquidLevelSensors
          v-else-if="BuildInTagCodesEnum.LIQUID_LEVEL_SENSORS === dashboardTagCode" 
          :data="attributeValueRead" 
          :productPropVoList="productPropVoList" 
          :deviceInfo="deviceBaseInfo"
        />
        <!-- <span v-else style="color:white">{{ dashboardTagCode }}</span>
        <span style="color:white">{{ attributeValueRead }}</span> -->
      </template>
    </template>
    <div class="fireControlMsg-control">
      <div class="column" v-for="item in readAndWritData" :key="item.attributeCode">
        <switch-attribute  :code="props.code" class="attribute" v-if="item.dataType === 'boolean'" :attributeItem="item" :deviceId="id"
          v-model::curValue="attributeValue[item.attributeCode]"></switch-attribute>
        <enumerAteattribute class="attribute" v-else-if="item.dataType === 'enum'" :attributeItem="item" :deviceId="id"
          v-model:curValue="attributeValue[item.attributeCode]" :code="props.code"></enumerAteattribute>
        <set-value-attribute class="attribute" v-else :attributeItem="item" :deviceId="id"
          v-model::curValue="attributeValue[item.attributeCode]"></set-value-attribute>
      </div>
    </div>
  </div>
  <a-empty v-else :description="'暂无数据'" />
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import enumerAteattribute from "./deviceAttribute/enumerateAttribute.vue";
import setValueAttribute from "./deviceAttribute/setValueAttribute.vue";
import switchAttribute from "./deviceAttribute/switchAttribute.vue";
import { iotSocketStore } from "@/piniaStore/iotSocketStore";
import { useSubscribeStore } from "@/piniaStore/socketSubscribe";
import { BuildInTagCodesEnum,checkForBuiltInDashboardTagCode } from "@ghcloud/cube-iot-center-service";
import { authStore } from "@/api/auth-store";
import ElectricDashboard from "./device-dashboard/electric/electric.vue";
import UpsDashboard from "./device-dashboard/ups/ups.vue";
import HumidityDashboard from "./device-dashboard/humidity/humidity.vue";
import FirePressureDashboard from "./device-dashboard/fire/pressure.vue";
import LiquidLevelSensors from "./device-dashboard/fire/liquid-level-sensors.vue";
import { cubeDeviceCenterService } from "@/api/service";

const piniaIot = iotSocketStore()
const piniaUseSubscribeStore = useSubscribeStore();
const props = defineProps({
  id: {
    type: [String],
    default: "",
  },
  readAndWritData: {
    type: [Array],
    default: [],
  },
  readData: {
    type: [Array],
    default: [],
  },
  code: {
    type: [String],
    default: "",
  },
  deviceAttributes: {
    type: [Array],
    default: [],
  }
});
const dashboardTagCode = ref('')
const deviceBaseInfo = ref()
const productPropVoList =ref([])
const readAndWritData = ref<any>(props.readAndWritData);
const attributeValue = ref();
const onlineState = ref(false)

attributeValue.value = Object.fromEntries(
  props.readAndWritData.map((item: any) => [item.attributeCode, "--"])
);

const readData = ref<any>(props.readData);
const attributeValueRead = ref();
attributeValueRead.value = Object.fromEntries(
  props.readData.map((item: any) => [item.attributeCode, "--"])
);

watch(() => piniaUseSubscribeStore.subscribeData, (val: any) => {
  if (val.deviceId === props.id) {
    val.updates.forEach(item=>{
      if (attributeValueRead.value.hasOwnProperty(item.key)) {
        attributeValueRead.value[item.key] = item.value;
      }
      if (attributeValue.value.hasOwnProperty(item.key)) {
        attributeValue.value[item.key] = item.value;
      }
    })
  }
})

const getCurrentAttr = (deviceProductPropVoList) => {
  const attr = ['ua', 'ia', 'temp_a', 'temp_b', 'temp_c', 'uab', 'iab']
  let flag = false
  for (let i = 0; i < attr.length; i++) {
    const attrData = deviceProductPropVoList.find(e => e.propCode===attr[i])
    if (attrData !== undefined) {
      flag = true
      break
    }
  }
  return flag
}

onMounted(async () => {
  if (piniaIot.iotSocket) {
    const {dataArr,deviceInfo} = await piniaIot.iotSocket.deviceDetail({
      deviceId: props.id,
      withSnapShot:true,
      withPropertySpec:true
    })
    const deviceInstanceDetail = await cubeDeviceCenterService.getDeviceInstanceDetail({deviceId:props.id})
    onlineState.value = deviceInstanceDetail.baseArchivesInfo.status.onlineState
    readData.value = dataArr.filter((item) => item.permission === "READ");
    readAndWritData.value = dataArr.filter((item) => item.permission === "READ_WRITE");
    attributeValueRead.value = Object.fromEntries(
      readData.value.map((item: any) => {
        if(item.value === null || item.value === '' || item.value === undefined){
          return [item.attributeCode, undefined]
        }else{
          return [item.attributeCode, item.value]
        }
        // [item.attributeCode, item.value]
      })
    );
    attributeValue.value = Object.fromEntries(
      readAndWritData.value.map((item: any) => [item.attributeCode, item.value])
    );

    deviceBaseInfo.value = deviceInfo
    productPropVoList.value = deviceInfo.productPropVoList
    // 判断当前的设置是否命中内置仪表盘
    checkForBuiltInDashboardTagCode(authStore,props.id).then(res=>{
      dashboardTagCode.value = res
      if(!res && getCurrentAttr(deviceInfo.productPropVoList)){
        dashboardTagCode.value = 'ELECTRICMANAGE'
      }
    })
  }

})

onUnmounted(()=>{
  piniaIot.iotSocket.unsubscribe()
})
</script>

<style lang="less" scoped>
.attribute {
  margin-top: 10px;
}

.control {
  font-size: 14px;
  height: 340px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 10px;
}


.title {
  font-weight: 500;
  color: #FFFFFF;
  font-size: 20px;
  margin-top: 10px;
}

.state {
  min-height: 150px;
}

.fireControlMsg {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  flex-wrap: wrap;
  margin-bottom: 20px;

  .fireControlMsg-item {
    width: 30%;
    display: flex;
    justify-content: flex-start;
    margin-top: 20px;
    margin-left: 20px;
    font-size: 15px;

    .fireControlMsg-item-left {
      font-weight: 400;
      color: #B7C5D3;
    }

    .fireControlMsg-item-right {
      margin-left: 10px;
      color: #fff
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
:deep(.ant-empty-description){
  color: #fff
}
</style>
