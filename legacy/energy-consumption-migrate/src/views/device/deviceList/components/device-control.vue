<template>
  <div>
    <div class="field-data" v-if="readData.length">
      <p>|| 设备特性</p>
      <div class="fireControlMsg">
          <div class="fireControlMsg-item" v-for="(item, index) in readData" :key="index">
            <div class="fireControlMsg-item-left">{{ item.attributeName }}：</div>
            <div class="fireControlMsg-item-right">
              <template v-if="item.attributeKeyValueVos.length&&(item.dataType === 'enum'||item.dataType === 'boolean')">
                {{ item.attributeKeyValueVos.find((e:any)=>e.value.toString() === attributeValue[item.attributeCode].toString())?.label ||'--' }}
              </template>
              <template v-else>
                {{ attributeValue[item.attributeCode] ? `${attributeValue[item.attributeCode]} ${item.unitName}` :"--"}}
              </template>
            </div>
          </div>
        </div>
    </div>
    <div v-if="readAndWritData.length" :style="show? 'width: 180%;transform: translateX(-200px)':''">
        <div class="item-title">设备控制</div>
        <div class="fireControlMsg-control">
          <Row :gutter="[16, 16]" style="margin-left: 0; margin-right: 0">
            <Col :span="8" v-for="item in readAndWritData" :key="item.attributeCode">
              <div class="column">
                <switch-attribute v-if="item.dataType.toLowerCase() === 'boolean'" :attributeItem="item" :deviceId="deviceId"
                  :curValue="attributeValue[item.attributeCode]"></switch-attribute>
                <enumerate-attribute v-else-if="item.dataType.toLowerCase() === 'enum'" :attributeItem="item" :deviceId="deviceId"
                  :curValue="attributeValue[item.attributeCode]"></enumerate-attribute>
                <set-string-attribute v-else-if="item.dataType.toLowerCase() === 'string'" :attributeItem="item" :deviceId="deviceId"
                  :curValue="attributeValue[item.attributeCode]"></set-string-attribute>
                <set-value-attribute v-else :attributeItem="item" :deviceId="deviceId"
                  :curValue="attributeValue[item.attributeCode]"></set-value-attribute>
              </div>
            </Col>
          </Row>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import {Col,Row} from'ant-design-vue'
import { onMounted, ref, watch } from 'vue'
import { authStore } from "@/api/auth-store";
import { GHIotSocket } from "@ghcloud/cube-iot-socket";
import EnumerateAttribute from './deviceAttribute/enumerateAttribute.vue'
import setValueAttribute from './deviceAttribute/setValueAttribute.vue'
import setStringAttribute from './deviceAttribute/setStringAttribute.vue'
import switchAttribute from './deviceAttribute/switchAttribute.vue'
const emit = defineEmits(['value'])
interface Props {
  deviceId: any;
  show: any;
  instrumentType:string;
}
const props = withDefaults(defineProps<Props>(), {
  deviceId:'',
  show:false,
  instrumentType:''
});
const readAndWritData=ref<any[]>([])
// 获取设备属性
let iotSocket: GHIotSocket;
const attributeValue=ref()
const propsCodeList=ref<any[]>([])
const readData=ref<any[]>([])
const deviceAttributes=ref() 
const getBasicData = async () => {
  if (!iotSocket) {
    return
  }
  // 设备详情
  const deviceDetail = await iotSocket.deviceDetail({
    deviceId: props.deviceId,
    withSnapShot: true,
    withPropertySpec: true,
  })
  propsCodeList.value = deviceDetail.deviceInfo.productPropVoList
  const { dataArr } = deviceDetail
  if (dataArr) {
    // 基础信息
    deviceAttributes.value = dataArr;
    const excludeCode = ["pressure", "natural_gas_concentration"];
          // 现场只读
          readData.value = dataArr.filter(
            (item) =>
              item.permission === "READ" && !excludeCode.includes(item.attributeCode)
          );
    // 读写数据
    readAndWritData.value = dataArr.filter((item) => item.permission === "READ_WRITE");
    // 将设备所有属性用对象包装起来，方便订阅过来的数据填充值
    attributeValue.value = Object.fromEntries(
      deviceAttributes.value.map((item:any) => [item.attributeCode, item.value])
    );
  }
};
watch(()=>props.deviceId,()=>{
  getBasicData()
})
onMounted(() => {
  getBasicData();
  try {
    const authInfo = { ...authStore }
    authInfo.accessToken = authInfo.token
    iotSocket = new GHIotSocket(authInfo);
  } catch (error) {}
});
</script>
<style scoped lang="less">
.field-data,.fireControlMsg-control {
  &>div{
    display: flex;
  }
  p{
      margin-top: 20px;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 10px;
      color: rgba(0, 0, 0, 0.85);
      font-family: "PingFang SC-Medium";
  }
  .column {
    min-height: 50px;
    display: flex;
    align-items: center;
    background: rgba(250, 250, 250, 1);
    padding: 10px 16px;
  }
  .device-info {
    margin: 10px 30px;
    min-width: 250px;
    .item {
      display: flex;
      padding:4px 0px;
      .label {
        width: 50%;
      }
      .value {
        width: 50%;
      }
    }
  }
}
.fireControlMsg {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  flex-wrap: wrap;
  margin-bottom: 20px;
  overflow-y: auto;

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
  height: 35px;
  line-height: 35px;
  text-align: left;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #000000d9;
  border-top: 1px solid #e8e8e88c;
  padding-top: 5px;
  font-family: "PingFang SC-Medium";

  &:first-child {
    border: none;
  }
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
.baseHeight {
  overflow:auto !important;
  height:53vh !important;
  padding-right:15px !important;
  padding-bottom:15px !important;
}
</style>
