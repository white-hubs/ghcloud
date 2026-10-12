<template>
  <GLayout :title="action==='detail'?'清单详情':'编辑清单'" showfooter class="detail">
    <template #content-table>
      <Tabs v-model:activeKey="activeKey">
        <TabPane key="1" tab="基本信息">
          <div class="detai-content">
            <Form
              v-if="inventoryForm" ref="formRef" layout="horizontal" :rules="rules"
              :label-col="{style : {width:'120px'}}" :model="inventoryForm"
            >
              <div class="info-title">
                基本信息
              </div>
              <div class="item-info">
                <FormItem label="资产类别" name="typeId">
                  <TreeSelect v-if="action==='edit'" v-model:value="inventoryForm.typeId" placeholder="请选择" :tree-data="assetType" :field-names="{ label: 'name', value: 'id' }" @change="assetTypeChange"/>
                  <span v-else>{{ inventoryForm.typeName||'--' }}</span>
                </FormItem>
                <FormItem label="资产编码" name="serialNumber">
                  <Input v-if="action==='edit'" v-model:value="inventoryForm.serialNumber" :maxlength="200"/>
                  <span v-else>{{ inventoryForm.serialNumber||'--' }}</span>
                </FormItem>
                <FormItem label="资产名称" name="name">
                  <Input v-if="action==='edit'" v-model:value="inventoryForm.name" />
                  <span v-else>{{ inventoryForm.name||'--' }}</span>
                </FormItem>
                <FormItem label="财务编码" name="financeNumber">
                  <Input v-if="action==='edit'" v-model:value="inventoryForm.financeNumber" :maxlength="200"/>
                  <span v-else>{{ inventoryForm.financeNumber||'--' }}</span>
                </FormItem>
                <FormItem label="入库日期" name="startTime">
                  <DatePicker v-if="action==='edit'" v-model:value="inventoryForm.startTime" value-format="YYYY-MM-DD" />
                  <span v-else>{{ inventoryForm.startTime?dayjs(inventoryForm.startTime).format('YYYY-MM-DD'):'--' }}</span>
                </FormItem>
                <FormItem label="规格型号">
                  <Input v-if="action==='edit'" v-model:value="inventoryForm.norms" />
                  <span v-else>{{ inventoryForm.norms||'--' }}</span>
                </FormItem>
                <FormItem label="使用期限（月）" name="usageTime">
                  <InputNumber v-if="action==='edit'" v-model:value="inventoryForm.usageTime" />
                  <span v-else>{{ inventoryForm.usageTime||'--' }}</span>
                </FormItem>
                <FormItem label="计量单位">
                  <Input v-if="action==='edit'" v-model:value="inventoryForm.unit" />
                  <span v-else>{{ inventoryForm.unit||'--' }}</span>
                </FormItem>
                <FormItem label="数量">
                  <InputNumber v-if="action==='edit'" v-model:value="inventoryForm.number" />
                  <span v-else>{{ inventoryForm.number||'--' }}</span>
                </FormItem>
                <FormItem label="来源">
                  <Select v-if="action==='edit'" v-model:value="inventoryForm.sourceId" placeholder="请选择">
                    <SelectOption v-for="item in assetSourceOptions" :key="item.id" :value="item.id">{{ item.name }}</SelectOption>
                  </Select>
                  <span v-else>{{ assetSourceOptions.find(e=>e.id===inventoryForm?.sourceId)?.name||'--' }}</span>
                </FormItem>
                <FormItem label="原值">
                  <InputNumber
                    v-if="action==='edit'"
                    v-model:value.trim="inventoryForm.price" placeholder="请输入" :min="0"
                    :max="9999999999" allow-clear :precision="2"
                  />
                  <span v-else>{{ inventoryForm.price||'--' }}</span>
                </FormItem>
                <FormItem label="购入日期" name="purchaseDate">
                  <DatePicker v-if="action==='edit'" v-model:value="inventoryForm.purchaseDate" value-format="YYYY-MM-DD" />
                  <span v-else>{{ inventoryForm.purchaseDate }}</span>
                </FormItem>
                <FormItem label="管理员">
                  <template v-if="action==='detail'">{{ inventoryForm.adminName||'--' }}</template>
                  <template v-else>
                    <Button type="primary" shape="round" @click="userPickerRef.show()">选择人员</Button>
                    <UserPicker ref="userPickerRef" v-model:value="adminUser" @update:value="adminComfirm" />
                  </template>
                </FormItem>
                <FormItem label="维护部门">
                  <template v-if="action==='detail'">{{ inventoryForm.maintenanceDepName||'--' }}</template>
                  <template v-else>
                    <DeptTreeSelect v-model:value="inventoryForm.maintenanceDepId"></DeptTreeSelect>
                  </template>
                </FormItem>
                <FormItem label="模型编码">
                  <Input v-if="action==='edit'" v-model:value="inventoryForm.deviceNumber" @input="handleDisableBlankSpace"/>
                  <span v-else>{{ inventoryForm.deviceNumber||'--' }}</span>
                </FormItem>
                <FormItem label="区域">
                  <AreaList v-if="action==='edit'" v-model:value="inventoryForm.areaIds" />
                  <span v-else>{{ inventoryForm.area.map((e) => e.name).join('/') || '--' }}</span>
                </FormItem>
                <FormItem label="存放地点">
                  <Input v-if="action==='edit'" v-model:value="inventoryForm.storageLocation" />
                  <span v-else>{{ inventoryForm.storageLocation||'--' }}</span>
                </FormItem>
                <FormItem label="照片">
                  <div v-if="action==='detail'" style="display: flex;">
                    <img
                      v-for="(item, index) in inventoryForm.imgs as OSSFile[]" :key="index" :src="item.path" alt="avatar"
                      width="100"
                      height="100" style="margin-right: 10px;"
                    >
                    <span v-if="inventoryForm.imgs.length===0">--</span>
                  </div>
                  <FileUpload
                    v-else :sceneCode='GLOBAL_SCENE_CODE.propertyManagement' 
                    v-model:value="inventoryForm.imgs" 
                    :customText="' '"
                    accept="image/*"
                    button-text="上传照片"
                    :maxCount="5"
                    :multiple="true"
                  />
                </FormItem>
                <FormItem label="备注">
                  <Textarea
                    v-model:value="inventoryForm.remarks"
                    :readonly="action==='detail'"
                    :bordered="action==='edit'"
                    :maxlength="200"
                    :show-count="action==='edit'"
                    auto-size
                  />
                </FormItem>
                <FormItem label="详细地址">
                  <Textarea
                    v-model:value="inventoryForm.location"
                    :readonly="action==='detail'"
                    :bordered="action==='edit'"
                    :show-count="action==='edit'"
                  />
                </FormItem>
                <FormItem label="资产位置">
                  <div style="display: flex;">
                    <Input
                      style="width: 87%;"
                      :readonly="action==='detail'"
                      :bordered="action==='edit'"
                      v-model:value="inventoryForm.latAndLon"
                      disabled
                    />
                    <Button type="primary" @click="()=>{
                      if(inventoryForm){
                        const center =  inventoryForm.latAndLon.split(',')
                        showMapModal({
                          title:'添加地点',
                          address: inventoryForm.location,
                          center:{
                            lng:Number(center[0]),
                            lat:Number(center[1])
                          },
                          modalConfirm: (data)=>{
                            if(inventoryForm){
                              inventoryForm.latAndLon = `${data.lng},${data.lat}`
                              inventoryForm.location = data.address
                            }
                          }
                        })
                      }
                    }" v-if="action ==='edit'">获取位置</Button>
                  </div>
                </FormItem>
              </div>
              <div class="info-title">
                使用人信息
              </div>
              <div class="item-info">
                <FormItem label="使用部门">
                  <template v-if="action==='detail'">{{ inventoryForm.receiveDepName||'--' }}</template>
                  <DeptPicker v-model="inventoryForm.receiveDep" v-else/>
                </FormItem>
                <FormItem label="使用人">
                  <template v-if="action==='detail'">{{ inventoryForm.receiveUserName||'--' }}</template>
                  <template v-else>
                    <Button type="primary" shape="round" @click="usePersonPickerRef.show()">选择人员</Button>
                    <UserPicker ref="usePersonPickerRef" v-model:value="usePersonUser" @update:value="usePersonComfirm" />
                  </template>
                </FormItem>
                <FormItem label="联系方式">
                  <Input v-if="action==='edit'" v-model:value="inventoryForm.receiveUserPhone" />
                  <span v-else>{{ inventoryForm.receiveUserPhone||'--' }}</span>
                </FormItem>
              </div>
              <div class="info-title">
                维保信息
              </div>
              <div class="item-info">
                <FormItem label="供应商">
                  <Input v-if="action==='edit'" v-model:value="inventoryForm.supplier" />
                  <span v-else>{{ inventoryForm.supplier||'--' }}</span>
                </FormItem>
                <FormItem label="联系人">
                  <Input v-if="action==='edit'" v-model:value="inventoryForm.supplierUser" />
                  <span v-else>{{ inventoryForm.supplierUser||'--' }}</span>
                </FormItem>
                <FormItem label="联系方式">
                  <Input v-if="action==='edit'" v-model:value="inventoryForm.supplierPhone" />
                  <span v-else>{{ inventoryForm.supplierPhone||'--' }}</span>
                </FormItem>
                <FormItem label="维保期限（月）" name="maintenanceTime">
                  <InputNumber v-if="action==='edit'" v-model:value="inventoryForm.maintenanceTime" />
                  <span v-else>{{ inventoryForm.maintenanceTime||'--' }}</span>
                </FormItem>
                <FormItem label="维保说明">
                  <Textarea
                    v-if="action==='edit'||(action==='detail'&&inventoryForm.maintenanceRemarks)"
                    v-model:value="inventoryForm.maintenanceRemarks"
                    :readonly="action==='detail'"
                    :bordered="action==='edit'"
                    :maxlength="200"
                    :show-count="action==='edit'"
                    auto-size
                  />
                  <span v-else>--</span>
                </FormItem>
              </div>
              <div class="info-title">
                附件信息
              </div>
              <div class="item-info">
                <FormItem label="附件">
                  <FileUpload 
                    :sceneCode='GLOBAL_SCENE_CODE.propertyManagement' 
                    v-model:value="inventoryForm.file"
                    :readonly="action==='detail'" 
                    :customText="' '"
                    :maxCount="5"
                    :multiple="true"
                  />
                  <span v-if="action==='detail' && (!inventoryForm.file || !inventoryForm.file.length)">--</span>
                </FormItem>
              </div>
            </Form>
          </div>
        </TabPane>
        <TabPane v-if="action!=='edit'" key="2" tab="资产履历">
          <Form layout="inline" :model="formState">
            <FormItem label="处理日期">
              <DatePicker v-model:value="formState.handleTime" value-format="YYYY-MM-DD" />
            </FormItem>
            <FormItem label="处理人部门">
              <Select v-model:value="formState.departmentId" placeholder="请选择" style="width: 180px">
                <SelectOption v-for="item in deptOptions" :key="item.id" :value="item.id">{{ item.name }}</SelectOption>
              </Select>
            </FormItem>
            <FormItem label="处理方式">
              <Select v-model:value="formState.handleType" placeholder="请选择" style="width: 180px">
                <SelectOption v-for="item in handleTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</SelectOption>
              </Select>
            </FormItem>
            <FormItem>
              <Button type="primary" @click="queryForm">查询</Button>
            </FormItem>
            <FormItem>
              <Button type="primary" @click="reset"> 重置 </Button>
            </FormItem>
          </Form>
          <Table
            :columns="columns" :data-source="dataSource" :pagination="false"
            :scroll=" {x: 1000,y: 550}" size="small" bordered :loading="loading"
            style="margin-top: 10px;"
          />
          <Pagination
            v-model:current="pagination.pageNumber" v-model:pageSize="pagination.pageSize" show-size-changer
            :total="pagination.total" :default-current="1" :show-total="(total: number) => `共 ${total} 条数据`"
            style="margin-top: 10px;" @change="pageChange"
          />
        </TabPane>
      </Tabs>
    </template>
    <template #footer-page>
      <Button @click="back">返回</Button>
      <Button
        v-if="action==='edit'" type="primary" style="margin-left: 10px;" :loading="subLoading"
        @click="save"
      >
        保存
      </Button>
    </template>
  </GLayout>
</template>

<script setup lang="ts">
import {
  type DetailedDetail,
  detailedDetail,
  getAssemblyClassifyPage,
  detailedUpdate,
  type OSSFile,
  getPropertyHistoryList,
  getAssemblyClassifyTree
} from '@/api/asset-management/asset-management'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import { useMapModal } from '@ghcloud/generic-component'
import { deptList } from '@/api/ouaa/ouaa'
import GLayout from '@/components/common/g-layout.vue'
import { InputNumber,Input, message, Textarea, type TableColumnType, Popover, type FormInstance } from 'ant-design-vue'
import dayjs from 'dayjs'
import { onMounted, reactive, ref, h } from 'vue'
import { useRoute } from 'vue-router'
import { FileUpload } from '@ghcloud/cube-app-design'
import UserPicker from '@/components/common/user-picker.vue'
import DeptPicker from '@/components/common/dept-picker.vue'
import type { Rule } from 'ant-design-vue/es/form/interface'
import AreaList from '@/components/common/area-list.vue'
import type { ValueType } from 'ant-design-vue/es/vc-cascader/Cascader'
import { TreeSelect } from 'ant-design-vue'
import { DeptTreeSelect } from '@ghcloud/generic-component'
import { cubeAssetManagementService } from '@/api/service'

const { showMapModal } = useMapModal()
const { action, id } = useRoute().query as { action:string; id:string;}
const activeKey = ref('1')
const oldSerialNumber = ref('')
const inventoryForm = ref<DetailedDetail&{receiveDep:{id:string,name:string}[],receiveUserPhone:string}>()
const assetSourceOptions = ref<{id:string; name:string;}[]>([])
const assetType = ref<{id:string; name:string;}[]>([])
const formRef = ref<FormInstance>()
const rules: Record<string, Rule[]> = {
  typeId: [{ required: true, message: '请选择资产类别', trigger: 'change' }],
  serialNumber: [{ required: true, message: '请输入资产编码', trigger: 'blur' }],
  name: [{ required: true, message: '请选择资产名称', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择入库日期', trigger: 'change' }],
  usageTime: [{ required: true, message: '请输入使用期限（月）', trigger: 'change' }],
}
// 资产履历
const deptOptions = ref<{id:string; name:string;}[]>([])
const handleTypeOptions = [
  { label: '资产入库', value: 'DEPOSITORY' },
  { label: '资产派发', value: 'DISTRIBUTION' },
  { label: '资产调拨', value: 'OUTBOUND' },
  { label: '资产报废', value: 'WEED_OUT' }
]
const formState = reactive<{
  departmentId:string|undefined;
  handleTime:string;
  handleType:string|undefined;
}>({
  departmentId: undefined,
  handleTime: '',
  handleType: undefined
})
const loading = ref(false)
const dataSource = ref<unknown[]>([])
const pagination = ref({
  pageSize: 10,
  pageNumber: 1,
  total: 0
})

const getTableData = async () => {
  const params = {
    pageNumber: pagination.value.pageNumber,
    pageSize: pagination.value.pageSize,
    id,
    ...formState
  };
  loading.value = true;
  try {
    const res = await getPropertyHistoryList(params);
    if (res.data) {
      const { records, total } = res.data;
      dataSource.value = records;
      pagination.value.total = total;
    }
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
}
const queryForm = () => {
  pagination.value.pageNumber = 1
  getTableData()
}
const reset = () => {
  formState.departmentId = undefined;
  formState.handleType = undefined;
  formState.handleTime = '';
  queryForm()
}
const pageChange = (pageNumber: number, pageSize: number) => {
  pagination.value.pageNumber = pageNumber || 1;
  pagination.value.pageSize = pageSize;
  getTableData();
};

const columns: TableColumnType[] = [
  {
    title: '序号',
    width: 70,
    align: 'center',
    customRender: ({ index }) => `${index + 1}`
  },
  {
    title: '处理日期',
    dataIndex: 'handleTime',
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      text = text ? dayjs(text).format('YYYY-MM-DD') : '--'
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '处理方式',
    dataIndex: 'handleTypeName',
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '处理人',
    dataIndex: 'createByName',
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '处理内容',
    dataIndex: 'remarks',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  }
]

const adminUser = ref<{id:string; name:string;}[]>([])
const usePersonUser = ref<{id:string; name:string;}[]>([])

onMounted(() => {
  // 资产来源
  getAssemblyClassifyPage({ pageNumber: 1, pageSize: 1000, type: 'assetSource' }).then(res => {
    if (res.data) {
      assetSourceOptions.value = res.data.records as {id:string; name:string;}[]
    }
  })

  // 获取资产类别
  getAssemblyClassifyTree({ type: 'assetType' }).then(res => {
    if (res.data) {
      assetType.value = res.data as {id:string; name:string;}[]
    }
  })

  // 根据ID获取数据
  detailedDetail({ id }).then(res => {
    if (res.data) {
      if (res.data.purchaseDate) {
        res.data.purchaseDate = dayjs(res.data.purchaseDate).format('YYYY-MM-DD')
      }
      if (res.data.startTime) {
        res.data.startTime = dayjs(res.data.startTime).format('YYYY-MM-DD')
      }
      inventoryForm.value = { ...res.data,receiveDep:[] }
      oldSerialNumber.value = res.data.serialNumber

      // 区域回显
      inventoryForm.value.areaIds = inventoryForm.value.area.map(e => e.id)

      // 管理员回显
      if (inventoryForm.value.adminId) {
        adminUser.value = [{
          id: inventoryForm.value.adminId as unknown as string,
          name: inventoryForm.value.adminName
        }]
      }

      // 使用人回显
      if (inventoryForm.value.receiveUserId) {
        usePersonUser.value = [{
          id: inventoryForm.value.receiveUserId as unknown as string,
          name: inventoryForm.value.receiveUserName
        }]
      }
      if (inventoryForm.value.receiveDepId) {
        inventoryForm.value.receiveDep=[{
          id: inventoryForm.value.receiveDepId,
          name: inventoryForm.value.receiveDepName
        }]
      }
    }
  })

  if (action === 'detail') {
    // 部门select
    deptList().then(res => {
      if (res.data) {
        deptOptions.value = res.data as {id:string; name:string;}[]
      }
    })
    getTableData()
  }
})

// 管理员选择
const userPickerRef = ref()
const adminComfirm = (data: [{ name: string; id: string; }]) => {
  if (data.length) {
    inventoryForm.value!.adminName = data[0].name
    inventoryForm.value!.adminId = data[0].id
  }else{
    inventoryForm.value!.adminName = ''
    inventoryForm.value!.adminId = ''
  }
}

// 使用人选择
const usePersonPickerRef = ref()
const usePersonComfirm = (data: [{ name: string; id: string; }]) => {
  if (data.length) {
    inventoryForm.value!.receiveUserId = data[0].id
  }else{
    inventoryForm.value!.receiveUserId = ''
    inventoryForm.value!.receiveUserName = ''
  }
}

//资产类别选择回调
const assetTypeChange=(val:ValueType,selectedOptions:unknown[])=>{
  inventoryForm.value!.typeName = selectedOptions[0] as string
}

/** 模型编码禁用空格符号输入检查 */
//@ts-ignore
const handleDisableBlankSpace = (e) =>{
  //@ts-ignore
  const val = e.target?e.target.value:''
  if (val&&val.includes(' ')&&inventoryForm.value){
    inventoryForm.value.deviceNumber = val.replace(/\s/g,'');
  }
}

const back=()=>{
  window.history.back()
}

// 校验资产编码是否重复
const validateSerialNumber = async (newSerialNumber: string, originalSerialNumber: string, rowId: string | null): Promise<boolean> => {
  if (!newSerialNumber) {
    message.error('请输入资产编码');
    return false;
  }
  if (originalSerialNumber !== newSerialNumber) {
    const checkParams = { checkSerialNumberList: [{ key: rowId, value: newSerialNumber }] };
    try {
      const res = await cubeAssetManagementService.checkPropertyCode(checkParams);
      if (res && Array.isArray(res) && res.includes(newSerialNumber)) {
        message.error(`资产编码 ${newSerialNumber} 已存在，请重新输入`);
        return false;
      }
    } catch {
      message.error('校验资产编码时发生错误，请稍后重试');
      return false;
    }
  }
  return true;
};

// 保存
const subLoading = ref(false)
const save = () => {
  if (!inventoryForm.value || subLoading.value) {
    return
  }
  formRef.value?.validate().then(async () => {
    try {
      subLoading.value = true
      const isSerialNumberValid = await validateSerialNumber(inventoryForm.value?.serialNumber ?? '', oldSerialNumber.value, inventoryForm.value?.id?.toString() ?? '');
      if (!isSerialNumberValid) {
        subLoading.value = false;
        return;
      }
      const data = { ...inventoryForm.value }
      data.imgs = (data.imgs as OSSFile[]).map(e => {
        return e.id.toString()
      })
      data.file = (data.file as OSSFile[]).map(e => {
        return e.id.toString()
      })
      data.receiveDepId=data.receiveDep?.length?data.receiveDep[0].id:''
      data.receiveDepName=data.receiveDep?.length?data.receiveDep[0].name:''
      await detailedUpdate(data as DetailedDetail)
      message.success('操作成功')
      back()
    } catch (error) {
      subLoading.value = false
    } finally {
      setTimeout(() => {
        subLoading.value = false
      }, 500);
    }
  })
}

</script>
<style lang="less">
.detai-content {
  .templete-form-horizontal .templete-form-item-control-input-content {
    max-width: 300px !important;
    word-break: break-word;
    width: 100% !important;
  }

  .templete-form-item-label {
    width: 105px !important;
  }
}
</style>
<style lang="less" scoped>
:deep(.content-search){
  display: none;
}
:deep(.content-table) {
  overflow: overlay !important;
}
.asset-management-pagination{
  display: flex;
  justify-content: flex-end;
}

.avatar-uploader>.templete-upload {
  width: 128px;
  height: 128px;
}

.templete-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.templete-upload-select-picture-card .templete-upload-text {
  margin-top: 8px;
  color: #666;
}

.detai-content {
  padding: 0 16px;

  .item-info {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
  }

  .asset-management-form-item {
    width: 45%;
    margin-right: 40px;
    margin-bottom: 16px;
    .asset-management-picker,.asset-management-input-number{
      width: 100%;
    }
  }

  .info-title {
    width: 100%;
    height: auto !important;
    text-align: left;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 10px;
    color: rgba(0, 0, 0, .8509803921568627);
    font-family: PingFang SC-Medium;
  }
}
.gps-map {
  width: 100%;
  height: 400px;
  margin-top: 10px;
}
</style>
