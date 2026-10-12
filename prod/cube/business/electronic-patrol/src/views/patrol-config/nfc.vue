<template>
  <GLayout :title="pageTitle" :showfooter="true">
    <template #header-btn>
      <div class="w-300px flex justify-between">
        <Button type="primary" @click="addPlan">新增</Button>
        <Button type="primary" @click="download">下载模板</Button>
        <Upload action="/api/maintain/nfc/import" :headers="header" @change="uploadChange">
          <Button type="primary" :loading="buttonUpload">批量导入</Button>
          <template #itemRender />
        </Upload>
      </div>
    </template>
    <template #content-data>
      <div class="mt-15px" />
      <Form class="mt-15px" style="margin-bottom: 12px;" layout="inline" :model="formState">
        <FormItem>
          <Input v-model:value="formState.keyword" placeholder="nfc芯片编号/蓝牙编码" />
        </FormItem>
        <FormItem>
          <Button type="primary" @click="query">查询</Button>
        </FormItem>
        <FormItem>
          <Button @click="reset"> 重置 </Button>
        </FormItem>
      </Form>
      <AliasTable
        :columns="columns" :data-source="dataSource" :pagination="false" size="small"
        bordered
        :loading="loading" row-key="id" application-code="ELECTRONIC_PATROL" table-code="ELECTRONIC_PATROL_NFC"
        :scroll-x="1000" :scroll-y="450"
      />
    </template>
    <template #footer-page>
      <Pagination
        v-model:current="formState.pageNumber" v-model:pageSize="formState.pageSize" :total="formState.total"
        :default-current="1" show-size-changer :show-total="(total: number) => `共 ${total} 条数据`" @change="pageChange"
      />
    </template>

    <Modal v-model:visible="visible" :title="visibleTitle" width="800px" @ok="handleOk">
      <Form
        v-if="visible" ref="formRef" class="mt--15px" :model="addNfc"
        :rules="formRules"
        :label-col="{ style: 'width: 110px' }"
      >
        <FormItem label=" 巡更点设备:" name="deviceCode">
          <Input v-model:value="addNfc.deviceCode" placeholder="请输入巡更点设备" :maxlength="30" />
        </FormItem>
        <FormItem label=" NFC芯片编号:" name="nfcCode">
          <Input v-model:value="addNfc.nfcCode" placeholder="NFC芯片编号" :maxlength="30" />
        </FormItem>
        <FormItem label="蓝牙编码:" name="bluetoothCode">
          <Input v-model:value="addNfc.bluetoothCode" placeholder="请输入蓝牙编码" :maxlength="30" />
        </FormItem>
        <FormItem label="获取经纬度:">
          <Button @click="getPosition">获取经纬度</Button>
          <span style="margin-left: 10px;">{{ addNfc.nfcDimension }} {{ addNfc.nfcLongitude }} </span>
        </FormItem>
        <!-- //精度纬度是反的 反了就别显示出来了吧，后续治理 -->
        <FormItem label="经度:" name="nfcLongitude" style="display: none;">
          <Input v-model:value="addNfc.nfcLongitude" disabled placeholder="经度" />
        </FormItem>
        <FormItem label="纬度:" name="nfcDimension" style="display: none;">
          <Input v-model:value="addNfc.nfcDimension" disabled placeholder="纬度" />
        </FormItem>
        <FormItem label="说明:" name="remarks">
          <Textarea v-model:value="addNfc.remarks" placeholder="请描述" :maxlength="100" />
        </FormItem>
      </Form>
    </Modal>
  </GLayout>
</template>
<script lang="ts">
import { addnfc, deletenfc, downloadModule, nfcPage, updatenfc } from '@/api/nfc'
import { tenantinfo } from '@/api/ouaa'
import GLayout from '@/components/common/g-layout.vue'
import { message } from '@ghcloud/cube-ui'
import { Button, Popconfirm, Popover, type TableColumnType } from 'ant-design-vue'
import { useMapModal, AliasTable } from '@ghcloud/generic-component'
import type { Rule } from 'ant-design-vue/es/form/interface'
import dayjs from 'dayjs'
import { onMounted, reactive, ref, h } from 'vue'
import type { UploadChangeParam, UploadFile } from 'ant-design-vue/es/upload/interface'
import { getNowEnterprise, getToken } from '@/utils/auth'
import { usePageName } from '@ghcloud/cube-utils'
</script>
<script setup lang="ts">
const { showMapModal } = useMapModal()
const { pageTitle } = usePageName()
const header = ref({
  tenant: getNowEnterprise()?.code,
  terminal: 'bimops-manage-web',
  Authorization: `Bearer ${getToken().accessToken}`,
})

const formState = reactive<Path.FormState>({
  keyword: '',
  pageNumber: 1,
  pageSize: 10,
  total: 0,
})

// 蓝牙编码和NFC芯片编号不能同时为空
const validateCodeRequired = (_rule: Rule, value: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!addNfc.bluetoothCode && !addNfc.nfcCode) {
      reject(new Error('蓝牙编码和NFC芯片编号不能同时为空'))
    } else {
      resolve()
    }
  })
}

const formRules: Record<string, Rule[]> = {
  deviceCode: [{ required: true, message: '请输入设备', trigger: 'blur' }],
  nfcLongitude: [{ required: false, message: '请输入经度', trigger: 'blur' }],
  nfcDimension: [{ required: false, message: '请输入纬度', trigger: 'blur' }],
  bluetoothCode: [
    { required: false, message: '请输入蓝牙编码', trigger: 'blur' },
    { validator: validateCodeRequired, trigger: 'blur' }
  ],
  nfcCode: [
    { required: false, message: '请输入芯片编号', trigger: 'change' },
    { validator: validateCodeRequired, trigger: 'change' }
  ],
}

const addNfc = reactive<NFC.AddNfc>({
  deviceCode: '',
  nfcDimension: 0,
  nfcLongitude: 0,
  nfcCode: '',
  bluetoothCode: '',
  remarks: '',
})
const loading = ref<boolean>(false)
const dataSource = ref([])
const columns = ref<TableColumnType[]>([
  {
    title: '序号',
    width: 70,
    customRender: ({ index }) => {
      return index + 1
    },
  },
  {
    title: '巡更NFC芯片',
    key: 'nfcCode',
    dataIndex: 'nfcCode',
  },
  {
    title: '巡更点设备',
    key: 'deviceCode',
    dataIndex: 'deviceCode',
  },
  {
    title: '蓝牙编码',
    key: 'bluetoothCode',
    dataIndex: 'bluetoothCode',
  },
  {
    title: '经度',
    dataIndex: 'nfcLongitude',
    key: 'nfcLongitude',
  },
  {
    title: '纬度',
    dataIndex: 'nfcDimension',
    key: 'nfcDimension',
  },
  {
    title: '说明',
    dataIndex: 'remarks',
    ellipsis: true,
    key: 'remarks',
    customRender: ({ text }) => {
      return h(Popover, { content: text }, { default: () => text as string || '--' })
    }
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    customRender: ({ record }) => {
      return `${dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')}`
    },
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 200,
    customRender: ({ record }) => {
      return [
        h(
          Button,
          { type: 'link', size: 'small', onClick: () => { editRow(record) } },
          { default: () => '详情' }
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
  const { data } = await nfcPage(formState)
  buttonUpload.value = false
  formState.total = data.total
  dataSource.value = data.records
}
const reset = (): void => {
  formState.keyword = ''
  query()
}
const delRow = async (id: string): Promise<void> => {
  await deletenfc(id)
  query()
}
const visibleTitle = ref('新增巡更设备')
const editRow = (record: unknown): void => {
  visibleTitle.value = '编辑巡更设备'
  visible.value = true
  editorput.value = false
  Object.assign(addNfc, record)
}

const visible = ref<boolean>(false)
const addPlan = (): void => {
  visibleTitle.value = '新增巡更设备'
  Object.assign(addNfc, {
    id: '',
    deviceCode: '',
    nfcDimension: '',
    nfcLongitude: '',
    nfcCode: '',
    bluetoothCode: '',
    remarks: '',
  })
  visible.value = true
  editorput.value = true
}
const formRef = ref()
const editorput = ref<boolean>(true)
const handleOk = async (): Promise<void> => {
  await formRef.value.validateFields()
  if (!editorput.value) {
    await updatenfc(addNfc)
    message.success('修改成功')
  } else {
    await addnfc(addNfc)
    message.success('添加成功')
  }

  visible.value = false
  query()

  Object.assign(addNfc, {
    deviceCode: '',
    nfcDimension: '',
    nfcLongitude: '',
    nfcCode: '',
    bluetoothCode: '',
    remarks: '',
  })
}
const download = async (): Promise<void> => {
  const { data } = await downloadModule()
  const link = document.createElement('a')
  const blob = new Blob([data as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  link.style.display = 'none'
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', '模版.xlsx')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
onMounted(async () => {
  query()
})
const getPosition = async (): Promise<void> => {
  const { data } = await tenantinfo(getNowEnterprise()?.code)
  const center = data.lntAndLat.split(',').reverse()
  showMapModal({
    title: '获取经纬度',
    center: {
      lng: Number(center[0]),
      lat: Number(center[1])
    },
    modalConfirm: (data) => {
      addNfc.nfcLongitude = data.lat
      addNfc.nfcDimension = data.lng
    }
  })
}

const buttonUpload = ref<boolean>(false)
const uploadChange = (info: UploadChangeParam<UploadFile>): void => {
  buttonUpload.value = true
  if (info.file.status === 'done') {
    query()
  } else if (info.file.status === 'error') {
    message.error(info.file.response.message)
    buttonUpload.value = false
  }
}
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");

.mapContainer {
  width: 100%;
  height: 600px;
}
</style>
