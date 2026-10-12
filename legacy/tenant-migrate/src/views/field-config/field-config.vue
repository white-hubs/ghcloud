<template>
  <GLayout :title="pageTitle">
    <template #content-table>
      <div class="table">
        <Tabs v-model:activeKey="activeKey">
          <TabPane key="1" tab="表单字段配置">
            <Table :data-source="fieldTableList" :columns="columns" :pagination="false" size="small" :loading="loading"
              rowKey="key" :scroll="{y:scrollY }">
              <template #show="{ record }">
                <Switch v-if="record.show!==undefined" type="link" :checked="record.show"
                  @click="()=>handleShow(record)" />
                <div v-else>--</div>
              </template>
              <template #required="{ record }">
                <Switch v-if="record.required!==undefined" type="link" :checked="record.required"
                  @click="()=>handleRequired(record)" />
                <div v-else>--</div>
              </template>
              <template #alias="{ record }">
                <Input v-if="record.alias!==undefined" type="link" v-model:value="record.alias"
                  @blur="()=>handleAlias(record)" />
                <div v-else>--</div>
              </template>
            </Table>
          </TabPane>
          <TabPane key="2" tab="关键字配置">
            <Table :data-source="keywordTableList" :columns="keywordsColumns" :pagination="false" size="small"
              :loading="loading" rowKey="key" :scroll="{y:scrollY }">
              <template #alias="{ record }">
                <Input v-if="record.alias!==undefined" type="link" v-model:value="record.alias"
                  @blur="()=>handleAlias(record)" />
                <div v-else>--</div>
              </template>
            </Table>
          </TabPane>
        </Tabs>
      </div>
    </template>
  </GLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import GLayout from '@/components/global/Common/gLayout.vue'
import {Table, Switch, message,Input,Tabs,TabPane} from 'ant-design-vue'
import { cubeDictionaryService } from "@/api/service";
import { EMPLOYEE_CONFIG, ITEM_CODE } from "./field-config";
import { usePageName } from '@ghcloud/cube-utils'
import { KEYWORD_ALIAS } from '@ghcloud/cube-business-alias-manage-plugin'
interface TableData  {
  key:string,
  fieldName:string, 
  show?:boolean, 
  alias?:string|undefined,
  required?:boolean 
}
const loading=ref(true)
const scrollY = ref<number>(200)
const { pageTitle } = usePageName()
const dictionaryList=ref()
const scrollHandle = () => {
  let tableHeight=0
  const clientHeight = document.querySelector('.content-table')?.clientHeight
  if (clientHeight) {
    tableHeight = clientHeight -120
  }
  scrollY.value = tableHeight
}
const activeKey=ref('1')
const fieldTableList = ref<TableData[]>([]);
const keywordTableList=ref<TableData[]>([]);

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
        remarks: '用户字段配置'
      })
    }
    await getFieldConfigService()
    //更新字典
    const employeeList=(dictionaryList.value.find((x: { code: string })=>x.code===EMPLOYEE_CONFIG.code)?.variable&&JSON.parse(dictionaryList.value.find((x: { code: string })=>x.code===EMPLOYEE_CONFIG.code)?.variable??''))??EMPLOYEE_CONFIG.variable
    const fieldData=employeeList?.fields??[]
    const keywordData=employeeList?.keywords??[]
    fieldTableList.value=[...fieldData,...EMPLOYEE_CONFIG.variable.fields].reduce((acc, current) => {
      if (!acc.find((item:{key:string}) => item.key === current.key)) {
        acc.push(current);
      }return acc;
    }, [])
    keywordTableList.value=[...keywordData, ...EMPLOYEE_CONFIG.variable.keywords].reduce((acc, current) => {
      if (!acc.find((item:{key:string}) => item.key === current.key)) {
        acc.push(current);
      }
      return acc;
    }, [])
    const employeeConfig=dictionaryList.value.find((x: { code: string })=>x.code==='')
    await cubeDictionaryService.updateDataDictionary( {
      id: employeeConfig.id,
      itemCode: employeeConfig.itemCode,
      name:employeeConfig.name,
      code: employeeConfig.code,
      variable:JSON.stringify({fields:fieldTableList.value,keywords:keywordTableList.value}) 
    })
  } catch (error) {
  }finally{
    loading.value=false
  }
}
//初始化字典
const getFieldConfigService=async()=>{
  dictionaryList.value = await cubeDictionaryService.getDictionaryByItem({itemCode:ITEM_CODE})
  let insertNewDictionary = false
  const employeeDictionary=dictionaryList.value.find((item: { code: string })=>item.code===EMPLOYEE_CONFIG.code)
  // 不存在字典，添加新字典
  if(!employeeDictionary){employee
    await cubeDictionaryService.addDataDictionary({
      code:EMPLOYEE_CONFIG.code??'',
      itemCode: ITEM_CODE??'',
      name:EMPLOYEE_CONFIG.name??'',
      variable:JSON.stringify(EMPLOYEE_CONFIG.variable)??''
    })
    insertNewDictionary = true
  }

  if(insertNewDictionary){
    dictionaryList.value = await cubeDictionaryService.getDictionaryByItem({itemCode:ITEM_CODE})
  }
}
const columns = [
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
    slots: { customRender: 'show' },
  },
  {
    title: "是否必填",
    dataIndex: "required",
    key: "required",
    slots: { customRender: 'required' },
  },
  {
    title: "别名",
    dataIndex: "alias",
    key: "alias",
    slots: { customRender: 'alias' },
  },
];
const keywordsColumns = [
  {
    title: "字段名",
    dataIndex: "fieldName",
    key: "fieldName",
    ellipsis: true,
    align:'center',
  },
  {
    title: "别名",
    dataIndex: "alias",
    key: "alias",
    slots: { customRender: 'alias' },
  },
];
const handleShow=async(record:TableData)=>{
  try{
    fieldTableList.value.forEach(x=>{
      if(x.key===record.key){
        x.show=!record.show
      }
    })
    const data=dictionaryList.value.find(x=>x.code===EMPLOYEE_CONFIG.code)
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
    const data=dictionaryList.value.find(x=>x.code===EMPLOYEE_CONFIG.code)
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

const handleAlias=async(record:TableData)=>{
  try{
    fieldTableList.value.forEach(x=>{
      if(x.key===record.key){
        x.alias=record.alias
      }
    })
    const data=dictionaryList.value.find((x: { code: string })=>x.code===EMPLOYEE_CONFIG.code)
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
  margin-top: 20px;
}

.pagination {
  margin-top: 20px;
  float: right;
}
</style>
