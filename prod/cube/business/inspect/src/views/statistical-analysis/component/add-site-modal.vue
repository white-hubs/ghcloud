<template>
  <div>
    <Spin :spinning="spinning" tip="加载中...">
      <Form ref="formRef" :rules="rules" :model="formState" :wrapper-col="{ span: 18 }" :label-col="{ span: 5 }">
        <FormItem label="现场点名称" name="name">
          <Input v-model:value="formState.name" :maxlength="30" placeholder="请输入"/>
        </FormItem>
        <FormItem label="现场点编码" name="codeNum">
          <Input v-model:value="formState.codeNum" :maxlength="30" placeholder="请输入"/>
        </FormItem>
        <FormItem label="现场点类型" name="typeId">
          <Select v-model:value="formState.typeId" style="width: 150px;" allow-clear @change="changeType" placeholder="请选择">
            <SelectOption v-for="item in siteTypeData" :key="item.id" :value="item.id">{{ item.name }}</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="管理部门" name="depId">
          <Select v-model:value="formState.depId" style="width: 150px;" allow-clear @change="changeDep" placeholder="请选择">
            <SelectOption v-for="item in inspectionType" :key="item.id" :value="item.id">{{ item.name }}</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="区域" name="areaId">
          <Cascader change-on-select v-model:value="formState.areaId" :options="departmentType" placeholder="请选择"/>
        </FormItem>
        <FormItem label="详细地址">
          <Input v-model:value="formState.location" :maxlength="30" placeholder="请输入或者点击定位选择"/>
        </FormItem>
        <FormItem label="定位">
          <div style="display: flex;">
            <Input v-model:value="formState.latAndLon" disabled/>
            <Button type="primary" style="margin-left: 10px;" @click="()=>{
              const center = formState.latAndLon.split(',')
              showMapModal({
                title:'选择地点',
                address: formState.location,
                center:{
                  lng:Number(center[0]),
                  lat:Number(center[1])
                },
                modalConfirm:(data)=>{
                  formState.location = data.address
                  formState.latAndLon = `${data.lng},${data.lat}`
                }
              })
            }">添加</Button>
          </div>
        </FormItem>
        <FormItem label="关联监控">
          <div class="device-wrapper">
            <Button type="primary" @click="openDeviceModal">添加</Button>
            <div class="device-list">
              <div v-for="item in formState.deviceList" :key="item.id" class="device-item">
                <span class="device-name">{{ item.name }}</span>
                <Button type="link" size="small" class="device-remove" @click="removeDevice(item.id)">x</Button>
              </div>
            </div>
          </div>
        </FormItem>
      </Form>
      <DeviceModalTable
        ref="deviceModalTableRef"
        v-model:value="formState.deviceList"
        :multiple="true"
        applicationCode="INSPECTION"
      />
    </Spin>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { organizationsList } from '@/api/ouaa'
import type { Type } from '@/typings/types'
import { getAreaList } from '@/api/mdata'
import type { AddSiteType } from '@/api/model/inspection';
import { getSiteTypeList } from '@/api/inspection';
import type { Rule } from 'ant-design-vue/es/form/interface'
import type { SelectValue } from 'ant-design-vue/es/select'
import { DeviceModalTable, useMapModal } from '@ghcloud/generic-component'

interface UpdateSiteType {
  codeNum: string;
  name: string;
  typeId: string | undefined ;
  typeName: string;
  depId: string[];
  depName: string;
  areaId: string|string[];
  detailAddress: string;
  location: string;
  deviceIdList: string[];
  deviceList: { id: string; name: string; }[];
  id?: number;
}
const { showMapModal } = useMapModal()
const props = withDefaults(defineProps<{modeDetails: {
    modelType: boolean;
    siteInfo: UpdateSiteType;
  };}>(), {});

interface Department{
  id: string;
  name: string;
}
const formRef = ref();
const deviceModalTableRef = ref<{ openModal: () => void }>()
const siteTypeData = ref<{id: string; name: string;}[]>([])
const formState = reactive<AddSiteType>({
  codeNum: '',
  name: '',
  typeId: undefined,
  typeName: '',
  depId: [],
  depName: '',
  areaId: [],
  location: '',
  detailAddress: '',
  latAndLon: '',
  deviceIdList: [],
  deviceList: []
})
const spinning = ref<boolean>(true)
const inspectionType = ref<Type[]>([])
const departmentType = ref<Department[]>([])
const rules: Record<string, Rule[]> = {
  name: [{
    required: true,
    message: '请输入现场点名称',
    trigger: 'blur'
  }],
  codeNum: [{
    required: true,
    message: '请输入现场点编码',
    trigger: 'blur'
  }],
  typeId: [{
    required: true,
    message: '请选择现场点类型',
    trigger: 'blur'
  }],
  depId: [{
    required: true,
    message: '请选择管理部门',
    trigger: 'blur'
  }],
  areaId: [{
    required: true,
    message: '请选择区域',
    trigger: 'blur'
  }]
}
// 获取部门
const getDepartment = async () => {
  const res = await organizationsList()
  inspectionType.value = res.data
}
// 获取区域
const getRegion = async () => {
  const res = await getAreaList()
  res.data = JSON.parse(JSON.stringify(res.data).replace(/"name"/g, '"label"'))
  res.data = JSON.parse(JSON.stringify(res.data).replace(/"id"/g, '"value"'))
  if (res.data) {
    departmentType.value = res.data
  }
}
// 获取现场点类型列表
const getSiteType = async () => {
  const res = await getSiteTypeList()
  if (res.data) {
    siteTypeData.value = res.data
  }
}
const changeDep = (value: SelectValue) => {
  inspectionType.value.forEach(item => {
    if (item.id === value) {
      formState.depName = item.name
    }
  })
  if (!value) {
    formState.depName = ''
  }
}
const changeType = (value: SelectValue) => {
  siteTypeData.value.forEach(item => {
    if (item.id === value) {
      formState.typeName = item.name
    }
  })
  if (!value) {
    formState.typeName = ''
  }
}
const openDeviceModal = (): void => {
  deviceModalTableRef.value?.openModal()
}
const removeDevice = (id: string): void => {
  formState.deviceList = formState.deviceList.filter(item => item.id !== id)
}

const onCheck = async (): Promise<boolean> => {
  try {
    await formRef.value.validateFields();
    formState.deviceIdList = formState.deviceList.map(item => item.id)
    return true
  } catch (errorInfo) {
    return false
  }
};
defineExpose({
  formState,
  onCheck
})
onMounted(async () => {
  await getRegion()
  await getDepartment()
  await getSiteType()
  if (!props.modeDetails.modelType) {
    if (typeof props.modeDetails?.siteInfo.areaId === 'string') {
      props.modeDetails.siteInfo.areaId = props.modeDetails?.siteInfo.areaId.split(',')
    }
    if (!props.modeDetails.siteInfo.deviceList) {
      props.modeDetails.siteInfo.deviceList = []
    }
    formState.deviceIdList = props.modeDetails.siteInfo.deviceList.map(item => item.id)
    Object.assign(formState, props.modeDetails?.siteInfo)
  }
  spinning.value = false
})
</script>
<style scoped lang="less">
.gps-map {
  width: 100%;
  height: 400px;
  margin-top: 10px;
}
.device-wrapper {
  width: 100%;
}
.device-list {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.device-item {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fafafa;
}
.device-name {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.device-remove {
  margin-left: 4px;
  padding: 0;
  min-width: auto;
}
</style>
