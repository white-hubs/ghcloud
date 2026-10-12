<template>
  <GLayout :title="pageTitle">
    <template v-slot:header-btn>
      <div style="display:flex">
        <a-button type="primary" :disabled="tableList.length === 0" :loading="downLoading" @click="() => { handleDownload() }">导出</a-button>
      </div>
    </template>
    <template #content-search>
      <Form layout="inline" :model="searchForm">
        <FormItem>
          <Input v-model:value="searchForm.keyword" placeholder="请输入人员名称" />
        </FormItem>
        <FormItem label="人员类别">
          <Select v-model:value="searchForm.type" placeholder="请选择" style="width: 180px" allowClear>
            <SelectOption v-for="item in typeOptions" :key="item.value" :value="item.value">{{ item.label }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="queryForm">查询</Button>
        </FormItem>
        <FormItem>
          <Button @click="reset"> 重置 </Button>
        </FormItem>
      </Form>
    </template>
    <template #content-table>
      <div class="table">
        <Table :data-source="tableList" :columns="columns" :pagination="false" size="small" 
          :loading="loading" rowKey="name" :scroll="{y:scrollY }">
          <template #operate="{ record }">
            <Button type="link" @click="handleDetail(record)">详情</Button>
          </template>
        </Table>
      </div>
    </template>
    <template #footer-page>
      <Pagination v-model:current="searchForm.pageNumber" v-model:pageSize="searchForm.pageSize" show-size-changer
        :total="searchForm.total" :default-current="1" :show-total="(total: number) => `共 ${total} 条数据`"
        @change="pageChange" />
    </template>
  </GLayout>
  <!-- 新增分项 -->
  <Modal v-model:visible="modalVisible" @ok="modalVisible=false" title="用户详情">
    <div class="detail">
      <img v-if="detailData.find(x=>x.key==='fileVO')?.value" :src="detailData.find(x=>x.key==='fileVO')?.value??''" width="100" height="100"/>
      <ul>
        <li v-for="item in detailData.filter(x=>x.key!=='fileVO')">
          <span> {{ item.title }}：</span>
          <span> {{ item.value ||'--'}}</span>
        </li>
      </ul>
    </div>
  </Modal>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import GLayout from '@/components/global/Common/gLayout.vue'
import { Pagination,Select,SelectOption,Input,Table,FormItem,Form,Button,Modal}from 'ant-design-vue'
import { staffTypeList, userCenterPage } from '@/api'
import { usePageName, useDownloadExcel } from '@ghcloud/cube-utils'
import { cubePersonnelManagementService } from "@/api/service";

const { pageTitle } = usePageName()
const scrollY = ref<number>(100)
const modalVisible=ref(false)
const scrollHandle = () => {
  let tableHeight=0
  const clientHeight = document.querySelector('.layout-content')?.clientHeight
  if (clientHeight) {
    tableHeight = clientHeight -130
  }
  scrollY.value = tableHeight
}
onMounted(async()=>{
  getTableList()
  getTYpeList()
  // 设置表格滚动
  scrollHandle()
  window.addEventListener('resize', function () {
    scrollHandle()
  })
})
const searchForm = reactive({
  type:undefined,
  keyword: '',
  total: 0,
  pages:1,
  pageSize: 10,
  pageNumber: 1,
});
const loading=ref(false)
const tableList = ref([]);
const typeOptions=ref<{ label: string; value: string; }[]>([])
const columns= [
{
    title: '人员类别',
    dataIndex: 'typeName',
    key:'typeName',
    width: 100,
    ellipsis: true,
    customRender: ({ text }) => text||'--'
  },
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
    width: 100,
    customRender: ({ text }) => text||'--'
  },
  {
    title: '联系电话',
    dataIndex: 'phone',
    key: 'phone',
    ellipsis: true,
    width: 100,
     customRender: ({ text }) => text||'--'
  },
  {
    title: '操作',
    dataIndex: 'operate',
    key:'operate',
    width: 100,
    slots:{
      customRender:'operate',
    }
  },
  {
    title: '',
    dataIndex: 'fileVO',
    key: 'fileVO',
    width: 0,
  },
];
const getTableList = async () => {
  try{
    loading.value=true
    const data = await userCenterPage(searchForm) as unknown as {records:[],total:number,pages:number};
    tableList.value = data.records;
    searchForm.total=data.total
    searchForm.pages=data.pages;
  }catch(err){}finally{
    loading.value=false
  }
  
  
};
const getTYpeList=async()=>{
  try{
    const data=await staffTypeList() as unknown as []
  typeOptions.value=data.map((x:{name:string;code:string})=>{
    return {label:x.name,value:x.code}
  })
  }catch(err){
    
  }
}
const pageChange = (pageNumber: number, pageSize: number) => {
  searchForm.pageNumber = pageNumber || 1;
  searchForm.pageSize = pageSize;
  getTableList();
};
const queryForm = () => {
  searchForm.pageNumber = 1
  getTableList()
}
const reset = () => {
  searchForm.type = undefined;
  searchForm.keyword = '';
  queryForm()
}
const detailData=ref<{title:string,value:string;key:string}[]>([])
const handleDetail=(record: any)=>{
  detailData.value=[]
  columns.forEach(x=>{
      if(x.key!=='operate'){
        if(x.key==='fileVO'){
          detailData.value.push({
            key:x.key,
            title:x.title,
            value:record[x.key]?.[0]?.path
          })
        }else{
          detailData.value.push({
            key:x.key,
            title:x.title,
            value:record[x.key]
          })
        }
      }
  })
  modalVisible.value=true
}
const { downLoading, handleDownload } = useDownloadExcel({
  fileName: pageTitle,
  exportServiceApi: async (): Promise<Blob> => {
    const params = Object.keys(searchForm).reduce((acc, key) => {
      if (searchForm[key] !== null) {
        acc[key] = searchForm[key];
      }
      return acc;
    }, {});
    return await cubePersonnelManagementService.getPersonnelUsersExcel(params)
  }
})
</script>
<style lang="less" scoped>
.detail{
  display: flex;
  align-items: center;
}
ul li{
  padding:0px 15px !important;
  margin:0  !important;;
  list-style:none;
  line-height: 30px;
}
</style>