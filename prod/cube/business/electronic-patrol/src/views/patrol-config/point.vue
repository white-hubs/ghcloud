<template>
  <GLayout :title="pageTitle" :showfooter="true">
    <template #header-btn>
      <Button type="primary" style="margin-right: 10px;" :loading="codeLoading" @click="downLoadQRcode">
        下载二维码
      </Button>
      <Button type="primary" style="margin-right: 10px;" @click="addPlan">新增</Button>
      <Button type="primary" style="margin-right: 10px;" :loading="downloadLoading" @click="download">下载模板</Button>
      <Upload action="/api/maintain/patrol/location/import/template" :headers="header" @change="uploadChange">
        <Button type="primary" :loading="uploadLoading">批量导入</Button>
        <template #itemRender />
      </Upload>
    </template>
    <template #content-search>
      <Form layout="inline" :model="formState">
        <FormItem>
          <Input v-model:value="formState.keyword" placeholder="巡更点名称" />
        </FormItem>
        <FormItem label="所属区域:">
          <Cascader v-model:value="cascader" style="width: 200px" placeholder="请选择"
            :field-names="{ label: 'name', value: 'id', children: 'children' }" :options="areaOptions" allow-clear
            show-search change-on-select />
        </FormItem>

        <FormItem>
          <Button type="primary" @click="query">查询</Button>
        </FormItem>
        <FormItem>
          <Button @click="reset"> 重置 </Button>
        </FormItem>
      </Form>
    </template>
    <template #content-table>
      <AliasTable :columns="columns" :data-source="dataSource" :pagination="false" size="small" bordered
        :loading="loading"
        :row-selection="{onSelect: onSelect, onSelectAll: onSelectAll,onChange: onTableChange, selectedRowKeys: selectedRowKeysState }"
        row-key="id" applicationCode="ELECTRONIC_PATROL" tableCode="ELECTRONIC_PATROL_POINT" :scrollY="tableScrollY" />
    </template>
    <template #footer-page>
      <Pagination v-model:current="formState.pageNumber" v-model:pageSize="formState.pageSize" show-size-changer
        :total="formState.total" :default-current="1" :show-total="(total: number) => `共 ${total} 条数据`"
        @change="pageChange" />
    </template>
    <Modal v-model:visible="visible" :title="editorPut ? '添加巡更点' : '编辑巡更点'" width="900px" @ok="handler">
      <Form ref="formRef" :rules="formRules" class="mt--15px" :model="addPlanPoint"
        :label-col="{ style: 'width: 130px' }">
        <FormItem label="巡更点名称:" name="patrolLocationName">
          <Input v-model:value="addPlanPoint.patrolLocationName" :maxlength="20" placeholder="巡更点名称" />
        </FormItem>
        <FormItem label="巡更点模型编码:" name="bimCode">
          <Input v-model:value="addPlanPoint.bimCode" :maxlength="20" placeholder="模型编码" />
        </FormItem>
        <FormItem label="所属区域:" name="areaIds">
          <Cascader v-model:value="nfcCascader" placeholder="请选择"
            :field-names="{ label: 'name', value: 'id', children: 'children' }" :options="areaOptions" allow-clear
            show-search change-on-select @change="onChange" />
        </FormItem>
        <FormItem label="关联巡更点设备:" name="deviceId">
          <Select v-model:value="addPlanPoint.deviceId" :field-names="{ label: 'deviceCode', value: 'id' }"
            :options="nfcOptions" @change="nfcChange" />
        </FormItem>
        <FormItem label="nfc:">
          <Input v-model:value="addPlanPoint.nfcCode" :disabled="true" placeholder="nfc编号" />
        </FormItem>
        <FormItem label="蓝牙信标地址:">
          <Input v-model:value="addPlanPoint.bluetoothCode" :disabled="true" placeholder="蓝牙信标地址" />
        </FormItem>
        <FormItem label="经度:" style="display: none;">
          <Input v-model:value="addPlanPoint.patrolLongitude" :disabled="true" placeholder="请输入经度" />
        </FormItem>
        <FormItem label="纬度:" style="display: none;">
          <Input v-model:value="addPlanPoint.patrolDimension" :disabled="true" placeholder="请输入纬度" />
        </FormItem>
        <FormItem label="说明:">
          <Textarea v-model:value="addPlanPoint.remarks" :maxlength="200" placeholder="请描述" />
        </FormItem>
      </Form>
    </Modal>
  </GLayout>
</template>

<script setup lang="ts">
import { nfcAll } from '@/api/nfc'
import { getAreaList, QRcodeDownload } from '@/api/ouaa'
import { pointPage, addpoint, updatepoint, deletepoint, downloadTpl } from '@/api/point-api'
import { Button, Popover, type TableColumnType, Popconfirm, type UploadChangeParam, type UploadFile } from 'ant-design-vue'
import { message } from '@ghcloud/cube-ui'
import type { Rule } from 'ant-design-vue/es/form/interface'
import type { SelectValue } from 'ant-design-vue/es/tree-select'
import type { ValueType } from 'ant-design-vue/es/vc-cascader/Cascader'
import dayjs from 'dayjs'
import { h, onMounted, reactive, ref } from 'vue'
import { AliasTable } from '@ghcloud/generic-component'
import { getNowEnterprise, getToken } from '@/utils/auth'
import { Pagination } from 'ant-design-vue'
import { usePageName } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
const header = ref({
  tenant: getNowEnterprise()?.code,
  terminal: window.config?.terminal,
  Authorization: `Bearer ${getToken().accessToken}`,
})
const areaOptions = ref([])
const cascader = ref<string[]>([])
const nfcCascader = ref<string[]>([])
const codeLoading = ref(false)
const tableScrollY = ref(500)
const addPlanPoint = reactive<Plan.AddPoint & { id?: string }>({
  id: '',
  patrolLocationName: '',
  nfcCode: '',
  remarks: '',
  patrolLongitude: '',
  patrolDimension: '',
  areaIds: [],
  bluetoothCode: '',
  bimCode: '',
  deviceId: ''
})
const formState = reactive<Plan.FormState>({
  keyword: '',
  areaId: '',
  pageNumber: 1,
  pageSize: 10,
  total: 0,
})
const formRules: Record<string, Rule[]> = {
  patrolLocationName: [{ required: true, message: '请输入芯片编号', trigger: 'change' }],
  patrolLongitude: [{ required: true, message: '请输入经度', trigger: 'blur' }],
  patrolDimension: [{ required: true, message: '请输入纬度', trigger: 'blur' }],
  deviceCode: [{ required: true, message: '请选择设备', trigger: 'change' }],
  bluetoothCode: [{ required: true, message: '请输入蓝牙信标地址', trigger: 'blur' }],
  areaIds: [{ required: true, message: '请选择所属区域', trigger: 'change' }],
}
const loading = ref<boolean>(false)
const dataSource = ref([])
const selectedList = ref<any[]>([])
const selectedRowKeysState = ref<Key[]>([])

const onChange = (value: ValueType): void => {
  addPlanPoint.areaIds = value
}
onMounted(() => {
  getAreaList().then((res) => {
    if (res.data) {
      areaOptions.value = res.data
    }
    query()
  })
})
const columns = ref<TableColumnType[]>([
  {
    title: '序号',
    width: 70,
    align: 'center',
    customRender: ({ index }) => {
      return index + 1
    },
  },
  {
    title: '巡更点名称',
    width: 100,
    dataIndex: 'patrolLocationName',
    key: 'patrolLocationName',
    customCell:() => {
      return {
        style: {
          wordWrap:'break-word',
          wordBreak:'break-all',
          whiteSpace:'normal',
          minHeight:'50px',
          width: '50px',
        }
      }
    },
    customRender: ({ text }) => {
      return h(Popover, { content: text || '--' }, text || '--')
    },
  },
  {
    title: '关联巡更点设备',
    dataIndex: 'deviceCode',
    width: 120,
    key: 'deviceCode',
    customRender: ({ text }) => {
      return h(Popover, { content: text || '--' }, text || '--')
    },
  },
  {
    title: '所属区域',
    dataIndex: 'area',
    width: 180,
    key: 'area',
    customRender: ({ record }) => {
      const res = record.area.map((res: { name: string; }) => res.name).join('/')
      return h(Popover, { content: res || '--' }, res || '--')
    },
  },
  {
    title: '模型编码',
    dataIndex: 'bimCode',
    width: 120,
    key: 'bimCode',
    customRender: ({ text }) => {
      return h(Popover, { content: text || '--' }, text || '--')
    },
  },
  {
    title: '经纬度',
    dataIndex: 'patrolLongitude',
    key: 'patrolLongitude',
    align: 'center',
    width: 180,
    customRender: ({ record }) => {
      const res = `${record.patrolLongitude}/${record.patrolDimension}`
      return h(Popover, { content: res || '--' }, res || '--')

    },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    align: 'center',
    width: 150,
    customRender: ({ record }) => {
      const res = `${dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')}`
      return h(Popover, { content: res || '--' }, res || '--')
    },
  },
  {
    title: '巡更NFC芯片',
    dataIndex: 'nfcCode',
    key: 'nfcCode',
    width: 150,
    customRender: ({ text }) => {
      return h(Popover, { content: text || '--' }, text || '--')
    },
  },
  {
    title: '蓝牙信标地址',
    dataIndex: 'bluetoothCode',
    width: 180,
    key: 'bluetoothCode',
    customRender: ({ text }) => {
      return h(Popover, { content: text || '--' }, text || '--')
    },
  },
  {
    title: '说明',
    dataIndex: 'remarks',
    key: 'remarks',
    ellipsis:true,
    width: 200,
    customRender: ({ record }) => {
      const res = `${record.remarks === '' ? '--' : record.remarks}`
      return h(Popover, { content: res || '--' }, res || '--')
    },
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 150,
    customRender: ({ record }) => {
      return [
        h(
          Button,
          { type: 'link', size: 'small', onClick: () => { editRow(record) } },
          { default: () => '编辑' }
        ),
        h(
          Popconfirm,
          { title: '确定要删除该项？', danger: true, onConfirm: () => { delRow(record.id) } },
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
])
const pageChange = (pageNumber: number, pageSize: number): void => {
  formState.pageNumber = pageNumber
  formState.pageSize = pageSize
  query()
}

const query = async (): Promise<void> => {
  try {
    loading.value = true
    formState.areaId = cascader.value.join(',')
    pointPage(formState).then((res) => {
      const { data } = res
      dataSource.value = data.records
      formState.total = data.total
    })
    tableScrollY.value = (document.querySelector('.content-table') as unknown as HTMLElement).clientHeight - 50
  } catch (error) {
    message.error('查询错误')
  } finally {
    setTimeout(() => {
      loading.value = false
    }, 300)
  }
}
const nfcChange: any = (
  value: SelectValue,
): void => {
  const info = nfcOptions.value.find((res: { nfcCode: string;id: string; }) => res.id === value)
  if (info) {
    addPlanPoint.patrolLongitude = info.nfcLongitude
    addPlanPoint.patrolDimension = info.nfcDimension
    addPlanPoint.bluetoothCode = info.bluetoothCode
    addPlanPoint.nfcCode = info.nfcCode
  }
}
const reset = (): void => {
  cascader.value = []
  Object.assign(formState, {
    keyword: '',
    areaId: '',
    pageNumber: 1,
    pageSize: 10,
    total: 0,
  })
  query()
}
const editRow = async (record: any): Promise<void> => {
  // 重置表单
  nfcCascader.value = []
  Object.assign(addPlanPoint, {
    patrolLocationName: '',
    bimCode: '',
    nfcCode: '',
    remarks: '',
    patrolLongitude: '',
    patrolDimension: '',
    areaIds: [],
    bluetoothCode: '',
    deviceId: '',
    id: '',
  })
  
  // 设置编辑数据
  if (record.areaId) {
    nfcCascader.value = record.areaId.split(',').filter((item: string) => item)
  }
  
  // 复制记录数据到表单
  Object.assign(addPlanPoint, {
    id: record.id,
    patrolLocationName: record.patrolLocationName || '',
    bimCode: record.bimCode || '',
    nfcCode: record.nfcCode || '',
    remarks: record.remarks || '',
    patrolLongitude: record.patrolLongitude || '',
    patrolDimension: record.patrolDimension || '',
    bluetoothCode: record.bluetoothCode || '',
    deviceId: record.deviceId || '',
    areaIds: nfcCascader.value,
  })
  
  // 获取设备列表
  if (record.deviceId) {
    const { data } = await nfcAll({
      deviceId: record.deviceId,
    })
    nfcOptions.value = data || []
  } else {
    const { data } = await nfcAll()
    nfcOptions.value = data || []
  }
  
  editorPut.value = false
  visible.value = true
}
const delRow = async (id: string): Promise<void> => {
  await deletepoint(id)
  query()
}
const formRef = ref()
const editorPut = ref<boolean>(true)
const handler = async (): Promise<void> => {
  try {
    // 设置区域ID
    addPlanPoint.areaIds = nfcCascader.value
    
    // 表单验证
    await formRef.value.validateFields()
    
    if (!editorPut.value) {
      // 编辑模式：更新数据
      await updatepoint(addPlanPoint)
      message.success('修改成功')
    } else {
      // 新增模式：添加数据
      await addpoint(addPlanPoint)
      message.success('添加成功')
    }
    
    // 关闭弹窗并刷新列表
    visible.value = false
    query()
    
    // 重置表单
    resetForm()
  } catch (error) {
    // 表单验证失败
  }
}

// 重置表单
const resetForm = (): void => {
  nfcCascader.value = []
  Object.assign(addPlanPoint, {
    patrolLocationName: '',
    bimCode: '',
    nfcCode: '',
    remarks: '',
    patrolLongitude: '',
    patrolDimension: '',
    areaIds: [],
    bluetoothCode: '',
    deviceId: '',
    id: '',
  })
  editorPut.value = true
}
const visible = ref<boolean>(false)
const nfcOptions = ref<{
  id: string;
  nfcCode: string;
  nfcDimension: string;
  nfcLongitude: string;
  remarks: string;
  bluetoothCode: string;
}[]>([])
const addPlan = async (): Promise<void> => {
  // 重置表单
  resetForm()
  
  // 获取设备列表
  const { data } = await nfcAll()
  nfcOptions.value = data || []
  
  editorPut.value = true
  visible.value = true
}
const onSelect = (record: any, selected: any): void => {
  if (selected) {
    selectedList.value.push(record)
  } else {
    const delIndex = selectedList.value.findIndex(val => {
      return val.id === record.id
    })
    selectedList.value.splice(delIndex, 1)
  }
}
const onSelectAll = (selected: any, _selectionRows: any, changeRows: any[]): void => {
  if (selected) {
    selectedList.value = selectedList.value.concat(changeRows)
  }
  if (!selected) {
    let selectionRows = JSON.parse(JSON.stringify(selectedList.value))
    const delIndex: any[] = []
    selectionRows.forEach((item: any, index: number) => {
      changeRows.forEach((val: { id: any; }) => {
        if (item.id === val.id) {
          delIndex.push(index)
        }
      })
    })
    delIndex.forEach(item => {
      delete selectionRows[item]
    })
    selectionRows = selectionRows.filter((item: any) => {
      return item !== undefined
    })
    selectedList.value = selectionRows
  }
}
type Key = string | number
const onTableChange = (selectedRowKeys: Key[], _selectedRows: any): void => {
  selectedRowKeysState.value = selectedRowKeys
  selectedList.value = selectedList.value.filter(e=>selectedRowKeys.includes(e.id))
}
const saveQrcodeZip = (data: unknown): void => {
  const blob = data instanceof Blob ? data : new Blob([data as BlobPart], { type: 'application/zip' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.download = '二维码.zip'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
// 下载二维码
const downLoadQRcode = async (): Promise<void> => {
  if (selectedList.value.length === 0) {
    message.warn('请选择要下载的二维码')
    return
  }
  // 生成二维码
  getQrcodeList()
}
// 获取二维码列表
const getQrcodeList = (): void => {
  const entityInfo = selectedList.value.map((x: any) => { return { entityId: x.id, entityName: x.patrolLocationName, serialNumber: x.serialNumber } })
  codeLoading.value = true
  QRcodeDownload({ entityType: 'PATROL_POINT', entityInfo }).then(async res => {
    if (res?.data) {
      saveQrcodeZip(res.data)
    }
    codeLoading.value = false
  }).catch(() => {
    codeLoading.value = false
  })
}
const downloadLoading = ref(false)
/** 下载模板 */
const download = async (): Promise<void> => {
  try {
    downloadLoading.value = true
    const { data } = await downloadTpl()
    const link = document.createElement('a')
    const blob = new Blob([data as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    link.style.display = 'none'
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', '巡更点模版.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    message.error('下载失败')
  } finally {
    setTimeout(() => {
      downloadLoading.value = false
    }, 1000)
  }
}
const uploadLoading = ref(false)
const uploadChange = (info: UploadChangeParam<UploadFile>): void => {
  uploadLoading.value = true
  if (info.file.status === 'done') {
    query()
  } else if (info.file.status === 'error') {
    message.error(info.file.response.message)
    uploadLoading.value = false
  }
}
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");

.down-load {
  opacity: 0;
}

.tableStyle {
  width: 1600px
}

:deep(.ant-table-body) {
  overflow-x: auto !important;
}
</style>
