<template>
  <div>
    <a-switch v-model:checked="state.modelValue.accessControl" :disabled="readonly" @change="handleSwitchChange" />
    <div class="access-table" v-show="state.modelValue.accessControl">
      <div class="title">
        门禁设备列表
      </div>
      <a-form class="table-form" layout="inline" size="small">
        <a-form-item label="门禁类型">
          <a-select :disabled="readonly" :getPopupContainer="(triggerNode: HTMLElement) => triggerNode.parentNode"
            size="small" v-model:value="state.formState.type" allowClear style="width: 100px" placeholder="门禁类型"
            :options="state.doorTypeOptions"></a-select>
        </a-form-item>
        <a-form-item label="所属区域">
          <a-cascader :disabled="readonly" change-on-select size="small"
            :getPopupContainer="(triggerNode: HTMLElement) => triggerNode.parentNode"
            :fieldNames="{label:'name',value:'id',children:'children'}" style="width: 100px"
            v-model:value="state.formState.doorArea" :options="state.areaOptions" placeholder="所属区域" />
        </a-form-item>
        <a-form-item>
          <a-input size="small" :disabled="readonly" style="width: 100px;" placeholder="设备编码/名称"
            v-model:value="state.formState.keyword"></a-input>
        </a-form-item>
        <a-form-item>
          <a-button size="small" :disabled="readonly" @click="handleSearch" type="primary">
            查询
          </a-button>
          <a-button size="small" :disabled="readonly" @click="handleReset" style="margin-left: 10px">
            重置
          </a-button>
        </a-form-item>
      </a-form>
      <a-table size="small" :loading="state.tableLoading" :scroll="{x:0, y:200}" rowKey="id"
        :row-selection="rowSelection" :pagination="false" bordered :dataSource="state.dataSource" :columns="columns" />
      <div class="page">
        <a-pagination size="small" @change="handlePageChange" v-model:current="state.page.pageNumber"
          v-model:page-size="state.page.pageSize" :total="state.page.total" show-size-changer>
        </a-pagination>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref,computed,unref } from 'vue'
import {cubeDoorControlService,cubeMdataService} from '@/api/service'
import { message } from 'ant-design-vue';
interface ModelValue {
  accessControl: boolean,
  accessControlRows: {name:string,id:string,doorCode:string,areaName:string,typeName:string}[],
}
const props = withDefaults(defineProps<{
  modelValue?: ModelValue | null;
  placeholder?: string;
  readonly?:boolean
}>(), {
  modelValue: null,
  placeholder: "请选择",
  readonly:false
})
const handleSwitchChange=()=>{
  emits('update:modelValue', state.modelValue)
}

const emits = defineEmits(['update:modelValue'])
const columns = [
  {
    title:'设备编码',
    dataIndex:'doorCode',
    key:'doorCode',
    align:'center'
  },
  {
    title:'设备名称',
    dataIndex:'name',
    key:'name',
    align:'center'
  },
  {
    title:'门禁类型',
    dataIndex:'typeName',
    key:'typeName',
    align:'center'
  },
  {
    title:'所属区域',
    dataIndex:'areaName',
    key:'areaName',
    align:'center'
  },
]
const state=reactive<{
  doorTypeOptions:any[],
  areaOptions:any[],
  tableLoading:boolean,
  modelValue:ModelValue,
  page:{
    pageNumber:number,
    pageSize:number,
    total:number
  },
  dataSource:any[],
  formState:{
    type:'',
   doorArea:string[],
   keyword:''
  }
}>({
  doorTypeOptions:[],
  areaOptions:[],
  tableLoading:false,
  modelValue:{
    accessControl:true,
    accessControlRows:[]
  },
  dataSource:[],
  page:{
    pageNumber:1,
    pageSize:10,
    total:0
  },
  formState:{
    type:'',
   doorArea:[],
   keyword:''
  }
})
const rowSelection =computed(()=>{
  return {
    columnWidth:50,
    selectedRowKeys:unref(state.modelValue.accessControlRows.map(item=>item.id)),
    onSelect: (record: any, selected: boolean,selectedRows:any) => {
      if(selected){
        state.modelValue.accessControlRows=[... state.modelValue.accessControlRows,record]
      }else{
        state.modelValue.accessControlRows=state.modelValue.accessControlRows.filter(item=>item.id!==record.id)
      }
      emits('update:modelValue', state.modelValue)
    },
    onSelectAll: (selected: boolean, selectedRows: any[], changeRows: any[]) => {
      if(selected){
        state.modelValue.accessControlRows.push(...changeRows)
      }else{
        state.modelValue.accessControlRows = state.modelValue.accessControlRows.filter(item=>!changeRows.some(changeItem=>changeItem.id===item.id))
      }
      emits('update:modelValue', state.modelValue)
    },
    getCheckboxProps: (row: any) => ({
      disabled: props.readonly
    }),
  }
   
})

onMounted(()=>{
  getDoorControlOptions()
  getAreaOptions()
  getDataList()
  if(props.modelValue){
    state.modelValue.accessControlRows=props.modelValue.accessControlRows
    state.modelValue.accessControl=props.modelValue.accessControl
  }
})
const handlePageChange = (pageNumber: number, pageSize: number) => {
  state.page.pageNumber = pageNumber
  state.page.pageSize = pageSize
  getDataList()
}
const getAreaOptions = async () => {
  const result = await cubeMdataService.getAreaTree()
  state.areaOptions = result
}
const getDoorControlOptions = async () => {
  const res = await cubeDoorControlService.getDoorTypeList()
  state.doorTypeOptions = res.map(item=>{
    return {
      label:item.doorTypeName,
      value:item.id
    }
  })
}
const getDataList = async () => {
  try {
    
    state.tableLoading = true
   const res = await cubeDoorControlService.getDoorDevicePage({
    ...state.page,
    ...state.formState,
    doorArea:state.formState.doorArea.length ? state.formState.doorArea.at(-1) ?? '' :'',
    applicationCode:'DOORMANAGE'
   })
   state.dataSource= res.records
   state.page.total = res.total
  } catch (error) {
    const err= (error as any).toJSON()
    message.error(err.errorMessage??'查询失败')
  } finally {
    state.tableLoading = false
  }

}
const handleSearch = () => {
  state.page.pageNumber = 1
  getDataList()
}
const handleReset = () => {
  state.formState = {
    type:'',
    doorArea:[],
    keyword:''
  }
  getDataList()
}
const validator = async () => {
  if(state.modelValue.accessControl&&!state.modelValue.accessControlRows.length){
      return Promise.reject('开启门禁权限必须选择开启权限的门禁设备');
  }
  return Promise.resolve();
}
defineExpose({
  validator
})
</script>
<style scoped lang="less">
.select-input {
  width: 100%;
}

.access-table {
  margin-top: 12px;
  border: 1px solid #d9d9d9;

  .title {
    font-size: 14px;
    padding: 6px;
    font-weight: bold;
    border-bottom: 1px solid #d9d9d9;
  }

  .table-form {
    padding: 6px;
  }
}

.page {
  display: flex;
  padding: 6px;
  flex-direction: row-reverse;
}
</style>
