<template>
  <div class="detai-content">
    <Form
      ref="formRef" layout="horizontal" :label-col="{style : {width:'150px'}}"
    >
      <div class="info-title">
        基本信息
      </div>
      <div class="item-info">
        <FormItem label="盘点任务名称" name="taskName">
          {{ formState?.taskName || '--' }}
        </FormItem>
        <FormItem label="盘点负责人" name="dutyUserId">
          {{ formState?.dutyUserId || '--' }}
        </FormItem>
        <FormItem label="盘点方式" name="checkType">
          {{ checkTypeOptions.find(e=>e.value===formState?.checkType)?.label }}
        </FormItem>
        <FormItem label="是否允许手动选择" name="chooseType">
          {{ formState?.chooseType===1?'是':'否' }}
        </FormItem>
        <FormItem label="预计完成时间">
          {{ formState?.estimateEndTime ?dayjs(formState.estimateEndTime).format('YYYY-MM-DD'):'--' }}
        </FormItem>
        <FormItem label="备注说明">
          {{ formState?.remarks || '--' }}
        </FormItem>
      </div>
      <div class="info-title">
        盘点范围
      </div>
      <Alert message="通过以下条件筛选要盘点的资产，满足全部选择条件的资产将会被包含在盘点单中，如果不选任何条件将包含您权限内的全部资产。" type="error" style="margin: 30px;"></Alert>
      <div class="item-info">
        <FormItem label="资产类别">
          {{ formState?.taskDataSource.typeName || '--' }}
        </FormItem>
        <FormItem label="使用部门">
          {{ formState?.taskDataSource.receiveDepName || '--' }}
        </FormItem>
        <FormItem label="购入日期">
          {{ formState?.taskDataSource.purchaseDate?dayjs(formState?.taskDataSource.purchaseDate).format('YYYY-MM-DD') : '--' }}
        </FormItem>
        <FormItem label="管理员">
          {{ formState?.taskDataSource.adminName || '--' }}
        </FormItem>
        <FormItem label="资产状态">
          {{ assetStatus.find(e=>e.value===formState?.taskDataSource.status)?.label || '--' }}
        </FormItem>
        <FormItem label="区域">
          {{ formState?.taskDataSource.areaName || '--' }}
        </FormItem>
      </div>
    </Form>
  </div>
</template>
<script setup lang="ts">
import { getCheckPlanDetail } from '@/api/asset-management/asset-management'
import { onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import { assetStatus } from '@/views/enum';
import { Alert } from 'ant-design-vue';
const props = withDefaults(defineProps<{
  id:string;
}>(), {})
interface DataSource{
  status:string;
  areaName:string;
  area:{id:string;name:string;}[];
  areaIds:string[];
  adminName:string;
  purchaseDate:string;
  receiveDepName:string;
  typeName:string;
}
interface CheckPlan{
  checkType:string;
  chooseType:number;
  taskDataSource:DataSource;
  dutyUserId:string;
  dutyUserName:string;
  estimateEndTime:string;
  id:string;
  propertyNumber:number;
  realityEndTime:string;
  remarks:string;
  status:string;
  taskName:string;
}
const formState = ref<CheckPlan>()

onMounted(async () => {
  const res = await getCheckPlanDetail({ id: props.id })
  const data = res.data as CheckPlan
  data.taskDataSource.areaName = data.taskDataSource.area.map(e => e.name).join('/')
  formState.value = data
})

const checkTypeOptions = [
  { label: '管理员盘点', value: 'ADMIN' },
  { label: '部门盘点', value: 'ORG' },
  { label: '负责人盘点', value: 'PERSON' }
]
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
</style>
