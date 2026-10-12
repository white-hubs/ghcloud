<template>
  <VanField 
    :label="props.label"  
    readonly 
    :required="props.required"
  >
  </VanField>
  <van-list
    :loading="loading"
    v-if="dataSource"
  >
    <van-cell
      v-for="item in dataSource" 
      :key="item.key" 
    >
      <template #title>
        <span class="custom-title">{{item.name}}</span>
      </template>
      <template #value>
        <span>{{ item.value || '--'}}</span>
        <span class="ml-3px" v-if="item.unitName">{{ item.unitName }}</span>
      </template>
    </van-cell>
  </van-list>
</template>
<script setup lang="ts">
import { FormItemExpose } from '../../../business/dynamic-table/form-item';
import { cubeDeviceCenterService } from '../../../service/service'
import { onMounted, ref, watch } from 'vue'
const emits = defineEmits(['update:modelValue'])
const props = defineProps<{
  required?: boolean;
  readonly?: boolean;
  label?: string;
  modelValue?: unknown,
  dependFormValues: [{id:string}[]];
}>()

interface ProductPropType {
  propCode: string;
  name: string;
  propUnit: string;
  dataType: string;
  precision: string;
  unitName: string;
  propName?: string;
  dataWrite: string;
  remark: string;
  dataConstraint: ConfigType[];
}
interface ProductEventType {
  eventName: string;
  eventCode: string;
  categoryCode: string;
  categoryName: string;
  remark: string;
  eventConfig: unknown;
}
interface PropType {
  key?: string;
  val?: string;
  unitName: string;
  name?: string;
  value?: string;
  ts?: string | number;
}
interface ConfigType {
  label: string;
  value: string;
}
interface DeviceDetailType {
  deviceId: string;
  deviceParentId: string;
  deviceNumber: string;
  productId: string;
  productName: string;
  tags: string;
  onlineState: number;
  productPropVoList: ProductPropType[];
  productEventVoList: ProductEventType[];
  snapshots: PropType[];
}
const loading = ref(false)
const dataSource = ref<PropType[] | null>(props.modelValue as PropType[] ?? null)

const deviceId = ref<string>(props.dependFormValues[0][0].id ?? '')

const getData =async () => {
  if(!props.dependFormValues[0]) return
  loading.value = true
  const id = props.dependFormValues[0][0].id ?? ''
  deviceId.value = id
  if(!id) return
  const res = await cubeDeviceCenterService.getNorthDeviceDetail({
    deviceId: id,
    withPropertySpec: true,
    withSnapShot: true
  })
  const deviceDetail = res as DeviceDetailType
  dataSource.value = resolvePropValue(deviceDetail)
  loading.value = false
  emits('update:modelValue',dataSource.value)
}
const resolvePropValue = (dataSource: DeviceDetailType): PropType[] => {
  const list:PropType[] = []
    if(dataSource.productPropVoList){
      dataSource.productPropVoList.forEach((item) => {
        const current = dataSource.snapshots.filter((s) => { return s.key === item.propCode })[0]
        let propValue = current?.value || ''
        if( typeof item?.dataConstraint === 'object' && ['enum', 'boolean'].includes(item.dataType)) {
          const config = item?.dataConstraint.filter((c) => { return c.value.toString() === current?.value })[0]
          propValue = config?.label || ''
        }
        list.push({
          name: item.propName,
          unitName: item.unitName,
          value: propValue
        })
      })
    }
  return list
}

watch(() => props.dependFormValues, () => {
  if (props.modelValue !== null) return
  getData()
},{ deep: true })

watch(()=> props.dependFormValues[0],()=>{
  if(props.dependFormValues[0][0]){
    deviceId.value = props.dependFormValues[0][0].id ?? ''
  }
},{deep: true})

watch(()=> deviceId.value,()=>{
  getData()
},{deep: true, immediate: true})

const validInput = ref(true)
defineExpose<FormItemExpose>({
  validate: () => {
    const valid = !!dataSource.value
    validInput.value = valid
    return valid
  }
})
</script>

<style scoped lang="less">
.icon{
  margin-right: 4px;
  display: flex;
  align-items: center;
}

.ml-3px{
  margin-left: 3px;
}
</style>