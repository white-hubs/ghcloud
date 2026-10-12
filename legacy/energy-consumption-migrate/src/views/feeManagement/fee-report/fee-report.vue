<template>
  <GLayout title="费用报表">
    <template #header-btn>
      <Button type="primary" @click="handleExport" style="margin-right: 10px;">导出</Button>
    </template>
    <template #content-data>
      <Tabs @change="tabsChange" v-model:activeKey="activeKey">
        <TabPane key="total" tab="总费用报表">
          <ReportList :activeKey="activeKey" :columns="totalFeeColumns" @search="(val)=>searchItem=val" :refresh="refresh"></ReportList>
        </TabPane>
        <TabPane  key="electric" tab="电费报表">
          <ReportList :activeKey="activeKey" :columns="electricColumns"  @search="(val)=>searchItem=val"></ReportList>
        </TabPane>
        <TabPane  key="water" tab="水费报表">
          <ReportList :activeKey="activeKey" :columns="waterColumns"  @search="(val)=>searchItem=val"></ReportList>
        </TabPane>
        <TabPane  key="gas" tab="燃气费报表">
          <ReportList :activeKey="activeKey" :columns="gasColumns"  @search="(val)=>searchItem=val"></ReportList>
        </TabPane>
      </Tabs>
    </template>
  </GLayout>
 </template>
<script setup lang="ts">
import GLayout from "@/components/common/gLayout.vue";
import {  ref } from "vue";
import ReportList from './components/report-list.vue'
import {totalFeeColumns,electricColumns,waterColumns,gasColumns} from './columns'
import { message } from "ant-design-vue";
import { exportReportElectric, exportReportOther, exportReportTotal } from '@/api/feeManage'
const activeKey = ref("total");
const refresh=ref(true)
const searchItem=ref()
const tabsChange = (value: any) => {
  activeKey.value = value;
};
//导出=========================================================================================================================================================
const handleExport = async() => {
  if(searchItem.value.tableLength===0){
    message.warning('未查询到数据，无法导出')
    return
  }
  const exportData=ref()
  const exportTitle=ref()
  if(activeKey.value==='total'){
    //总费用报表导出
    const params={
      period: searchItem.value.period
    }
    const { data }=await exportReportTotal(params)
    
    exportData.value=data
    exportTitle.value='总费用报表.xlsx'
  }else if(activeKey.value==='electric'){
    //电费报表导出
    const params={
      period: searchItem.value.period
    }
    const { data }=await exportReportElectric(params)
    exportData.value=data
    exportTitle.value='电费报表.xlsx'
  }else if(activeKey.value==='water'){
    //水表导出
    const params={
      instrumentTypeList: 'water_meter',
      period: searchItem.value.period
    }
    const { data }=await exportReportOther(params)
    exportData.value=data
    exportTitle.value='水费报表.xlsx'
  }else{
    //气费报表
    const params={
      instrumentTypeList: 'gas_meter',
      period: searchItem.value.period,
    }
    const { data }=await exportReportOther(params)
    exportData.value=data
    exportTitle.value='气费报表.xlsx'
  }
  //生成excel
  const link = document.createElement('a')
  const blob = new Blob([exportData.value], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  link.style.display = 'none'
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', exportTitle.value)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
};
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");
.import{
  .describe{
    color:red;
    font-size: 12px;
  }
  .operate{
    margin-left: 22px;
  }
  .item{
    margin: 10px 0px;
  }
}
.result{
    .success{
      color: #00ba8b;
    }
    .error{color: red;}
}
.table{
  margin-top: 20px;
}
.pagination{
  margin-top: 10px;
  float: right;
}
</style>
