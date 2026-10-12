<template>
  <div v-if="state.alarmSnapshotDetail.length">
    <a-tabs v-model:activeKey="state.activeKey">
      <a-tab-pane :tab="item.propName" v-for="item in state.alarmSnapshotDetail" :key="item.propCode">
        <div class="container">
          <div class="content">
            <div class="item" v-if="componentsChartDetail.length">
              <div class="label">报警值：</div>
              <div class="value">
                <div v-for="item in componentsChartDetail" :key="item.propCode">
                  <component :is="AlarmChartComponent[item.propCode]" :min="item.minValue" :max="item.maxValue"
                    :label="item.propName" :isAlarmModal="true" :value="`${item.propValue}`" :unit="item.unit">
                  </component>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
  <div v-else style="
              position: absolute;
              top: 183px;
              right: 0;
              z-index: -1;
              width: 100%;
              height: 269px;
              text-align: center;
            ">
    <img :src="alarmModalPng" alt="" />
    <div style="line-height: normal;color: #fff;margin-top: 30px;">暂无数据快照</div>
  </div>

</template>

<script setup lang="ts">
import { reactive, onMounted, computed,watch } from 'vue';
import { cubeDeviceCenterService } from "@/api/service";
const alarmModalPng = '/resource/v1/ue5-sn-migrate/assets/images/alarm-empty.png'
import {AlarmChartComponent} from './index.ts'
const numberDataType=['int', 'long', 'float', 'double']
const componentsChartDetail=computed(()=>{
  const componentKeys=new Set(Object.keys(AlarmChartComponent)) 
  const snapshotKeys=new Set(state.alarmSnapshotDetail.map(item=>item.propCode)) 
  const intersectionKeys=[...componentKeys].filter(x => snapshotKeys.has(x))
  return state.alarmSnapshotDetail.filter(item=>intersectionKeys.includes(item.propCode))
})
/**
* 数据部分
*/
const state = reactive<{alarmSnapshotDetail:Record<string,string>[],activeKey:string}>({
  alarmSnapshotDetail:[],
  activeKey:'',
})

const props = defineProps<{
  alarmInfo: Record<string,any>, 
  id:String
}>();
onMounted(() => {
  handleAlarmSnapshot();
})
const handleAlarmSnapshot=async ()=>{
  const {alarmSnapshot,alarmTargetKey}=props.alarmInfo
  if(!alarmSnapshot){
    state.alarmSnapshotDetail=[]
    return;
  } 
  
  const { matchSnapshot }=typeof alarmSnapshot==='string'? JSON.parse(alarmSnapshot) : alarmSnapshot
  
  const params = { deviceId: alarmTargetKey,withPropertySpec:true,withSnapShot:true }
  const result = (await cubeDeviceCenterService.getNorthDeviceDetail(params)) as unknown as Record<string,any>
  
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
  
    state.activeKey=alarmSnapshotDetail.length?alarmSnapshotDetail[0].propCode:""
    state.alarmSnapshotDetail = alarmSnapshotDetail
}
watch(()=>props.alarmInfo,()=>{
  handleAlarmSnapshot()
},{deep:true})

</script>

<style scoped lang='less'>
.container {
  padding: 18px 23px;
  height: 266px;
  // display: flex;
  // align-items: center;
  // justify-content: center;
  color: #fff;
  background: url('./alarm-bg.png') no-repeat;
  background-size: 100% 100%;
  border-radius: 4px;
  position: relative;


  .content {
    height: 100%;
    position: absolute;
    // transition:;


    .item {
      height: 100%;
      display: flex;
      gap: 60px;

      .label {
        color: rgba(255, 255, 255, 0.80);
        flex-shrink: 0;
      }

      .value {
        margin-top: 20px;
      }
    }

  }
}
</style>
