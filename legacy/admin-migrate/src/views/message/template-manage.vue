<template>
  <g-layout title="模板管理">
    <template #header-btn>
      <a-button type="primary" @click="toPage('add')" :disabled="!useAdmin">新增</a-button>
    </template>
    <template #content-data>
      <a-radio-group style="margin-top: 10px;" @change="otherQuery" v-model:value="formState.channelCode"
        button-style="solid">
        <a-radio-button v-for="item in msgChannelsList" :value="item.code">{{ item.name }}</a-radio-button>
      </a-radio-group>
    </template>
    <template #content-search>
      <a-form :model="formState" layout="inline">
        <a-form-item label="应用名称">
          <a-select show-search @change="otherQuery" optionFilterProp="label" allowClear style="width: 200px;"
            v-model:value="formState.applicationCode" placeholder="请选择应用">
            <a-select-option :value="item.id" :label="item.name" v-for="item in applyList" :key="item.id">
              {{ item.name}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-input placeholder="模板名称查询" v-model:value="formState.keyword" />
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
          <a-button type="primary" @click="MessageAcceptanceList">查询</a-button>
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
          <a-button style="margin-left: 10px" @click="reset">重置</a-button>
        </a-form-item>
      </a-form>
    </template>
    <template #content-table>
      <a-table :pagination="false" :dataSource="tableConfig.dataSource" :columns="tableConfig.columns"
        :loading="tableConfig.loading">
        <template #operate="{record}">
          <a-button type="link" @click="association(record)" :disabled="!useAdmin">编辑</a-button>
        </template>
      </a-table>
    </template>
    <template #footer-page>
      <a-pagination v-model:pageSize="pagination.pageSize" v-model:current="pagination.pageNumber" :total="pagination.total" show-less-items
        :show-total="(total: number) => `共 ${total} 条数据`" @change="MessageAcceptanceList" />
    </template>
  </g-layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted,getCurrentInstance} from 'vue'
import { useRouter } from "vue-router";
const { proxy } = getCurrentInstance();
const router = useRouter();
const msgChannelsList = ref<{code:string;name:string}[]>([])
const useAdmin = window.config.useAdmin
const tableConfig = reactive({
  columns:[
  {
    title: '模板ID',
    dataIndex: 'id',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '模板名称',
    dataIndex: 'name',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '应用',
    dataIndex: 'applicationName',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '使用场景',
    dataIndex: 'msgSceneName',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '内容',
    dataIndex: 'content',
    ellipsis: true,
    align: 'center',
    width:800,
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '操作',
    dataIndex: 'operate',
    ellipsis: true,
    align: 'center',
    slots: { customRender: 'operate' },
  },
  ],
  dataSource:[ ],
  loading:false
})

const formState = reactive({
  applicationCode:'',
  keyword:'',
  channelCode:''
})
const pagination = reactive({
  pageSize: 6,
  pageNumber: 1,
  total: 0
})
const applyList = ref<any>([])
const getApplicationData = async ()=>{
  let res = await  proxy.$api.appList('get',{pageSize:1000})
  applyList.value = res.records
  msgChannelsList.value = await  proxy.$api.msgChannels()
  formState.channelCode = msgChannelsList.value[0].code
}
const toPage = (type)=>{
 router.push({
  path:'/addTemplate',
  query:{
    type,
    channelCode:formState.channelCode
  }
 })
}
const MessageAcceptanceList = async()=>{
  let code =  applyList.value.filter(item=>{
    if (item.id === formState.applicationCode) {
       return item
    }
  })
  let params = JSON.parse(JSON.stringify(formState))
  params.applicationCode = code[0]?code[0].code:''
  tableConfig.loading = true
  const res = await proxy.$api.msgTmpPage(Object.assign(params,pagination) );
  tableConfig.dataSource = res.records
  pagination.total = res.total
  tableConfig.loading = false
}
const association = (val)=>{
  router.push({
  path:'/addTemplate',
  query:{
    type:'modify',
    data:JSON.stringify(val)
  }
 })
}
// 通过渠道应用名称查询
const otherQuery = ()=>{
  pagination.pageNumber = 1 
  MessageAcceptanceList()
}
const reset = ()=>{
  formState.applicationCode=''
  formState.keyword=''
  MessageAcceptanceList()
}
onMounted(async() => {
 await getApplicationData()
 await MessageAcceptanceList()
})
</script>
<style scoped lang="less">
:deep(.content-data) {
  text-align: left;
}
</style>