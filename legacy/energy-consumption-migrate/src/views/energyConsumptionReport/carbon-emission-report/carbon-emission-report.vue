<template>
  <GLayout title="碳排报表">
    <template #header-btn>
      <Button type="primary" @click="handleExport" style="margin-right: 10px;">导出</Button>
    </template>
    <template #content-data>
      <Tabs @change="tabschange" v-model:activeKey="activeKey">
        <TabPane key="classify" tab="分类报表">
          <ReportList :activeKey="activeKey" :columns="classifyColumns"  @search="(val)=>searchItem=val"></ReportList>
        </TabPane>
        <TabPane  key="subItem" tab="分项报表">
          <ReportList :activeKey="activeKey" :columns="subItemColumns"  @search="(val)=>searchItem=val"></ReportList>
        </TabPane>
        <TabPane  key="area" tab="区域报表">
          <ReportList :activeKey="activeKey" :columns="areaColumns"  @search="(val)=>searchItem=val"></ReportList>
        </TabPane>
      </Tabs>
    </template>
  </GLayout>
</template>
<script setup lang="ts">
import GLayout from "@/components/common/gLayout.vue";
import {  ref } from "vue";
import ReportList from '../components/report-list.vue'
import {classifyColumns,subItemColumns,areaColumns} from './columns'
import { classifyExport, subItemExport } from "@/api/energyOverview";
import { message } from "ant-design-vue";
const activeKey = ref("classify");
const searchItem=ref()
const tabschange = (value: any) => {
  activeKey.value = value;
  sessionStorage.setItem("instrumentType", value);
};

//导出=======================================================================================================
const handleExport = async() => {
  if(searchItem.value.tableLength===0){
    message.warning('未查询到数据，无法导出')
    return
  }
  const exportData=ref()
  const exportTitle=ref()
  if(activeKey.value==='classify'){
    //分类导出
    const params={
      instrumentType: searchItem.value.instrumentType,
      period: searchItem.value.period,
      projectCategory: "CATEGORY",
      exportType: "CARBON"
    }
    const { data }=await classifyExport(params)
    exportData.value=data
    exportTitle.value='分类报表.xlsx'
  }else if(activeKey.value==='subItem'){
    //分项导出
    const params={
      instrumentType: searchItem.value.instrumentType,
      period: searchItem.value.period,
      projectCategory: "ITEM",
      exportType: "CARBON"
    }
    const { data }=await subItemExport(params)
    exportData.value=data
    exportTitle.value='分项报表.xlsx'
  }else{
    //区域报表
    const params={
      instrumentType: searchItem.value.instrumentType,
      projectId:searchItem.value.projectId,
      period: searchItem.value.period,
      projectCategory: "AREA",
      exportType: "CARBON"
    }
    const { data }=await subItemExport(params)
    exportData.value=data
    exportTitle.value='区域报表.xlsx'
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
