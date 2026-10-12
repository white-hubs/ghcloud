<template>
  <div class="flow-table">
    <GLayout :title="pageTitle">
      <template #header-btn>
        <Button type="primary" @click="handleAdd">新增</Button>
      </template>
      <template #content-search>
      </template>
      <template #content-table>
        <AliasTable
          :columns="columns" :data-source="dataSource" :pagination="false"
          :scroll="tableScroll" size="small" bordered :loading="loading"
          row-key="id"
          :applicationCode="applicationCode" 
          tableCode="ASSET_CLASS"
          :scrollX="tableScroll.x"
          :scrollY="tableScroll.y"
        />
      </template>
      <template #footer-page>
      </template>
    </GLayout>
    <GModalForm
      v-model="modalVisible" :form-source="formSource" :form-state="modalFormState" :rule="modalFormRules"
      :title="(handleType==='add'?'新增':'编辑')+pageTitle" :submit-loading="submitLoading" @ok="handleOk"
    />
  </div>
</template>
<script setup lang="ts">
import { classifyDel, classifyInsert, classifyUpdate, getAssemblyClassifyTree } from '@/api/asset-management/asset-management'
import GLayout from '@/components/common/g-layout.vue'
import GModalForm from '@/components/common/g-modal-form.vue'
import { message, type TableColumnsType, Input, Textarea, Button, Popconfirm, Popover } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { h, onMounted, ref } from 'vue'
import { AliasTable } from '@ghcloud/generic-component'
import { usePageName } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
const applicationCode = __ENV__.applicationCode
const type = 'assetType'
// const formState = reactive({ name: '' })
const loading = ref(false)
const dataSource = ref<unknown[]>([])
// const pagination = ref({
//   pageSize: 10,
//   pageNumber: 1,
//   total: 0
// })

type Tree ={
  id:string,
  name:string,
  children?:Tree[],
  lv:number
}

/** 递归赋予层级 */
function setLevelValue(data:Tree[],lv=1){
  data.forEach(ele=>{
    ele.lv=lv
    if(ele.children&&ele.children.length){
      ele.children=setLevelValue(ele.children,lv+1)
    }
  })
  return data
}
const getTableData = async () => {
  const params = {
    // pageNumber: pagination.value.pageNumber,
    // pageSize: pagination.value.pageSize,
    type,
    // name: formState.name || null
  };
  loading.value = true;
  try {
    const res = await getAssemblyClassifyTree(params);
    if (res.data) {
      dataSource.value = setLevelValue(res.data as Tree[]);
    }
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
};

// const pageChange = (pageNumber: number, pageSize: number) => {
//   pagination.value.pageNumber = pageNumber || 1;
//   pagination.value.pageSize = pageSize;
//   getTableData();
// };

const modalFormState = ref({
  name: '',
  type,
  remarks: '',
  
})
const tableScroll = ref({ x: 1000, y: document.querySelector('.content-table')?.clientHeight ?? 435 })

onMounted(() => {
  getTableData();
  tableScroll.value.y = document.querySelector('.content-table')!.clientHeight - 39
})

const submitLoading = ref(false)
const modalVisible = ref(false)
const handleType = ref<'add'|'edit'>('add')
const parentId =ref('')
const handleAdd = () => {
  handleType.value = 'add'
  parentId.value = ''
  modalFormState.value = {
    name: '', remarks: '', type
  }
  modalVisible.value = true
}
const editRow = (row: {name: string;type: string;remarks: string;parentId:string}) => {
  handleType.value = 'edit'
  modalFormState.value = JSON.parse(JSON.stringify(row))
  parentId.value = row.parentId
  modalVisible.value = true
}
const delRow = async (row: {id:string;}) => {
  await classifyDel({ id: row.id })
  message.success('操作成功')
  getTableData()
}
const addChild=(row:{id:string})=>{
  handleAdd()
  parentId.value = row.id
}
const DISABLED_ROW=['易燃设备','消防设备','电动车']
function findDisable(record: { name: string; children: string | any[] }){
  if(DISABLED_ROW.includes(record.name)){
    return true
  }
  if(record.children&&record.children.length>0){
    for (const item of record.children) {
      const find=findDisable(item)
      if(find){
        return true
      }
    }
  }
  return false
}

const columns: TableColumnsType = [
  {
    title: '分类名称',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '备注说明',
    dataIndex: 'remarks',
    key: 'remarks',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 200,
    customRender: ({ record }) => {
      return [
        h(
          Button,
          { type: 'link', size: 'small', onClick: () => addChild(record),disabled:record.lv>=3 },
          '新增分类'
        ),
        h(
          Button,
          { type: 'link', size: 'small', onClick: () => editRow(record), disabled:findDisable(record) },
          '编辑'
        ),
        h(
          Popconfirm,
          { title: '确定要删除该项？', danger: true, onConfirm: () => { delRow(record) }, disabled:findDisable(record) },
          h(
            Button,
            { type: 'link', size: 'small', danger: true, disabled:findDisable(record) },
            '删除'
          )
        )
      ]
    }
  }
]

const formSource = ref<{value: string | number;label: string;component: unknown;props?: unknown;}[]>([
  {
    label: '分类名称',
    value: 'name',
    component: Input,
    props: {
      placeholder: '请输入分类名称',
      maxLength: 20
    }
  },
  {
    label: '备注说明',
    value: 'remarks',
    component: Textarea,
    props: {
      placeholder: '请输入备注说明',
      autoSize: { minRows: 4, maxRows: 6 },
      maxLength: 200
    }
  }
])
const modalFormRules: Record<string, Rule[]> = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}
const handleOk = async () => {
  try {
    submitLoading.value = true
    const params = {...modalFormState.value,parentId:parentId.value}
    if (handleType.value === 'add') {
      await classifyInsert(params)
    } else {
      await classifyUpdate(params)
    }
    message.success('操作成功')
    modalVisible.value = false
    submitLoading.value = false
    getTableData()
    modalFormState.value = {
      name: '', remarks: '', type
    }
  } catch (error) {
    submitLoading.value = false
  }
}

// const queryForm = () => {
//   pagination.value.pageNumber = 1
//   getTableData()
// }
// const reset = () => {
//   formState.name = ''
//   queryForm()
// }
</script>
<style lang="less" scoped>
.flow-table {
  height: 100%;
}
</style>
