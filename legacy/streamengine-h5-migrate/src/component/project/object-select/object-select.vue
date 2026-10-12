<template>
  <VanField
    v-if="props.readonly"
    :required="props.required"
    :label="label"
    :model-value="selected?.name ?? selected?.projectName ?? selected?.patrolLocationName"
    readonly />
  <template v-else>
  <VanField :required="props.required" :model-value="selected?.name??selected?.projectName??selected?.patrolLocationName" readonly name="picker"
    :label="label" @click="handleShowPicker" placeholder="请选择或者扫码输入" :error-message="errorMessage"
    is-link right-icon="scan" @click-right-icon.stop="useScan" />
  <VanPopup v-model:show="showPicker" position="right" duration="0.2">
    <div class="object-select-pop">
      <VanNavBar class="nav" :title="modalTitle" left-text="返回" right-text="" @click-left="cancel" />
      <VanSearch v-model="searchValue" show-action placeholder="根据对象名称进行搜索" left-icon="">
        <template #action>
          <div @click.stop="onClickSearchButton">搜索</div>
        </template>
      </VanSearch>
      <div class="list">
        <van-list :loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
          <van-cell v-for="item in datalist" :key="item.id" :title="item.name??item.projectName??item.patrolLocationName"
            @click="selectedCell=item">
            <template #label>
              <span class="custom-title">所属区域：{{item.areaName || (item.areaNames ||(typeof item.area==='object'&&item.area?.map(x=>x.name)?.join('/'))||'--')}}</span><br />
              <span class="custom-title" v-show="objectType!='PATROL_POINT'">类型：{{item.typeName || ((item.productInfo?item.productInfo.name:'') ||item.projectTypeName|| '--')}}</span>
            </template>
            <template #right-icon>
              <VanCheckbox :model-value="selectedCell?.id===item.id" :shape="'round'" />
            </template>
          </van-cell>
        </van-list>
      </div>
      <div class="btn-area">
        <span>
          <template v-if="selectedCell?.id">
            已选择：{{selectedCell?.name??selectedCell?.projectName??selectedCell.patrolLocationName}}
          </template>
        </span>
        <VanButton type="primary" size="small" @click="confirm">确定</VanButton>
      </div>
    </div>
  </VanPopup>
  </template>
</template>
<script setup lang="ts">
import { DynamicTableProcessType, DynamicTableRoute } from '../../../business/dynamic-table/dynamic-table'
import { FormItemExpose } from '../../../business/dynamic-table/form-item';
import { gearService } from '../../../service/gear/gear'
import { identityService } from '../../../service/identity/identity'
import { inspectService } from '../../../service/inspect/inspect'
import { propertyService } from '../../../service/property/property'
import { CubeAppBusinessBridge, cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { showNotify } from 'vant'
import { watch } from 'vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import bus from "../../../infrastructure/bus";
import { cubeDeviceCenterService, cubeMaintainService } from '../../../service/service'
import { smallScattered } from '../../../service/smallScattered';
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config';

const { query: { businessType , processType} } = useRoute() as DynamicTableRoute
const emits = defineEmits(['update:modelValue'])
const props = defineProps<{
  required?: boolean;
  readonly?: boolean;
  label?: string;
  modelValue?: {id:string,name:string}[],
  dependFormValues: [string];
  params:string;
}>()

enum ObjectType {
  设备='DEVICE',
  档位='STALL',
  资产='PROPERTY',
  现场点='SITE_POINT',
  小散工程='SMALL_ENGINEERING',
  巡更点='PATROL_POINT',
  风险源='RISK_SOURCE'
}
const route=useRoute()
const objectType = computed(() => {
  if (props.dependFormValues && props.dependFormValues.length) {
    return props.dependFormValues[0] ?? ''
  }
  return ''
})
const init=ref(false)
watch(()=>objectType.value,()=>{
  if(!init.value){
    selected.value = null
    selectedCell.value = null
    searchValue.value = ''
  }
  onClickSearchButton()
  props.modelValue && emits('update:modelValue',null)
  setTimeout(()=>{
    init.value=false
  },1000)
})

const modalTitle = computed(() => {
  let name = ''
  if (businessType === 'FAULT') {
    name = '故障'
  } else if (businessType === 'HIDDENDANGER') {
    name = '隐患'
  }
  return '选择' + name + '对象'
})
const searchKey = computed(() => {
  let res= 'keyword'
  if (objectType.value) {
    if (objectType.value === 'DEVICE') {
      res = 'keyword'
    } else if (objectType.value === 'STALL') {
      res = 'keyword'
    } else if (objectType.value === 'PROPERTY') {
      res = 'keyword'
    } else if (objectType.value === 'SITE_POINT') {
      res = 'pointName'
    }
  }
  return res
})

/** 搜索 */
const onClickSearchButton=()=>{
  page.pageNumber=0
  finished.value=false
  datalist.value.length=0
  loading.value=false
  onLoad()
}

const showPicker = ref(false)
function handleShowPicker() {
  init.value=false
  if(!props.params&&route.query.businessType==='PROJECT_REFORM'){
    selectedCell.value=null
    showPicker.value = true
    return
  }
  if(!objectType.value){
    showNotify('请先选择对象类型')
    return
  }
  if(props.modelValue&&props.modelValue.length){
    selectedCell.value=props.modelValue[0]
  }else{
    selectedCell.value=null
  }
  showPicker.value = true
}
const searchValue=ref('')
const selected = ref()
const selectedCell = ref()
const datalist = ref<Record<string,any>[]>([]);
const loading = ref(false);
const finished = ref(false);
const page = reactive({
  pageSize: 20,
  pageNumber: 0,
  pages: 0
})
const onLoad =async () => {
  if (loading.value) {
    return
  }
  page.pageNumber++
  loading.value = true
  finished.value = false

  const params:Record<string,string|number|boolean|undefined> & {pageSize:number,pageNumber:number} = {
    pageNumber: page.pageNumber,
    pageSize: page.pageSize,
    enabled:true
  }
  params[searchKey.value]=searchValue.value || undefined
  let res: unknown[] = [] 
  if(objectType.value===ObjectType.资产){
    const { records } = await propertyService.getPropertyDetailedPage(params)
    res = records
  }else if(objectType.value===ObjectType.设备){
    const { records } = await cubeDeviceCenterService.getDeviceInstancePageAll(params)
    res = records.map(e=>{
      return {
        ...e,
        areaName:e.area?(e.area?.pathName||'--'):'--'
      }
    })
  }else if(objectType.value===ObjectType.档位){
    const { records } = await gearService.getGearList(params)
    res = records
  }else if(objectType.value===ObjectType.现场点){
    const { records } = await inspectService.getInspectpointList(params)
    res = records
  }else if(objectType.value===ObjectType.小散工程||(!props.params&&route.query.businessType==='PROJECT_REFORM')){
    const { records } = await smallScattered.projectScheduleList(params)
    res = records
  }else if(objectType.value===ObjectType.巡更点){
    const { records }= await cubeMaintainService.patrolPage(params)
    res = records 
  }
  else if(objectType.value===ObjectType.风险源){
    const { records }= await propertyService.getRiskSource(params)
    res = records 
  }
  datalist.value = datalist.value.concat(res as unknown as Record<string,string>[])
  if (res.length < page.pageSize) {
    finished.value = true
  }
  loading.value = false;
};


function cancel() {
  showPicker.value = false
}
function confirm() {
  if(!selectedCell.value?.id){
    showNotify('请选择一项')
    return
  }
  selected.value = selectedCell.value
  showPicker.value = false
  emits('update:modelValue',[{id:selected.value.id,name:selected.value.name??selected.value.projectName??selected.value.patrolLocationName}])
}

function emitToObjectType(entity:{id:string,name:string;type:string}){
  bus.emit("objectSelectScan", entity.type);
  setTimeout(() => {
    selectedCell.value = {id:entity.id,name:entity.name}
    selected.value = selectedCell.value
    emits('update:modelValue',[{id:selected.value.id,name:selected.value.name}])
  }, 0);
}

async function useScan(){
  if(props.readonly){
    return
  }
  const codeStr = await CubeAppBusinessBridge.handleBusinessScanCode()
  let code = ''
  if(!codeStr){
    return
  }
  if(codeStr.includes('code=')){
    code = codeStr.split('code=')[1]
  }else{
    code = codeStr
  }
  if(!code){
    return
  }

  const res = await identityService.getEntityByCode(code)
  if(!res){
    showNotify('未找到实体')
    return
  }
  emitToObjectType({
    id:res.entityId as string,
    name:res.entityName as string,
    type:res.entityType as string,
  })
}

onMounted(async () => {
  init.value=true
  if (props.modelValue && props.modelValue.length) {
    selected.value=props.modelValue[0]
  }
  if(processType === DynamicTableProcessType.ADD ){
    try {
      let appBusinessData = null
      const storageKey  = 'cube-app-maintenance-object-data'
      if(sessionStorage.getItem(storageKey)){     
        appBusinessData = JSON.parse(sessionStorage.getItem(storageKey) as string)
        emitToObjectType({
          id:appBusinessData.targetId as string,
          name:appBusinessData.targetName as string,
          type:appBusinessData.targetCategory as string,
        })
        sessionStorage.removeItem(storageKey)
      }else{
        if(getEnvironment()==='cubeApp'){
          appBusinessData = await cubeAppService.getBusinessData()
          if(appBusinessData && appBusinessData.business_object_id){
            emitToObjectType({
              id:appBusinessData.business_object_id as string,
              name:appBusinessData.business_object_name as string,
              type:appBusinessData.business_object_type as string,
            })
          }
        }
      }
    } catch (error) {
      showNotify("获取运维对象数据出错")
    }
  }
})

const errorMessage = computed(() => {
  return (!validInput.value && props.required) ? `请选择${props.label}` : ''
})

const validInput = ref(true)
defineExpose<FormItemExpose>({
  validate: () => {
    const valid = !!selected.value?.id
    validInput.value = valid
    return !!selected.value
  }
})
</script>

<style scoped lang="less">
.object-select-pop {
  background-color: #fff;
  height: 100vh;
  width: 100vw;
  overflow: hidden;

  .list {
    width: 100%;
    height: calc(100% - 150px);
    overflow-y: scroll;
  }

  .btn-area {
    position: relative;
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.07);
    padding: 0 3vw;
    box-sizing: border-box;
  }
}
</style>
