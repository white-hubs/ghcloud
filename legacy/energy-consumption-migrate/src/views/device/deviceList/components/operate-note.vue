<template>
 <div >
  <Table 
    :data-source="tableList" 
    :columns="columns" 
    :pagination="false" 
    :loading="loading"
    size="small" 
    :scroll="{y:scrollY }"
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
import { cubeDeviceCenterService } from '@/api/service'
import type { ColumnsType } from 'ant-design-vue/es/table/Table'
import {  onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
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
  deviceId: '',
  total: 0,
  pages:1,
  pageSize: 10,
  pageNumber: 1,
});
const loading=ref(true)
const tableList = ref();
const executeResultOptions = [
      { value: 'ARRIVAL', label: '命令送达给物联网平台' },
      { value: 'ISSUING', label: '下发中' },
      // { value: 'ISSUING,ARRIVAL', label: '下发中' },
      { value: 'SUCCESS', label: '成功' },
      { value: 'FAIL', label: '失败' },
      { value: 'EXPIRED', label: '超时' },
    ]
const columns: ColumnsType = [
  {
    title: "操作时间",
    dataIndex: "createTime",
    key: "createTime",
    ellipsis: true,
    align:'center',
    customRender: ({ text }: { text: string }) => {
      return text
    },
  },
  {
    title: "操作人",
    dataIndex: "createBy",
    key: "createBy",
    ellipsis: true,
    align:'center',
    customRender: ({ text }: { text: string }) => {
      return text as string ?? '--' 
    },
  },
  {
    title: "操作内容",
    dataIndex: "content",
    key: "content",
    ellipsis: true,
    align:'center',
    customRender: ({ record }: { record: { originalValue: { name: string; value: string; }; expectedValue: { value: string; }; }; }):string|void => {
      if (record.originalValue) {
          return `${record.originalValue.name}从【${record.originalValue.value}】调整为【${record.expectedValue.value}】`
      }
    }
  },
  {
    title: "备注",
    dataIndex: "executeResult",
    key: "executeResult",
    ellipsis: true,
    align:'center',
    customRender: ({ text }: { text: string; }) => {
      const curState = executeResultOptions.find(e => e.value === text || e.value.includes(text))
      return curState?.label ? curState.label : '--'
    }
  },
];
const getTableData = async () => {
  const query=JSON.parse(JSON.stringify(route.query))
  params.deviceId=query.id
  loading.value=true
  const res = await cubeDeviceCenterService.getDeviceLogPage({
    deviceInstanceId: params.deviceId,
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
  })
  tableList.value = res.records;
  params.total = res.total;
  params.pages=res.pages;
  loading.value=false
};
const tableChange = (current: number, pageSize: number) => {
  params.pageNumber = current;
  params.pageSize = pageSize;
  getTableData();
};
getTableData()
</script>