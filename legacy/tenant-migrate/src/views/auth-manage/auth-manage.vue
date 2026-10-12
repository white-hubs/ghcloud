<template>
  <g-layout :title="pageTitle">
    <template #header-btn>
      <a-button type="primary" @click="add">新增</a-button>
    </template>
    <template #content-search>
      <a-form layout="inline">
        <a-form-item>
          <a-input placeholder="请输入关键字" v-model:value="form.keyword" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="getTableData">查询</a-button>
          <a-button style="margin-left: 10px" @click="reset">重置</a-button>
        </a-form-item>
      </a-form>
    </template>
    <template #content-table>
      <a-table :pagination="false" :dataSource="tableConfig.dataSource" :columns="tableConfig.columns"
        :loading="tableConfig.loading" size="small" :scroll={y:tableConfig.screenY} bordered>
      </a-table>
    </template>
    <template #footer-page>
      <a-pagination v-model:current="form.pageNumber" v-model:pageSize="form.pageSize" :total="tableConfig.total" :showSizeChanger="true"  @change="changeNum" @showSizeChange="changeSize" :showTotal="total => `共 ${total} 条`" />
    </template>
  </g-layout>
</template>

<script setup lang="ts">
import { cubeOuaaService } from '@/api/service';
import { historyPush } from '@/utils/utils';
import { Button,message,Popconfirm, Switch } from 'ant-design-vue';
import { reactive, onMounted, getCurrentInstance, h} from 'vue'
import { usePageName, queryParameter } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
// @ts-ignore
const { proxy } = getCurrentInstance();
const tableConfig = reactive({
  columns:[
    {
      title: "客户端名称",
      dataIndex: "name",
      width: '220px',
    },
    {
      title: "APPID",
      dataIndex: "code",
    },
    {
      title: "启用状态",
      dataIndex: "enabled",
      width: '220px',
      customRender: ({ record }) => {
        return h(Switch, {
          checked: record.enabled,
          onChange: async (checked) => {
            record.enabled=checked
            try {
              message.loading("请稍后");
              await cubeOuaaService.updateTenantClient({...record,enabled:checked});
              message.destroy();
              message.success("操作成功");
            } catch (error) {
              record.enabled=!checked
              message.destroy();
              message.error("操作失败");
            }
          }
        });
      }
    },
    {
      title: '操作',
      dataIndex: 'operate',
      ellipsis: true,
      fixed: 'right',
      width: '180px',
      align: 'center',
      customRender: ({ record }) => {
          return [
            h(Button, { type: 'link', size: 'small', onClick: () => {editRow(record.code)} }, { default: () => '编辑' }),
            h(
              Popconfirm,
              { title: '确定要删除该项？', danger: true, onConfirm: () => { delRow(record.code) } },
              {
                default: () => h(
                  Button,
                  { type: 'link', size: 'small', danger: true },
                  { default: () => '删除' }
                )
              }
            )
          ]
        }
    },
  ],
  dataSource:[],
  loading:false,
  screenY:520,
  total:0
})
const form = reactive({
  pageSize:20,
  pageNumber:1,
  keyword:'',
})
const getTableData = async()=>{
  tableConfig.loading = true
  queryParameter.setAddressQuery({
    keyword: form.keyword || undefined,
    pageNumber: form.pageNumber === 1 ? undefined : form.pageNumber,
    pageSize: form.pageSize === 20 ? undefined : form.pageSize,
  })
  const { records, total } = await cubeOuaaService.getTenantClientPage({...form})
  tableConfig.dataSource = records as never[]
  tableConfig.loading = false
  tableConfig.screenY = document.querySelector('.content-table')!.clientHeight-50
  tableConfig.total = total
}

const reset = ()=>{
  form.keyword = ''
  form.pageNumber = 1
  form.pageSize = 20
  queryParameter.setAddressQuery({})
  getTableData()
}
onMounted(async() => {
 const cacheQuery = queryParameter.getQuery() || {}
 form.keyword = cacheQuery.keyword ?? ''
 form.pageNumber = Number(cacheQuery.pageNumber ?? 1)
 form.pageSize = Number(cacheQuery.pageSize ?? 20)
 await getTableData()
})


function add(){
  historyPush({}, '/auth-manage-edit')
}
function editRow(code:string){
  historyPush({}, '/auth-manage-edit?code='+code)
}
async function delRow(code:string){
  try {
    message.loading('删除中')
    await cubeOuaaService.deleteTenantClient(code)
    getTableData()
  } catch (error) {
    message.error('删除失败')
  }
}
function changeNum (page) {
  form.pageNumber = page;
  getTableData()
};
function changeSize (current, size) {
  form.pageNumber = 1;
  form.pageSize = size;
  getTableData()
};
</script>
<style scoped lang="less">
:deep(.content-data) {
  text-align: left;
}
</style>
