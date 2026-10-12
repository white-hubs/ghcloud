<!-- eslint-disable dot-notation -->
<template>
  <Tabs v-model:activeKey="activeKey" size="small" type="card" @change="tabChange">
    <TabPane key="ITEM" tab="分项">
      <Input v-model:value="searchName.subItemName" placeholder="搜索" @pressEnter="subItemChange">
        <template #suffix>
          <SearchOutlined style="color: rgba(0, 0, 0, 0.45)" />
        </template>
      </Input>
      <div class="mt-15px">
        <Empty v-if="!subItemOptions.length" />
        <template v-else>
          <Tree
            v-model:checkedKeys="searchType.subItemProjectIds"
            checkable
            :tree-data="subItemOptions"
            :field-names="{
              children: 'children',
              title: 'projectName',
              key: 'id',
            }"
           @check="changeTreeSelect"
          />
        </template>
      </div>
    </TabPane>
    <TabPane  key="AREA" tab="区域">
      <Input
        v-model:value="searchName.areaName"
        placeholder="搜索"
        @pressEnter="areaChange"
      >
        <template #suffix>
          <SearchOutlined style="color: rgba(0, 0, 0, 0.45)" />
        </template>
      </Input>

      <div class="mt-15px">
        <Empty v-if="!areaOptions.length" />
        <template v-else>
          <Tree
            v-model:checkedKeys="searchType.areaProjectIds"
            checkable
            :tree-data="areaOptions"
            :field-names="{
              children: 'children',
              title: 'areaName',
              key: 'id',
            }"
            @check="changeAreaTreeSelect"
          />
        </template>
      </div>
    </TabPane>
    <TabPane  key="DEVICE" tab="设备">
      <Input
        v-model:value="searchName.deviceName"
        placeholder="搜索"
        @pressEnter="deviceChange"
      >
        <template #suffix>
          <SearchOutlined style="color: rgba(0, 0, 0, 0.45)" />
        </template>
      </Input>

      <div class="mt-15px">
        <Empty v-if="!deviceOptions.length" />
        <template v-else>
          <Tree
            v-model:selectedKeys="searchType.deviceProjectIds"
            :tree-data="deviceOptions"
            :field-names="{
              children: 'children',
              title: 'value',
              key: 'key',
            }"
            @select="changeDeviceTreeSelect"
          />
        </template>
      </div>
    </TabPane>
  </Tabs>
</template>
<script lang="ts" setup>
import { AreaProjectTree, EnergyProjectTree,getMeterDeviceList } from '@/api/energyOverview';
import { type TabsProps } from 'ant-design-vue/es'
import type { Key } from 'ant-design-vue/lib/_util/type';
import { defineEmits, onMounted, reactive, ref, watch } from 'vue'
interface Props {
  /** 标题 */
  instrumentType?: string;
  activeKey?: string;
}
const emit = defineEmits(['checkedItem'])
const props = withDefaults(defineProps<Props>(), {
  instrumentType: '',
  activeKey: 'ITEM',
})
const activeKey = ref<string>('ITEM')
const searchType=reactive<{
  subItemProjectIds:Key[] | { checked: Key[]; halfChecked: Key[]; },
  areaProjectIds:Key[] | { checked: Key[]; halfChecked: Key[]; },
  deviceProjectIds:Key[] | { checked: Key[]; halfChecked: Key[]; }
}>({
  subItemProjectIds:[],
  areaProjectIds:[],
  deviceProjectIds:[]
})
const subItemOptions=ref([])
const areaOptions=ref([])
const deviceOptions=ref([])
//获取分项层级
const getSubItemTree=async(type:string)=>{
  const {data}=await EnergyProjectTree({
    projectName:searchName.subItemName,
    instrumentType:type
  })
  subItemOptions.value=data
}
//选择分项类型
const changeTreeSelect = (checked: Key[] | { checked: Key[]; halfChecked: Key[]; }) => {
  searchType.subItemProjectIds=checked
  emit('checkedItem', searchType.subItemProjectIds, activeKey.value)
}
//获取区域层级
const geAreaTree=async(type:string)=>{
  const { data } = await AreaProjectTree({
    areaName:searchName.areaName,
    instrumentType: type,
  });
  areaOptions.value=data
}
//获取设备下拉
const getDeviceTree=async(type:string)=>{
  const {data} = await getMeterDeviceList({
    keyword:searchName.deviceName,
    instrumentType: type,
  });
  deviceOptions.value=data
}

//选择分项类型
const changeAreaTreeSelect = (checked: Key[] | { checked: Key[]; halfChecked: Key[]; }) => {
  searchType.areaProjectIds=checked
  emit('checkedItem', searchType.areaProjectIds, activeKey.value)
}
const changeDeviceTreeSelect= (checked: Key[] | { checked: Key[]; halfChecked: Key[]; }) => {
  searchType.deviceProjectIds=checked
  emit('checkedItem', searchType.deviceProjectIds, activeKey.value)
}
const searchName = reactive<{subItemName: string;areaName: string;deviceName:string}>(
  {subItemName: '',areaName: '',deviceName:''}
)
const tabChange: TabsProps['onChange'] = (data) => {
  switch(data){
    case 'ITEM':
    emit('checkedItem', searchType.subItemProjectIds, data)
      break;
      case 'AREA':
      emit('checkedItem', searchType.areaProjectIds, data)
      break;
      default:
      emit('checkedItem', searchType.deviceProjectIds, data)
      break;
  }
}
const subItemChange = () => {
  getSubItemTree(props.instrumentType)
}
const areaChange = () => {
  geAreaTree(props.instrumentType)
}
const deviceChange= () => {
  getDeviceTree(props.instrumentType)
}
onMounted(async () => {
  activeKey.value = props.activeKey
  emit('checkedItem', searchType.subItemProjectIds, activeKey.value)
  setTimeout(async () => {
    activeKey.value = props.activeKey
  }, 100)
})
watch(() => props.instrumentType,  () => {
  getSubItemTree(props.instrumentType)
  geAreaTree(props.instrumentType)
  getDeviceTree(props.instrumentType)
},{immediate:true})
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");
</style>
