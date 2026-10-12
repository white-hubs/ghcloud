<template>
  <a-modal v-model:visible="modalVisible" :confirmLoading="show" width="1300px" :title="title" @ok="close('ok')"
    @cancel="close('cancel')">
    <a-form layout="inline" :model="searchForm" class="modal-form">
      <a-form-item v-if="type==='accessControl'" label="门禁类型">
        <a-tree-select v-model:value="searchForm.type" placeholder="请选择部门" style="width: 300px" :options="deptOptions"
          :fieldNames="{label: 'doorTypeName', value: 'id', children: 'children'}" allowClear showSearch treeNodeFilterProp="doorTypeName" />
      </a-form-item>
      <a-form-item label="所属区域">
        <div style="position: relative;overflow: visible;">
          <a-tree-select v-model:value="searchForm.doorArea" placeholder="请输入" style="width: 180px;"
            :fieldNames="{label: 'name', value: 'id', children: 'children'}" :tree-data="areaOptions">
          </a-tree-select>
        </div>
      </a-form-item>
      <a-form-item label="">
        <a-input v-model:value="searchForm.keyword" placeholder="请输入设备名称或型号" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="handleSearch">查询</a-button>
      </a-form-item>
      <a-form-item>
        <a-button @click="reset">重置</a-button>
      </a-form-item>
    </a-form>
    <a-table rowKey="id" :data-source="dataSource" :columns="columns" :row-selection="rowSelection" :pagination="false"
      :scroll="{ y: 450 }" size="middle" :loading="spinning">
    </a-table>
    <div style="display: flex;justify-content: flex-end;margin: 10px 0px;">
      <a-pagination @change="pageChange" size="small" :total="pagination.total"
        :show-total="(total: any) => `共 ${total} 条 第${pagination.current}/${pagination.pages}页`"></a-pagination>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import {ref,reactive,watch, computed} from "vue";
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeDoorControlService } from '@ghcloud/cube-access-control-service'
import { CubeParkingLotService } from '@ghcloud/cube-parking-lot-service'
import { authStore } from '@/api/auth-store'
 const cubeMdataService = new CubeMdataService(authStore)
 const cubeDoorControlService = new CubeDoorControlService(authStore)
 const cubeParkingLotService = new CubeParkingLotService(authStore)

interface Props {
  visible?: boolean;
  title?:string;
  type?:string;
  columns?:[];
  selected?:[]
}
const props = withDefaults(defineProps<Props>(), {
  visible:false,
  title:'',
});
const emit = defineEmits(['close'])
const modalVisible=ref(false)
const deptOptions=ref()
const areaOptions=ref()
const spinning = ref(false);
const show=ref(false)
const pagination=reactive({
  total: 0,
  position: "bottom",
  pages:1,
  pageSize: 10,
  current: 1,
})
const dataSource=ref([])
const columns=computed(()=>{
 return props.columns?.slice(0,props.columns.length-1)
})
const searchForm = reactive({
  type: '',
  keyword: "",
  doorArea:''
});
const selectedList=ref() 
const selected=ref<string[]>([])
const existList=ref<string[]>([])
const rowSelection = computed(() => {
  return {
    selectedRowKeys: selected.value,
    onChange: (selectedRowKeys: string[], selectedRows: any[]) => {
      selected.value = selectedRowKeys;
      selectedList.value = selectedRows;
    },
    getCheckboxProps: (record: any) => ({
        disabled: existList.value?.some(x=>x===record.id), 
        name: record.name,
      }),
  };
})
//下拉查询数据
cubeDoorControlService.getDoorTypeList().then((res: any) => {
  deptOptions.value = res;
}).catch((err: any)=>{
});
cubeMdataService.getAreaTree().then((res: any) => {
  areaOptions.value = res;
}).catch((err)=>{
});;
//表格数据
const getData = async() => {
  spinning.value = true;
  try{
    const obj = {
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
      keyword:searchForm.keyword,
      type:searchForm.type,
      doorArea:searchForm.doorArea,
      areaId:searchForm.doorArea,
    };
    const {records,total,pages}=props.type==='parking'
    ?await cubeParkingLotService.getParkingLotListPage(obj)
    :await cubeDoorControlService.getDoorDevicePage(obj)
    dataSource.value = records;
    pagination.total = total;
    pagination.pages=pages;
  }catch(err){
  }
  spinning.value = false;
};
const searchData =async () => {
  selected.value=props.selected?.map((x:{id:string})=>x.id)??[]
  existList.value=props.selected?.map((x:{id:string})=>x.id)??[]
};

watch(()=>props.visible,()=>{
  modalVisible.value=props.visible
  getData();
  searchData()
},{immediate:true,deep:true})
//重置 
const reset=()=>{
  Object.assign(searchForm, {
    type: '',
    keyword: "",
    doorArea:''
  });
  pagination.current = 1;
  getData();
}
//查询
const handleSearch=()=>{
  pagination.current = 1;
  getData()
}
const pageChange=( current: number, pageSize: number )=>{
  pagination.current = current;
  pagination.pageSize = pageSize;
  getData();
}
const close=(type?:string)=>{
  if(type==='ok'){
    const selected=selectedList.value?.filter((item: { id: any })=>!existList.value.includes(item.id ))??[]
    emit('close',selected)
  }else{
    emit('close',[])
  }
  modalVisible.value=false
}
</script>