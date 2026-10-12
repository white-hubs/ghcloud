<template>
  <GLayout title="资产盘点新增" showfooter class="detail">
    <template #content-table>
      <div class="detai-content">
        <Form ref="formRef" layout="horizontal" :label-col="{style : {width:'150px'}}" :model="inventoryForm"
          :rules="rules">
          <div class="info-title">
            基本信息
          </div>
          <div class="item-info">
            <FormItem label="盘点任务名称" name="taskName">
              <Input v-model:value="inventoryForm.taskName" placeholder="请输入" />
            </FormItem>
            <FormItem label="盘点负责人" name="dutyUserId">
              <Button type="primary" shape="round" @click="userPickerRef.show()">选择人员</Button>
              <UserPicker ref="userPickerRef" @comfirm="dutyUserComfirm"
                @del="inventoryForm.dutyUserName='';inventoryForm.dutyUserId=''" defaultValue/>
            </FormItem>
            <FormItem label="盘点方式" name="checkType">
              <Select v-model:value="inventoryForm.checkType" placeholder="请选择">
                <SelectOption v-for="item in checkTypeOptions" :key="item.label" :value="item.value">{{ item.label }}
                </SelectOption>
              </Select>
            </FormItem>
            <FormItem label="是否允许手动选择" name="chooseType">
              <Select v-model:value="inventoryForm.chooseType" placeholder="请选择">
                <SelectOption :value="1">是</SelectOption>
                <SelectOption :value="0">否</SelectOption>
              </Select>
            </FormItem>
            <FormItem label="预计完成时间">
              <DatePicker v-model:value="inventoryForm.estimateEndTime" value-format="YYYY-MM-DD" />
            </FormItem>
            <FormItem label="备注说明">
              <Textarea v-model:value="inventoryForm.remarks" show-count :maxlength="200" placeholder="请输入" />
            </FormItem>
          </div>
          <div class="info-title">
            盘点范围
          </div>
          <Alert message="通过以下条件筛选要盘点的资产，满足全部选择条件的资产将会被包含在盘点单中，如果不选任何条件将包含您权限内的全部资产。" type="error" />
          <div class="item-info" style="margin-top: 30px;">
            <FormItem label="资产类别">
              <Select v-model:value="inventoryForm.taskDataSource.typeId" placeholder="请选择" allow-clear multiple mode="multiple">
                <SelectOption v-for="item in assetType" :key="item.id" :value="item.id">{{ item.name }}</SelectOption>
              </Select>
            </FormItem>
            <FormItem label="使用部门">
              <Select v-model:value="inventoryForm.taskDataSource.receiveDepId" placeholder="请选择" allow-clear>
                <SelectOption v-for="item in deptOptions" :key="item.id" :value="item.id"
                  @click="inventoryForm.taskDataSource.receiveDepName=item.name">{{ item.name }}</SelectOption>
              </Select>
            </FormItem>
            <FormItem label="购入日期">
              <DatePicker v-model:value="inventoryForm.taskDataSource.purchaseDate" value-format="YYYY-MM-DD"
                allow-clear />
            </FormItem>
            <FormItem label="管理员">
              <Button type="primary" shape="round" @click="adminPickerRef.show()">选择人员</Button>
              <UserPicker ref="adminPickerRef" @comfirm="adminComfirm"
                @del="inventoryForm.taskDataSource.adminId='';inventoryForm.taskDataSource.adminName=''" />
            </FormItem>
            <FormItem label="资产状态">
              <Select v-model:value="inventoryForm.taskDataSource.status" placeholder="请选择" allow-clear>
                <SelectOption v-for="item in assetStatus" :key="item.label" :value="item.value">{{ item.label }}
                </SelectOption>
              </Select>
            </FormItem>
            <FormItem label="区域">
              <AreaList v-model:value="inventoryForm.taskDataSource.areaIds" />
            </FormItem>
          </div>
        </Form>
      </div>
    </template>
    <template #footer-page>
      <Button @click="back">返回</Button>
      <Button style="margin-left: 10px;" :loading="subLoading" type="primary" @click="save">
        保存
      </Button>
    </template>
  </GLayout>
</template>

<script setup lang="ts">
import UserPicker from '@/components/common/user-picker.vue'
import { checkPlanInsert, getAssemblyClassifyPage } from '@/api/asset-management/asset-management'
import { deptList } from '@/api/ouaa/ouaa'
import GLayout from '@/components/common/g-layout.vue'
import { Textarea, message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/lib/form'
import { onMounted, ref, shallowRef } from 'vue'
import { assetStatus } from '@/views/enum';
import AreaList from '@/components/common/area-list.vue'
import { Alert } from 'ant-design-vue'
const formRef = shallowRef<FormInstance>()

interface PropertyCheckTaskDataSourceParam {
  /**
   * 管理员id
   */
  adminId: string|undefined;
  adminName:string|undefined;
  /**
   * 区域id
   */
  areaIds: (string | number)[];
  areaName:string|undefined;
  /**
   * 购入时间
   */
  purchaseDate: string;
  /**
   * 使用部门
   */
  receiveDepId: string|undefined;
  receiveDepName:string|undefined;
  /**
   * 状态
   */
  status: string|undefined;
  /**
   * 资产类别id
   */
  typeId: string|undefined;
  typeName:string|undefined;
}

interface CheckPlan {
  /**
   * 盘点计划名称
   */
  taskName: string;
  /**
   * 盘点责任人id
   */
  dutyUserId: string;
  dutyUserName:string;
  /**
   * 盘点方式
   */
  checkType: string|undefined;
  /**
   * 是否允许手动选择
   */
  chooseType: number|undefined;
  /**
   * 预计完成时间
   */
  estimateEndTime: string;
  /**
   * 备注
   */
  remarks: string;
  /**
   * 数据过滤条件
   */
  taskDataSource: PropertyCheckTaskDataSourceParam;
}
const inventoryForm = ref<CheckPlan>({
  taskName: '',
  dutyUserId: '',
  dutyUserName: '',
  checkType: undefined,
  chooseType: undefined,
  estimateEndTime: '',
  remarks: '',
  taskDataSource: {
    adminId: '',
    adminName: '',
    areaIds: [],
    areaName: '',
    purchaseDate: '',
    receiveDepId: undefined,
    receiveDepName: '',
    status: undefined,
    typeId: undefined,
    typeName: ''
  }
})

// 管理员选择
const userPickerRef = ref()
const adminPickerRef = ref()
const dutyUserComfirm = (data: [{ name: string; id: string; }]) => {
  if(data.length){
    inventoryForm.value.dutyUserName = data[0].name
    inventoryForm.value.dutyUserId = data[0].id
  }else{
    inventoryForm.value.dutyUserName = ''
    inventoryForm.value.dutyUserId = ''
  }
  formRef.value?.clearValidate('dutyUserId')
}
const adminComfirm = (data: [{ name: string; id: string; }]) => {
  if(data.length){
    inventoryForm.value.taskDataSource.adminName = data[0].name
    inventoryForm.value.taskDataSource.adminId = data[0].id
  }else{
    inventoryForm.value.taskDataSource.adminName = ''
    inventoryForm.value.taskDataSource.adminId = ''
  }
}

const checkTypeOptions = [
  { label: '管理员盘点', value: 'ADMIN' },
  { label: '部门盘点', value: 'ORG' },
  { label: '负责人盘点', value: 'PERSON' }
]
const assetType = ref<{id:string; name:string;}[]>([])
const deptOptions = ref<{id:string; name:string;}[]>([])

onMounted(() => {
  // 获取资产类别
  getAssemblyClassifyPage({ pageSize: 1000, pageNumber: 1, type: 'assetType' }).then(res => {
    if (res.data) {
      assetType.value = res.data.records as {id:string; name:string;}[]
    }
  })

  // 部门select
  deptList().then(res => {
    if (res.data) {
      deptOptions.value = res.data as {id:string; name:string;}[]
    }
  })
})

const back=()=>{
  window.history.back()
}

// 保存
const rules: Record<string, Rule[]> = {
  taskName: [{ required: true, message: '请输入盘点任务名称', trigger: 'blur' }],
  dutyUserId: [{ required: true, message: '请选择盘点负责人', trigger: 'blur' }],
  checkType: [{ required: true, message: '请选择盘点方式', trigger: 'change' }],
  chooseType: [{ required: true, message: '请选择', trigger: 'change' }]
}
const subLoading = ref(false)
const save = async () => {
  if (!inventoryForm.value) {
    return
  }
  try {
    await formRef.value?.validateFields()
    subLoading.value = true
    const params=JSON.parse(JSON.stringify(inventoryForm.value))
    params.taskDataSource.typeName = assetType.value
    .filter(e=>params.taskDataSource.typeId?.includes(e.id))
    .map(e=>{return e.name})
    .join(',')
    params.taskDataSource.typeId=params.taskDataSource.typeId?(params.taskDataSource.typeId as unknown as string[]).join(','):''
    await checkPlanInsert(params)
    message.success('操作成功')
    back()
  } catch (error) {
    subLoading.value = false
  } finally {
    subLoading.value = false
  }
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
:deep(.content-search) {
  display: none;
}

:deep(.content-table) {
  overflow: overlay !important;
}

.asset-management-pagination {
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

    .asset-management-picker,
    .asset-management-input-number {
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
</style>
