<template>
  <Modal
    v-model:visible="modalVisible"
    :confirmLoading="show"
    width="1300px"
    title=""
    @ok="close('ok')"
    @cancel="close('cancel')"
  >
    <Form layout="inline" :model="searchForm" class="modal-form">
      <form-item label="仪表类型">
        <Select 
          placeholder="请选择" 
          v-model:value="searchForm.instrumentType" 
          style="width: 180px" 
          :options="classifyList" 
          allowClear  
          :field-names="{label: 'categoryName',value: 'categoryCode'}"
        ></Select>
      </form-item>
      <FormItem label="所属区域">
        <Cascader v-model:value="searchForm.deviceAreaId" :options="areaDataList"
          :fieldNames="{label: 'areaName',value: 'id'}" change-on-select placeholder="请选择区域" />
      </FormItem>
      <form-item label="">
        <Input v-model:value="searchForm.keyword" placeholder="请输入设备名称" />
      </form-item>
      <form-item>
        <Button type="primary" @click="getData">查询</Button>
      </form-item>
      <form-item>
        <Button @click="reset">重置</Button>
      </form-item>
    </Form>
    <div  style="margin: 10px;"><Checkbox v-model:checked="isSelectAll">勾选当前所有</Checkbox></div>
    <Table
      rowKey="id"
      :data-source="dataSource"
      :columns="columns"
      :row-selection="rowSelection"
      :pagination="false"
      :scroll="{ y: 450 }"
      size="middle"
      :loading="spinning"
    >
    </Table>
    <div style="display: flex;justify-content: flex-end;margin: 10px 0px;">
      <Pagination @change="pageChange"  size="small" :total="pagination.total" :show-total="(total: any) => `共 ${total} 条 第${pagination.current}/${pagination.pages}页`"></Pagination>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import {ref,reactive,watch, computed,onMounted} from "vue";
import {  Modal,Table } from "ant-design-vue/es";
import type { ColumnProps } from 'ant-design-vue/es/table'
import { DeviceList,EnergyCollectConfigList } from "@/api/energyOverview";
import { areaList } from '@/api/access'

type Key = ColumnProps['key'];
interface Props {
  visible?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  visible:false,
});
onMounted(async () => {
  let { data }= await EnergyCollectConfigList()
  classifyList.value=data
  const { data: areal } = await areaList()
  areaDataList.value = areal
});
const emit = defineEmits(['close'])
const isSelectAll = ref(false);
const modalVisible=ref(false)
const spinning = ref(true);
const show=ref(false)
const pagination=reactive({
  total: 0,
  position: "bottom",
  pages:1,
  pageSize: 10,
  current: 1,
})
const dataSource=ref([])
const columns=ref([
      {
        dataIndex: "code",
        title: "设备编码",
      },
      {
        dataIndex: "deviceName",
        title: "设备名称",
      },
      {
        dataIndex: "instrumentName",
        title: "仪表类型",
        customRender: ({ text }:{text:string}) => {
      return text;
    },
      },
      {
        dataIndex: "deviceAreaName",
        title: "所属区域",
        customRender: ({ text }:{text:string}) => {
      return text||'--';
    },
      },
])
const classifyList=ref([])
const areaDataList = ref([])
const searchForm = reactive({
  instrumentType:'',
  deviceAreaId:[],
  keyword: "",
});
const selectedList=ref() 
const selected=ref()
const rowSelection = computed(() => {
  return {
    selectedRowKeys: selected.value,
    onChange: (selectedRowKeys: Key[], selectedRows: any[]) => {
      selected.value = selectedRowKeys;
      selectedList.value = selectedRows;
    },
  };
})
//表格数据
const getData = async() => {
  spinning.value = true;
  const obj = {
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
    keyword:searchForm.keyword,
    instrumentType:searchForm.instrumentType,
    deviceAreaId: searchForm.deviceAreaId?.length ? searchForm.deviceAreaId[searchForm.deviceAreaId.length - 1] : '',
  };
  const { data } = await DeviceList(obj);
  dataSource.value = data.records;
  pagination.total = data.total;
  pagination.pages=data.pages;
  spinning.value = false;
};
watch(()=>props.visible,()=>{
  modalVisible.value=props.visible
  getData();
},{immediate:true,deep:true})
//重置 
const reset=()=>{
  Object.assign(searchForm, {
    instrumentType:'',
    deviceAreaId: [],
    keyword: "",
  });
  pagination.current = 1;
  getData();
}
const pageChange=( current: number, pageSize: number )=>{
  pagination.current = current;
  pagination.pageSize = pageSize;
  getData();
}
const close=(type?:string)=>{
  const obj = {
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
    keyword:searchForm.keyword,
    instrumentType:searchForm.instrumentType,
    deviceAreaId: searchForm.deviceAreaId?.length ? searchForm.deviceAreaId[searchForm.deviceAreaId.length - 1] : '',
    total: pagination.total
  }
  if(type==='ok'){
    emit('close',selectedList.value, isSelectAll.value,obj)
  }else if(type==='cancel'){
    emit('close',[], false,obj)
  }else{
    emit('close',[], isSelectAll.value,obj)
  }
  modalVisible.value=false
}
</script>
