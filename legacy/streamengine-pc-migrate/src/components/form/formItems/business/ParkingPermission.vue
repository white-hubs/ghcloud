<template>
  <div>
    <a-switch v-model:checked="state.modelValue.parkingControl" :disabled="readonly" @change="handleSwitchChange" />
    <div class="access-table" v-show="state.modelValue.parkingControl">
      <div class="title">
        停车场列表
      </div>
      <a-form class="table-form" layout="inline" size="small">
        <a-form-item>
          <a-input :disabled="readonly" size="small" style="width: 200px;" placeholder="停车场编码/名称"
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
import {cubeMdataService,cubeSecurityManagementService,cubeParkingLotService} from '@/api/service'
import { message } from 'ant-design-vue';
interface ModelValue {
  parkingControl: boolean,
  parkingControlRows: {id: string,deviceName: string,code: string,areaName: string}[],
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
    title:'停车场编码',
    dataIndex:'code',
    key:'code',
    align:'center'
  },
  {
    title:'停车场名称',
    dataIndex:'name',
    key:'name',
    align:'center'
  },
]
const state=reactive<{
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
   keyword:string
  }
}>({
  areaOptions:[],
  tableLoading:false,
  modelValue:{
    parkingControl:true,
    parkingControlRows:[]
  },
  dataSource:[],
  page:{
    pageNumber:1,
    pageSize:10,
    total:0
  },
  formState:{
    keyword:''
  }
})
const rowSelection =computed(()=>{
  return {
    columnWidth:50,
    selectedRowKeys:unref(state.modelValue.parkingControlRows.map(item=>item.id)),
    onSelect: (record: any, selected: boolean) => {
      if(selected){
        state.modelValue.parkingControlRows=[... state.modelValue.parkingControlRows,record]
      }else{
        state.modelValue.parkingControlRows = state.modelValue.parkingControlRows.filter(item=>item.id!==record.id)
      }
      emits('update:modelValue', state.modelValue)
    },
    onSelectAll: (selected: boolean, selectedRows: any[], changeRows: any[]) => {
      if(selected){
        state.modelValue.parkingControlRows.push(...changeRows)
      }else{
        state.modelValue.parkingControlRows = state.modelValue.parkingControlRows.filter(item=>!changeRows.some(changeItem=>changeItem.id===item.id))
      }
      emits('update:modelValue', state.modelValue)
    },
    getCheckboxProps: (row: any) => ({
      disabled: props.readonly
    }),
  }
   
})

onMounted(()=>{
  getAreaOptions()
  getDataList()
  if(props.modelValue){
    state.modelValue.parkingControlRows=props.modelValue.parkingControlRows
    state.modelValue.parkingControl=props.modelValue.parkingControl
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
const getDataList = async () => {
  try {
    state.tableLoading = true
   const res = await cubeParkingLotService.getParkingLotListPage({
    ...state.page,
    ...state.formState,
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
    keyword:''
  }
  getDataList()
}

const validator = async () => {
  if(state.modelValue.parkingControl&&!state.modelValue.parkingControlRows.length){
      return Promise.reject('开启停车权限必须选择开启权限的停车设备');
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
