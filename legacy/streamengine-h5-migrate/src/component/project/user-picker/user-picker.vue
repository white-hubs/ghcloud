<template>
  <VanField
    v-if="props.readonly"
    :label="props.label"
    :required="props.required"
    :model-value="selected.map(u => u.name).join('、')"
    readonly />
  <template v-else>
  <VanField :label="props.label" is-link readonly
    :placeholder="props.placeholder" @click="pick" :required="props.required" :error-message="errorMessage"
    class="form-item-field">
    <template #input v-if="selected.length">
      <VanSpace wrap style="max-height: 100px;overflow: auto;">
        <VanTag v-for="user of selected" :key="user.id" type="primary" closeable size="medium" @close="(e:Event)=>{clickTag(e,user)}" >
          {{ user.name }}
        </VanTag>
      </VanSpace>
    </template>
  </VanField>
  <VanPopup v-model:show="showPicker" position="right" duration="0.2">
    <UserSelectGroupNew v-if="apps.find((x)=>x.code==='ATTENDANCE_MANAGEMENT')" :currentDep="currentDep" @cancel="closePicker" @confirm="confirmPick" :multiple="props.multiple"
      :organization-id="organizationId" :activeIds="selected.map(e=>e.id)" :active-users="selected.map(e=>{return e})"/>
    <UserSelectGroup v-else @cancel="closePicker" @confirm="confirmPick" :currentDep="currentDep" :multiple="props.multiple"
      :organization-id="organizationId" :activeIds="selected.map(e=>e.id)" :active-users="selected.map(e=>{return e})"/>
  </VanPopup>
  </template>
</template>

<script setup lang="ts">
import { StaffUser } from '../../../domain/user'
import { computed, onMounted, PropType, ref, watch } from 'vue'
import UserSelectGroup from './user-select-group.vue'
import UserSelectGroupNew from './user-select-group-new.vue'
import { showNotify } from 'vant'
import { DynamicTableProcessType } from '../../../business/dynamic-table/dynamic-table'
import { staffService } from '../../../service/staff/staff.service'
import { ApplicationGroup } from '../../../../../../prod/cube/apps/ouaa/service/src/main'
import { cubeOuaaService } from '../../../service/service'

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  modelValue: {
    type: Array as PropType<StaffUser[]>,
    required: false,
    default: () => []
  },
  multiple: {
    type: Boolean,
    default: true
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
    default: '请选择'
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
  }
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: {id:string,name:string}[]): void;
  (e: 'close'): void;
  (e: 'confirm'): void;
}>()
const showPicker = ref(false)
const selected = ref<{id:string,name:string}[]>([])
const organizationId = computed(() => {
  try {
    const dependFormValues = props.dependFormValues[0] as { id: string }[]
    if (dependFormValues) {
      return dependFormValues[0].id
    } else {
      return undefined
    }
  } catch (error) {
    return undefined
  }
})
watch(()=>{
  if(props.params){
    return organizationId.value
  }
  return undefined
},()=>{
  selected.value = []
  emit('update:modelValue', selected.value)
  setTimeout(() => {
    validInput.value=true
  }, 0);
})
//获取应用
const apps=ref<ApplicationGroup[]>([])
const getApplication=async ()=>{
  const data=await cubeOuaaService.getApplicationGroups()??[]
  if(data?.length>0)toListApps(data)
}
const toListApps=(data: any[])=>{
  data.forEach((x: ApplicationGroup)=>{
    if(x?.applicationPageVOS?.length>0){
      toListApps(x?.applicationPageVOS)
    }else{
      apps.value.push(x)
    }
  })
}
const currentDep=ref(
  {id:'',name:''}
)
onMounted(async () => {
  getApplication()
  if (props.modelValue) {
    selected.value = props.modelValue
  }
  const user = await staffService.getCurrentUser()
  //当前用户所在部门
  currentDep.value={
    id:user?.organizations?.[0]?.id??'',
    name:user?.organizations?.[0]?.name??'',
  }
  if(props.defaultValue&&props.processType===DynamicTableProcessType.ADD){
    confirmPick([{id:user.id,name:user.name}])
  }
})
function pick() {
  if (props.params) {
    if (!organizationId.value) {
      showNotify('请先选择部门')
      return
    }
  }
  showPicker.value = true
}
const clickTag=(e:Event,user:{id:string,name:string})=>{
  selected.value=selected.value.filter(x=>x.id!==user.id)
  emit('update:modelValue', selected.value)
  e.stopPropagation()
}

function closePicker() {
  showPicker.value = false
  emit('close')
}
function confirmPick(users: {id:string,name:string}[]) {
  selected.value = users
  emit('update:modelValue', selected.value)
  closePicker()
  emit('confirm')
}
const errorMessage = computed(() => {
  return (!validInput.value && props.required) ? `请选择${props.label}` : ''
})

const validInput = ref(true)
defineExpose({
  validate: () => {
    const valid = !!selected.value.length
    validInput.value = valid
    return selected.value.length > 0
  },
  showPicker
})
</script>

<style scoped></style>
