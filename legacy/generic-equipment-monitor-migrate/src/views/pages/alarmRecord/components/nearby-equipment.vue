<template>
  <a-form layout="inline" style="margin: 10px 0">
    <a-form-item label="产品品类">
      <a-cascader v-model:value="formState.productCategoryCode" :options="productCategoryOptions"
        :field-names="{ label: 'categoryName', value: 'categoryCodeConcat', children: 'children' }"
        placeholder="请选择"></a-cascader>
    </a-form-item>
    <a-form-item label="所属产品">
      <a-select v-model:value="formState.productId" placeholder="请选择" :options="productOptions" allowClear showSearch
        style="width:180px" :filterOption='filterOption'>
      </a-select>
    </a-form-item>
    <a-form-item>
      <a-space>
        <a-button type="primary" @click="handleSubmit">查询</a-button>
        <a-button @click="handleReset">重置</a-button>
      </a-space>
    </a-form-item>
  </a-form>
  <a-table :data-source="data" :columns="columns" :pagination="false" :bordered="true" size="small" :loading="loading"
    :scroll="tableScroll">
    <template #productName="{ record }">
      {{ record.productInfo?.name || '--' }}
    </template>
    <template #productCategory="{ record }">
      {{ record.productInfo.productCategory?.name || '--' }}
    </template>
    <template #status="{ record }">
      <a-tag color="green" v-if="record.status?.onlineState">在线</a-tag>
      <a-tag color="red" v-else>离线</a-tag>
    </template>
    <template #occlusion="{ record }">
      <a-tag color="red" v-if="record.occlusion">否</a-tag>
      <a-tag color="blue" v-else>是</a-tag>
    </template>
    <template #action="{ record }">
      <a-button type="link" @click="toDetail(record)">详情</a-button>
    </template>
  </a-table>
  <div class="model-container"></div>
</template>

<script setup lang="ts">
import { cubeAlarmCenterService, cubeDeviceCenterService, cubeVisualizationService } from '@/api/service';
import type { Pagination, ProductIotCategoryTree } from '@ghcloud/cube-iot-center-service';
import { message } from 'ant-design-vue';
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { UeClient } from '@ghcloud/cube-visual-sdk'
import type { AlarmNearbyDevice } from '@ghcloud/cube-alarm-center-service';

const props = defineProps<{
  id: string;
}>();
const loading =  ref(false);
const formState = reactive({
  productCategoryCode:[],
  productId:undefined,
  pageNumber:1,
  pageSize:100
})
const productCategoryOptions =ref<ProductIotCategoryTree[]>([])
const productOptions = ref<{label:string,value:string}[]>([])
let modelServerUrl = ''

const filterOption = (input, option) => {
  return (option.label || '').toLowerCase().indexOf(input.toLowerCase()) >= 0;
}
const data = ref<(AlarmNearbyDevice&{occlusion?:boolean})[]>([]);
const columns = [
  {
    title: '设备编号',
    dataIndex: 'code',
  },
  {
    title: '设备名称',
    dataIndex: 'name',
  },
  {
    title: '所属产品',
    slots: { customRender: 'productName' },
  },
  {
    title: '产品品类',
    slots: { customRender: 'productCategory' },
  },
  {
    title: '设备状态',
    slots: { customRender: 'status' },
  },
  {
    title: '直接可视',
    slots: { customRender: 'occlusion' },
  },
  {
    title: '操作',
    slots: { customRender: 'action' },
  },
]
const tableScroll = ref({
  y: 0
})
const handleSubmit = async ()=>{
  getScrollY()
  try {
    loading.value = true
    const firstPage = await cubeAlarmCenterService.getAlarmRecordDeviceList({
      alarmRecordId: props.id,
      pageNumber: formState.pageNumber,
      pageSize: formState.pageSize,
      productId: formState.productId,
      categoryCode: formState.productCategoryCode.length?formState.productCategoryCode.at(-1):undefined,
    })
    const queryTask: Promise<Pagination<unknown>>[] = []
    if(firstPage.pages > 1){
      for(let i = 2; i <= firstPage.pages; i++){
        queryTask.push(cubeAlarmCenterService.getAlarmRecordDeviceList({
          alarmRecordId: props.id,
          pageNumber: i,
          pageSize: formState.pageSize,
          productId: formState.productId,
          categoryCode: formState.productCategoryCode.length?formState.productCategoryCode.at(-1):undefined,
        }))
      }
    }
    await Promise.all(queryTask).then(res=>{
      data.value.length = 0
      //@ts-ignore
      data.value = [...firstPage.records,...res.map(e=>e.records)]
    })
    modelServerUrl &&  await queryModelServer()
  } catch (error) {
    message.error('查询失败')
  } finally {
    loading.value = false
  }
}
const queryModelServer = async () => { 
  const {alarmTargetCode} = await cubeAlarmCenterService.getAlarmDetails(props.id)
  const ueClient = UeClient.getInstance()
  const res = await ueClient.sendAsync('occlusionDetection', {
    sourceActorId: alarmTargetCode,
    targetActorIds: data.value.map(item => item.code),
  });
  (res as {occlusion: boolean[]}).occlusion.forEach((item,i) => {
    data.value[i].occlusion = item
  });
}
const handleReset=()=>{
  formState.productCategoryCode = []
  formState.productId = undefined
  formState.pageNumber = 1
  handleSubmit()
}
const getScrollY = () => {
  tableScroll.value.y= document.body.clientHeight - 380
}
const toDetail = (row) => {
  history.pushState({ current: location.pathname + location.search }, "", `portal/device-center/device-ledger-info?id=${row.id}&prodId=${row.productInfo?.id}`)
}
onMounted(async ()=>{
  const ueClient = UeClient.getInstance()
  getScrollY()
  cubeDeviceCenterService.getIotProductCategoryTree().then((res) => {
    productCategoryOptions.value = res
  }) 
  cubeDeviceCenterService.getProductListAll().then(res => {
    productOptions.value = res.map(item=>{
      return {
        value: item.id??'',
        label: item.prodName??''
      }
    })
  })
  const projectList = await cubeVisualizationService.getVisualProjectList()
  if (projectList.length === 0){
    return
  }
  const modalConfigString = await cubeVisualizationService.getModalConfigByProjectId(projectList[0].id)
  const modalConfig = JSON.parse(modalConfigString)
  const modelServer = modalConfig.ue5.modelServer
  if (modelServer.length > 0){
    modelServerUrl = modelServer[0].url
    const dom = document.querySelector(`.model-container`) as HTMLElement
    ueClient.loadUE5(dom, modelServerUrl)
    ueClient.onConnected(()=>{
      handleSubmit()
    })
    return
  }
})
onBeforeUnmount(()=>{
  const ueClient = UeClient.getInstance()
  ueClient.ue5Close()
})
</script>
<style lang="less" scoped>
.model-container{
  display: none;
}
</style>