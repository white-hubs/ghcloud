<template>
  <VanField
    v-if="props.readonly"
    :required="props.required"
    :label="props.label"
    :model-value="readonlyText"
    readonly
    class="form-item-field" />
  <VanField 
    v-else
    :label="props.label" 
    is-link
    :placeholder="props.placeholder" 
    @click="handleFieldClick" 
    :required="props.required" 
    :error-message="errorMessage"
    v-model="customObjectName"
    class="form-item-field">
    <template #button>
      <van-icon class="field-icon" v-if="isInternal && !isEdit" name="edit" @click.stop="handleEdit" />
      <span class="field-icon-text" v-if="isInternal && isEdit" @click.stop="handleCancelEdit">取消</span>
      <van-icon class="field-icon" name="scan" @click.stop="useScan" />
    </template>
    <template #input v-if="!isEdit && selectList.length">
      <VanSpace wrap class="field-tags">
        <VanTag v-for="item of selectList" :key="item.id" type="primary" closeable @close="(e:Event)=>{handleCloseTag(e,item)}" >
          {{ item?.name || item?.projectName }}
        </VanTag>
      </VanSpace>
    </template>
  </VanField>
  <ObjectPopupSelect
    ref="objectRef"
    v-model:value="objectSelect"
    :multiple="props.multiple"
    :title="props.label"
    @ok="handleOk"
  />
</template>

<script setup lang="ts">
import { DynamicTableProcessType, DynamicTableRoute } from '../../../business/dynamic-table/dynamic-table'
import { computed, onMounted, PropType, Ref, ref, watch } from 'vue'
import { identityService } from '../../../service/identity/identity'
import { ObjectPopupSelect } from '@ghcloud/cube-h5-design'
import { ListItemType } from '@ghcloud/cube-h5-design/src/business-components/object-popup-select/object-popup-select'
import bus from "../../../infrastructure/bus";
import { useRoute } from 'vue-router'
import { CubeAppBusinessBridge, cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { showNotify } from 'vant'
import { getEnvironment } from '@ghcloud/cube-utils'

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  modelValue: {
    type: Object as PropType<{id: string, name: string, type: string, flowConvertData: boolean, }>,
    required: false,
    default: null
  },
  multiple: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: '请选择或者扫码输入'
  },
  dependFormValues: {
    type: Array,
    default: () => []
  },
  params: {
    type: String,
    default: ''
  },
  defaultValue:{
    type: Boolean,
    default: false
  },
  processType:{
    type: String,
  },
  callTyep:{
    type: String,
  }
})

const { query: { businessType , processType} } = useRoute() as DynamicTableRoute
const emits = defineEmits(['update:modelValue'])

const showPicker = ref(false)
const selectList = ref<ListItemType[]>([])
const isEdit = ref(true)
const isInternal = ref(props.callTyep === 'INTERNAL')//是否是内部表单,内部表单才能选择对象
const customObjectName = ref('')

watch( () => customObjectName.value, () => {
  if (customObjectName.value) {
    emits('update:modelValue', {
      type: 'CUSTOM',
      id: 0,
      name: customObjectName.value,
      flowConvertData: false,
    })
  } else {
    emits('update:modelValue', null)
  }
})
const handleEdit = () => {
  isEdit.value = !isEdit.value
}
const handleCancelEdit = () => {
  isEdit.value = !isEdit.value
  customObjectName.value = ''
} 
const emitToObjectType = (entity:{id:string,name:string;type:string}) =>{
  bus.emit("objectSelectScan", entity.type);
  handleEdit()
  setTimeout(() => {
    const selected = { 
      id: entity.id, 
      name: entity.name, 
      type: entity.type, 
      flowConvertData: false, 
    }
    emits('update:modelValue', selected)
   
    objectSelect.value = [selected]
    selectList.value = [selected as ListItemType]
  }, 0);
}
const useScan = async () =>{
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
  if (props.modelValue) {
    if (props.modelValue.type === 'CUSTOM') {
      isEdit.value = true
      customObjectName.value = props.modelValue.name
    } else {
      isEdit.value = false
      selectList.value = [props.modelValue]
      objectSelect.value = [props.modelValue]
      const tabType = props.modelValue.type
      objectRef.value?.setActiveTab(tabType)
    }
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
const objectRef = ref<{ openPopup: () => void; activeTab: Ref<string>; setActiveTab: (tab: string) => void; }>()
const objectSelect = ref<{ id?: string | number; name?: string; projectName?: string; }[]>([])
const handleOk = (values: { ids: string[]; items: ListItemType[]; }) => {
  selectList.value = values.items
  if (selectList.value && selectList.value.length > 0) {
    var item = selectList.value[0];
    const result = {
      id: item.id,
      name: item?.name || item?.projectName,
      type: objectRef.value?.activeTab,
      flowConvertData: false,
    }
    emits('update:modelValue', result)
  }else {
    emits('update:modelValue', null)
  }
  
}
const handleFieldClick = () => {
  if (isEdit.value || props.readonly) return
  objectRef.value?.openPopup()
  showPicker.value = true
}
const handleCloseTag = (e: Event, item: ListItemType) =>{
  selectList.value = selectList.value.filter( x => x.id !== item.id )
  if (selectList.value && selectList.value.length > 0) {
    var item = selectList.value[0];
    const result = {
      id: item.id,
      name: item?.name || item?.projectName,
      type: objectRef.value?.activeTab,
      flowConvertData: false,
    }
    emits('update:modelValue', result)
  }else {
    emits('update:modelValue', null)
  }
  e.stopPropagation()
}

const readonlyText = computed(() => {
  if (isEdit.value) return customObjectName.value
  return selectList.value.map(item => item?.name || item?.projectName).join('、')
})

const errorMessage = computed(() => {
  if (props.required) {
    if (isEdit.value) {
      return customObjectName.value.length > 0 ? '' : `请输入${props.label}`
    } else {
      return selectList.value.length > 0 ? '' : `请选择${props.label}`
    } 
  }
  return ''
})

defineExpose({
  validate: () => {
    return isEdit.value ? customObjectName.value.length > 0 : selectList.value.length > 0
  },
  showPicker
})
</script>

<style scoped>
  .form-item-field .van-field__body{
    align-items: flex-start;
  }
  .field-icon {
    font-size: 18px;
    line-height: inherit;
    margin-left: 5px;
  }
  .field-icon-text{
    color: var(--van-nav-bar-text-color);
    font-size: var(--van-font-size-md);
    line-height: inherit;
  }
  .field-tags{
    width: 100%;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2; /* 控制最多显示两行 */
    max-height: 70px ;
    text-overflow: ellipsis;
  }
</style>
