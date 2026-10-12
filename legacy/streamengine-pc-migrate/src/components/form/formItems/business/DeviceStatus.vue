<template>
  <div class="device-status">
    <a-descriptions >
      <a-descriptions-item v-if="dataSource"  v-for="item in dataSource" :label="item.name">
        <div class="status-value">
          <span>{{ item.value || '--'}}</span>
          <span class="ml-3px" v-if="item.unitName">{{ item.unitName }}</span>
        </div>
      </a-descriptions-item>
    </a-descriptions>
  </div>
</template>
<script lang="tsx" setup>
import { onMounted, ref, watch } from 'vue'
import { cubeDeviceCenterService } from '@/api/service'
import { logger } from '@ghcloud/generic-component/src/logger'

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

const props = withDefaults(defineProps<{
  params?: string;
  readonly:boolean;
  formData: any;
  modelValue:PropType[];
}>(), {
  params: '',
})
const loading = ref(false)
const dataSource = ref<PropType[] | null>(props.modelValue as PropType[] ?? null)
const emits=defineEmits(['update:modelValue'])
const deviceId = ref<string>(props.formData[props.params]?props.formData[props.params][0].id:'')

const getData =async () => {
  if(!props.params) return
  try {
    loading.value = true
    const id = props.formData[props.params]?props.formData[props.params][0].id:''
    if(!id) return
    deviceId.value = id
    const res = await cubeDeviceCenterService.getNorthDeviceDetail({
      deviceId: id,
      withPropertySpec: true,
      withSnapShot: true
    })
    const deviceDetail = res as DeviceDetailType
    dataSource.value = resolvePropValue(deviceDetail)
    loading.value = false
    emits('update:modelValue',dataSource.value)
  } catch (error) {
  }
}

watch(() => props.formData[props.params], () => {
  if (props.readonly) return
  getData()
},{ deep: true, immediate: true })

watch(()=> deviceId.value,()=>{
  getData()
},{deep: true})

watch(()=> props.formData,()=>{
  if(props.formData[props.params]){
    deviceId.value = props.formData[props.params]?props.formData[props.params][0].id:''
  }
},{deep: true})

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

onMounted(() => {
  if (props.readonly) return
  getData()
})

</script>
<style lang="less">
.device-status {
  margin-top: 4px;
}
.icon{
  display: flex;
  margin-right: 5px;
}
.status-value{
  display: flex;
  align-items: center;
}
.ml-3px{
  margin-left: 3px;
}
:deep(.template-descriptions-item-content),.template-descriptions-item-content{
  align-items: center;
}
</style>
