<template>
 <div id="myTable">
  <Table 
    :data-source="tableList" 
    :columns="columns" 
    :pagination="false" 
    :loading="loading"
    :scroll="{y:scrollY }"
    size="small" 
    rowKey="deviceId">
  </Table>
  <div style="float: right;margin: 20px 0px;">
    <Pagination 
    v-model:current="params.pageNumber" 
    v-model:pageSize="params.pageSize" 
    show-size-changer
    :show-total="(total: any) => `共 ${total} 条 第${params.pageNumber}/${params.pages}页`"
    :total="params.total" @change="tableChange">
  </Pagination>
  </div>
 </div>
</template>
<script setup lang="ts">
import { TableRecordPage } from '@/api/device'
import { timeFormat } from '@/utils/common'
import type { ColumnsType } from 'ant-design-vue/es/table/Table'
import {  onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
const route=useRoute()
const params = reactive({
  deviceId: '',
  total: 0,
  pages:1,
  pageSize: 10,
  pageNumber: 1,
});
const loading=ref(true)
const tableList = ref([]);
const columns: ColumnsType = [
  {
    title: "更换时间",
    dataIndex: "optTime",
    key: "optTime",
    ellipsis: true,
    align:'center',
    customRender: ({ text }: { text: string }) => {
      return timeFormat(text,true)
    },
  },
  {
    title: "操作人",
    dataIndex: "optUserName",
    key: "optUserName",
    ellipsis: true,
    align:'center',
    customRender: ({ text }: { text: string }) => {
      return text as string ?? '--' 
    },
  },
  {
    title: "仪表初始读数",
    dataIndex: "initValue",
    key: "initValue",
    ellipsis: true,
    align:'center',
    customRender: ({ text }: { text: string }) => {
       return text as string ??'--'
    },
  },
  {
    title: "仪表最新读数",
    dataIndex: "changedDeviceValue",
    key: "changedDeviceValue",
    ellipsis: true,
    align:'center',
    customRender: ({ text }: { text: string }) => {
      return text as string ?? '--' 
    },
  },
];
const scrollY = ref<number>(200)
const scrollHandle = () => {
  let tableHeight=0
  const clientHeight = document.querySelector('#tabs')?.clientHeight
  if (clientHeight) {
    tableHeight = clientHeight -160
  }
  scrollY.value = tableHeight
}
onMounted(async()=>{
  // 设置表格滚动
  scrollHandle()
  window.addEventListener('resize', function () {
    scrollHandle()
  })
})
const getTableData = async () => {
  const query=JSON.parse(JSON.stringify(route.query))
  params.deviceId=query.deviceId
  loading.value=true
  const { data } = await TableRecordPage({...params});
  tableList.value = data.records;
  params.total = data.total;
  params.pages=data.pages;
  loading.value=false
};
const tableChange = (current: number, pageSize: number) => {
  params.pageNumber = current;
  params.pageSize = pageSize;
  getTableData();
};
getTableData()
</script>