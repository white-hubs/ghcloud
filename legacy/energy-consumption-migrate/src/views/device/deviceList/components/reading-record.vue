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
    <Button @click="tableChange('before')" style="margin-right: 10px;" :disabled="params.pageNumber===1">上一页</Button>
    <Button type="primary" @click="tableChange('after')" :disabled="tableList.length<10">下一页</Button>
  </div>
 </div>
</template>
<script setup lang="ts">
import { ReadRecordPage } from '@/api/energyOverview'
import type { ColumnsType } from 'ant-design-vue/es/table/Table'
import {  onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
const loading=ref(true)
const route=useRoute()
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
const params = reactive({
  total: 0,
  pageSize: 10,
  pageNumber: 1,
});
const tableList = ref([]);
const columns: ColumnsType = [
  {
    title: "采集时间",
    dataIndex: "curDateTime",
    key: "curDateTime",
    ellipsis: true,
    align:'center',
    customRender: ({ text }: { text: string }) => {
      return text;
    },
  },
  {
    title: "设备读数",
    dataIndex: "readValue",
    key: "readValue",
    ellipsis: true,
    align:'center',
    customRender: ({ text }: { text: string }) => {
      return text as string ??'--'
    },
  },
  {
    title: "本期用量",
    dataIndex: "usage",
    key: "usage",
    ellipsis: true,
    align:'center',
    customRender: ({ text }: { text: string }) => {
       return text as string ??'--'
    },
  },
  {
    title: "采集方式",
    dataIndex: "collectType",
    key: "collectType",
    ellipsis: true,
    align:'center',
    customRender: ({ text }: { text: string }) => {
      return text==='auto'?'自动':'手动'
    },
  },
];
const getTableData = async () => {
  const query=JSON.parse(JSON.stringify(route.query))
  loading.value=true
  const { data } = await ReadRecordPage({...params,deviceIds:query.deviceId})
  tableList.value = data.records;
  params.total = data.total;
  loading.value=false
};
const tableChange = (type:string) => {
  if(type==='before'){
    params.pageNumber-=1
  }else{
    params.pageNumber+=1
  }
  getTableData();
};
getTableData()
</script>