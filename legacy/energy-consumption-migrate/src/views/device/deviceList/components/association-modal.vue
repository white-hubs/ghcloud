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
      <form-item label="产品分类">
        <cascader
          v-model:value="searchForm.categoryCode"
          placeholder="请输入"
          change-on-select
          style="width: 180px"
          :field-names="{
            label: 'categoryName',
            value: 'categoryCode',
            children: 'children',
          }"
          :options="options"
        >
        </cascader>
      </form-item>
      <form-item label="">
        <Input v-model:value="searchForm.keyword" placeholder="请输入设备名称或型号" />
      </form-item>
      <form-item>
        <Button type="primary" @click="handleSearch">查询</Button>
      </form-item>
      <form-item>
        <Button @click="reset">重置</Button>
      </form-item>
    </Form>
    <div  style="margin: 10px;"><Checkbox v-model:checked="isSelectAll" :disabled="disabledAllCheck||dataSource.length===0">勾选当前所有</Checkbox></div>
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
import {ref,reactive,watch, computed} from "vue";
import {  Modal,Table } from "ant-design-vue/es";
import { cubeDeviceCenterService ,cubeMdataService} from "@/api/service";
import { cubeOuaaService } from '@/api/service'
import type { ColumnProps } from 'ant-design-vue/es/table'
import { SearchDevice } from '@/api/energyOverview'

type Key = ColumnProps['key'];
interface Props {
  visible?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  visible:false,
});
const emit = defineEmits(['close'])
const isSelectAll = ref(false);
const modalVisible=ref(false)
const deptOptions=ref()
const areaOptions=ref()
const options=ref()
const spinning = ref(false);
const show=ref(false)
const disabledAllCheck=ref(true)
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
        dataIndex: "name",
        title: "设备名称",
      },
      {
        dataIndex: "genreName",
        title: "产品分类",
        customRender: ({ record} :any) => {
          return record.productInfo?.productCategory?.name??'--';
        },
      },
      {
        dataIndex: "modelName",
        title: "产品名称",
        customRender: ({ record }) => {
          return record.productInfo?.name??'--';
        },
      },
      {
        dataIndex: "brandName",
        title: "设备品牌",
        customRender: ({ record }) => {
          return record.productInfo?.brandName??'--';
        },
      },
      {
        dataIndex: "areaName",
        title: "所属区域",
        customRender: ({ record }) => {
          return record?.area&&record?.area?.pathName!==''?record?.area?.pathName:'--'
        },
      },
])
const searchForm = reactive({
  categoryCode: [],
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
    getCheckboxProps: (record: any) => ({
        disabled: existList.value.some(x=>x===record.id), 
        name: record.name,
      }),
  };
})
//下拉查询数据
cubeDeviceCenterService.getIotProductCategoryTree().then((res: any)=>{
  options.value=res
})
cubeOuaaService.getDeptList().then((res: any) => {
  deptOptions.value = res;
});
cubeMdataService.getAreaTree().then((res: any) => {
  areaOptions.value = res;
});
//表格数据
const getData = () => {
  spinning.value = true;
  const obj = {
    filterTagCodes:[`builtin.app::ENERGY_CONSUMPTION`],
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
    keyword:searchForm.keyword,
    categoryCode:searchForm.categoryCode?searchForm.categoryCode.join('-'):'',
  };
  cubeDeviceCenterService.getDeviceInstancePageAll(obj).then((res: any)=>{
    dataSource.value = res.records;
    pagination.total = res.total;
    pagination.pages=res.pages;
    spinning.value = false;
})
};
const existList=ref<any[]>([])
const searchData =async () => {
  const {data}=await SearchDevice()
  selected.value=data
  existList.value=data
};

watch(()=>props.visible,()=>{
  modalVisible.value=props.visible
  getData();
  searchData()
},{immediate:true,deep:true})
//重置 
const reset=()=>{
      Object.assign(searchForm, {
        categoryCode: [],
        keyword: "",
      });
      disabledAllCheck.value=searchForm.keyword!==''||searchForm.categoryCode?.length>0?false:true
      pagination.current = 1;
      getData();
}
//查询
const handleSearch=()=>{
  disabledAllCheck.value=searchForm.keyword!==''||searchForm.categoryCode?.length>0?false:true
  pagination.current = 1;
  getData()
}
const pageChange=( current: number, pageSize: number )=>{
  disabledAllCheck.value=searchForm.keyword!==''||searchForm.categoryCode?.length>0?false:true
  pagination.current = current;
  pagination.pageSize = pageSize;
  getData();
}
const close=(type?:string)=>{
  const obj = {
    filterTagCodes:[`builtin.app::ENERGY_CONSUMPTION`],
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
    keyword:searchForm.keyword,
    categoryCode:searchForm.categoryCode?searchForm.categoryCode.join('-'):'',
  }
  if(type==='ok'){
    if(isSelectAll.value){
      emit('close',selectedList.value, isSelectAll.value,obj)
    }else{
      const selected=selectedList.value?.filter((item: { id: any })=>!existList.value.includes(item.id ))
      emit('close',selected, isSelectAll.value,obj)
    }
  }else{
    emit('close',[], false,obj)
  }
  modalVisible.value=false
}
</script>
