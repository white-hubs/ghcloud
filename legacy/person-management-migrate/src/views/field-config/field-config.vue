<template>
  <GLayout :title="pageTitle">
    <template #content-table>
      <div class="table">
        <Tabs v-model:activeKey="activeKey">
          <TabPane key="1" tab="表单字段配置">
            <AliasTable tableCode="PERSONNELMANAGEMENT_FIELD_CONFIG" applicationCode="PERSONNELMANAGEMENT"
              :data-source="fieldTableList" :columns="columns" :pagination="false" size="small" :loading="loading"
              rowKey="key" :scroll-y="scrollY">
            </AliasTable>
          </TabPane>
          <!-- <TabPane key="2" tab="关键字配置">
            <AliasTable tableCode="PERSONNELMANAGEMENT_PERSONAL_KEYWORD_CONFIG" applicationCode="PERSONNELMANAGEMENT"
              :data-source="keywordTableList" :columns="aliasColumns" :pagination="false" size="small"
              :loading="loading" rowKey="key" :scroll-y="scrollY">
            </AliasTable>
          </TabPane> -->
        </Tabs>
      </div>
    </template>
  </GLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from "vue";
import GLayout from '@/components/common/gLayout.vue'
import { Switch, message, Input,Tabs,TabPane,Button} from 'ant-design-vue'
import {EditOutlined,CheckOutlined} from '@ant-design/icons-vue'
import { ROSTER_CONFIG, ITEM_CODE } from "./field-config";
import type { DictionaryTree } from '@ghcloud/cube-dictionary-service/src/type'
import { authStore } from "@/api/auth-store";
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { ColumnsType } from 'ant-design-vue/es/table/interface'
import { AliasTable } from '@ghcloud/generic-component'
import { usePageName } from '@ghcloud/cube-utils'
import { KEYWORD_ALIAS } from '@ghcloud/cube-business-alias-manage-plugin'

interface TableData  {
   key:string,
   fieldName:string, 
   show?:boolean, 
   required?:boolean,
   alias?:string 
}
const loading=ref(true)
const { pageTitle } = usePageName()
const scrollY = ref<number>(200)
const activeKey=ref('1')
const fieldTableList = ref<TableData[]>([]);
const keywordTableList=ref<TableData[]>([]);
const cubeDictionaryService = new CubeDictionaryService(authStore)
const scrollHandle = () => {
  let tableHeight=0
  const clientHeight = document.querySelector('.content-table')?.clientHeight
  if (clientHeight) {
    tableHeight = clientHeight-110
  }
  scrollY.value = tableHeight
}
onMounted(async () => {
  getDictionaryItem()
   // 设置表格滚动
  scrollHandle()
  window.addEventListener('resize', function () {
    scrollHandle()
  })
});
//初始化字典项
const getDictionaryItem = async (): Promise<void> => {
  try {
    loading.value=true
    const dictionaryItem = await cubeDictionaryService.getDictionaryItemByCode({
      code: ITEM_CODE
    })
    if (!dictionaryItem) {
      await cubeDictionaryService.addDataDictionaryItem({
        code: ITEM_CODE,
        remarks: '字段配置'
      })
    }
    await getFieldConfigService()
    //更新字典
    const rosterList=(dictionaryList.value.find((x: { code: string })=>x.code===ROSTER_CONFIG.code)?.variable&&JSON.parse(dictionaryList.value.find((x: { code: string })=>x.code===ROSTER_CONFIG.code)?.variable??''))??ROSTER_CONFIG.variable
    const fieldData=rosterList?.fields??[]
    const keywordData=rosterList?.keywords??[]
    fieldTableList.value=[...fieldData,...ROSTER_CONFIG.variable.fields]
    .reduce((acc, current) => {
      if (!acc.find((item:{key:string}) => item.key === current.key)) {
        acc.push(current);
      }
      return acc;
    }, [])
    .filter((x: { key: string })=>ROSTER_CONFIG.variable.fields.find((y: { key: string })=>y.key===x.key))
    .map((item:any)=>{
      return {
        ...item,
        isEdit:false,
      }
    })
    keywordTableList.value=[...keywordData, ...ROSTER_CONFIG.variable.keywords].reduce((acc, current) => {
      if (!acc.find((item:{key:string}) => item.key === current.key)) {
        acc.push(current);
      }
      return acc;
    }, [])
    const rosterConfig=dictionaryList.value.find((x: { code: string })=>x.code===ROSTER_CONFIG.code)
    await cubeDictionaryService.updateDataDictionary( {
      id: rosterConfig.id,
      itemCode: rosterConfig.itemCode,
      name:rosterConfig.name,
      code: rosterConfig.code,
      variable:JSON.stringify({fields:fieldTableList.value,keywords:keywordTableList.value}) 
    })
  } catch (error) {
  }finally{
    loading.value=false
  }
}
const dictionaryList=ref()
//初始化字典
const getFieldConfigService=async()=>{
  dictionaryList.value = await cubeDictionaryService.getDictionaryByItem({itemCode:ITEM_CODE})
  let insertNewDictionary = false
  const rosterDictionary=dictionaryList.value.find((item: { code: string })=>item.code===ROSTER_CONFIG.code)
  // 不存在字典，添加新字典
  if(!rosterDictionary){
    await cubeDictionaryService.addDataDictionary({
      code:ROSTER_CONFIG.code??'',
      itemCode: ITEM_CODE??'',
      name:ROSTER_CONFIG.name??'',
      variable:JSON.stringify(ROSTER_CONFIG.variable)??''
    })
    insertNewDictionary = true
  }
  if(insertNewDictionary){
    dictionaryList.value = await cubeDictionaryService.getDictionaryByItem({itemCode:ITEM_CODE})
  }
}
const columns: ColumnsType<any> = [
  {
    title: "字段名",
    dataIndex: "fieldName",
    key: "fieldName",
    ellipsis: true,
    align:'center',
  },
  {
    title: "是否显示",
    dataIndex: "show",
    key: "show",
    align:'center',
    customRender: ({ record }) => {
      if(record.show!==undefined){
        return [
        h(
          Switch,
          {
            onClick: ()=>handleShow(record),
            checked: record.show,
            style: { width: '40px' },
          }
        )
        ]
      }
      return [h( 'div','--')]
    }
  },
  {
    title: "是否必填",
    dataIndex: "required",
    key: "required",
    align:'center',
    customRender: ({ record }) => {
      if(record.required!==undefined){
        return [
          h(
            Switch,
            {
              onClick: ()=>handleRequired(record), 
              checked: record.required , 
              style: { width: '40px' },
            }
          )
        ]
      }
      return [h( 'div','--')]
    }
  },
  {
    title: "别名",
    dataIndex: "alias",
    key: "alias",
    align:'center',
    customRender: ({ record }) => {
      if(record.isEdit){
        return [h('div',{
        style:{
          padding:'0 30px',
          gap:'12px',
          display:'flex',
          justifyContent:'space-between',
          alignItems:'center',
        },
      },[
           h(
            Input,
            {
              onChange: (e: Event)=>{record.alias=(e.target as HTMLInputElement).value}, 
              value: record.alias,
            },
          )  
      ,h(
        CheckOutlined,
        {
          style:{
            cursor: 'pointer'
          },
          onClick: () => {
           handleAlias(record)
           record.isEdit = false
        },
        }
      )])]
      }
      return [h('div',{
        style:{
          padding:'0 30px',
          display:'flex',
          gap:'12px',
          justifyContent:'space-between',
          alignItems:'center',
        },
      },[record.alias || '--',h(
        EditOutlined,
        {
          style:{
            cursor: 'pointer'
          },
          onClick: () => {
          record.isEdit = true
        },
        }
      )],)]
    }
  },
];
const aliasColumns: ColumnsType<any> = [
  {
    title: "关键字",
    dataIndex: "fieldName",
    key: "fieldName",
    ellipsis: true,
    align:'center',
  },
  {
    title: "别名",
    dataIndex: "alias",
    key: "alias",
    align:'center',
    customRender: ({ record }) => {
      if(record.isEdit){
        return [h('div',{
        style:{
          padding:'0 30px',
          gap:'12px',
          display:'flex',
          justifyContent:'space-between',
          alignItems:'center',
        },
      },[
           h(
            Input,
            {
              onChange: (e: Event)=>{record.alias=(e.target as HTMLInputElement).value}, 
              value: record.alias,
            },
          )  
      ,h(
        CheckOutlined,
        {
          style:{
            cursor: 'pointer'
          },
          onClick: () => {
           handleAlias(record)
           record.isEdit = false
        },
        }
      )])]
      }
      return [h('div',{
        style:{
          padding:'0 30px',
          display:'flex',
          justifyContent:'space-between',
          alignItems:'center',
        },
      },[record.alias || '--',h(
        EditOutlined,
        {
          style:{
            cursor: 'pointer'
          },
          onClick: () => {
          record.isEdit = true
        },
        }
      )],)]
    }
  },
];
const setKeyWordAlias=async(list:TableData[])=>{
  //获取别名
  const nameList=list.map((item,index)=>{
    let obj
    if(item.alias){
      obj={
        key:list[index].key,
        name:item.alias
      }
    }else{
      obj={
        key:list[index].key,
        name:list[index].fieldName
      }
    }
    return obj
  })
  const aliasMap = nameList.reduce((acc, curr) => {
    acc[curr.key] = curr.name
    return acc
  }, {} as Record<string, string>)
    Object.assign(KEYWORD_ALIAS,aliasMap)
}
const handleShow=async(record:TableData)=>{
  try{
    fieldTableList.value.forEach(x=>{
      if(x.key===record.key){
        x.show=!record.show
      }
    })
    const data=dictionaryList.value.find((x: { code: string })=>x.code===ROSTER_CONFIG.code)
    await cubeDictionaryService.updateDataDictionary( {
      id: data.id,
      itemCode: data.itemCode,
      name:data.name,
      code: data.code,
      variable:JSON.stringify({fields:fieldTableList.value,keywords:keywordTableList.value}) 
    })
    message.success("操作成功");
  }catch(err){message.error("操作失败");}
}
const handleRequired=async(record:TableData)=>{
  try{
    fieldTableList.value.forEach(x=>{
      if(x.key===record.key){
        x.required=!record.required
      }
    })
    const data=dictionaryList.value.find((x: { code: string })=>x.code===ROSTER_CONFIG.code)
    await cubeDictionaryService.updateDataDictionary( {
      id: data.id,
      itemCode: data.itemCode,
      name:data.name,
      code: data.code,
      variable:JSON.stringify({fields:fieldTableList.value,keywords:keywordTableList.value}) 
    })
    message.success("操作成功");
  }catch(err){message.error("操作失败"); }
  
}
const handleAlias=async(record:TableData)=>{
  try{
    fieldTableList.value.forEach(x=>{
      if(x.key===record.key){
        x.alias=record.alias
      }
    })
    const data=dictionaryList.value.find((x: { code: string })=>x.code===ROSTER_CONFIG.code)
    await cubeDictionaryService.updateDataDictionary( {
      id: data.id,
      itemCode: data.itemCode,
      name:data.name,
      code: data.code,
      variable:JSON.stringify({fields:fieldTableList.value,keywords:keywordTableList.value}) 
    })
    setKeyWordAlias(keywordTableList.value)
    message.success("操作成功");
  }catch(err){message.error("操作失败"); }
  
}
</script>
<style lang="less" scoped>
.table {
  // margin-top: 20px;
}


.pagination {
  margin-top: 20px;
  float: right;
}
</style>