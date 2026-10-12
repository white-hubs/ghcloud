<template>
  <div class="asset-maintenance-item">
    <div class="top-add">
      <div v-if="props.businessType === 'INVENTORY_TASK'" class="INVENTORY_TASK">
        盘点任务下发后，提醒责任人
      </div>
      <div v-else>
        <Button type="primary" @click="addForm">
          <template #icon>
            <PlusCircleOutlined />
          </template>
          添加
        </Button>
      </div>
    </div>
    <div v-for="(formState,index) in formList" :key="index" class="form-item">
      <Form :model="formState">
        <FormItem label="通知条件">
            <div class="check-item" v-if="props.businessType==='MAINTENANCE_OVERDUE_ABOUT'">
              距离维保到期还有
              <InputNumber v-model:value="formState.value" :min="0" style="width: 70px;margin:0 12px" size="small" />
              天提醒
            </div>

            <div class="check-item" v-else-if="props.businessType==='MAINTENANCE_OVERDUE'">
              维保期限已过
              <InputNumber v-model:value="formState.value" :min="0" style="width: 70px;margin:0 12px"
                size="small" />
              天提醒
            </div>

            <div class="check-item" v-else-if="props.businessType==='OPERATE_OVERDUE_ABOUT'">
              距离使用期限到期还有
              <InputNumber v-model:value="formState.value" :min="0" style="width: 70px;margin:0 12px" size="small" />
              天提醒
            </div>

            <div class="check-item" v-else-if="props.businessType==='OPERATE_OVERDUE'">
              使用期限已过
              <InputNumber v-model:value="formState.value" :min="0" style="width: 70px;margin:0 12px"
                size="small" />
              天提醒
            </div>

            <div class="check-item" v-else-if="props.businessType==='CONSUMABLE_LOWER'">
              耗材库存低于下限
            </div>

            <div class="check-item" v-else-if="props.businessType==='CONSUMABLE_UPPER'">
              耗材库存低于上限
            </div>

            <div class="check-item" v-else>
              任务下发即提醒
            </div>

        </FormItem>
        <FormItem label="通知方式">
          <CheckboxGroup v-model:value="formState.noticeWay" :options="msgOptions" v-if="msgOptions.length"/>
          <span v-else>当前场景未配置可使用的通知方式</span>
        </FormItem>
        <FormItem label="通知人员" v-show="props.businessType !== 'INVENTORY_TASK'">
          <div v-for="item,i in formState.noticeUser" :key="item.name" class="person-item">
            <Select v-model:value="item.name" size="middle" style="width: 200px; margin-right: 10px"
              :options="ouaaOptions" placeholder="请选择" @change="item.value=[]" />
            <OuaaPicker v-model:value="item.value" :type="item.name" :multiple="true" />
            <Button v-if="i===0" shape="circle" type="primary" style="margin-left: 10px;" @click="addNoticeType(index)">
              <template #icon><plus-outlined /></template>
            </Button>
            <Button v-else shape="circle" danger style="margin-left: 10px;" @click="delNoticeType(index,i)">
              <template #icon><minus-outlined /></template>
            </Button>
          </div>
        </FormItem>
        <FormItem label="消息模板" v-show="props.businessType === 'INVENTORY_TASK'">
          您收到【盘点任务名称】【耗材/资产】盘点任务，请及时盘点并提交盘点结果
        </FormItem>
      </Form>
      <Popconfirm title="确定要删除该项？" @confirm="del(index)">
        <Button danger class="del-btn" v-show="props.businessType!=='INVENTORY_TASK'">删除</Button>
      </Popconfirm>
      <Divider v-if="index!==formList.length-1" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlusCircleOutlined } from '@ant-design/icons-vue'
import { onMounted, ref, watch } from 'vue'
import { OuaaEnum, ouaaOptions } from '@/components/common/ouaa-picker/ouaa-picker'
import { message } from 'ant-design-vue'
import type { SceneConfigDTO } from '@/api/asset-management/types'
import type { CheckboxValueType } from 'ant-design-vue/es/checkbox/interface'
import { cubeMessageCenterService } from "@/api/service";

const props = withDefaults(defineProps<{
  businessType:string;
  config:SceneConfigDTO[];
  label:string;
}>(), {
})

const formList = ref<(SceneConfigDTO & {
  noticeWay:CheckboxValueType[],
  noticeUser:{name:OuaaEnum,value:{ id: string; name: string; }[]}[]
})[]>([])

const addNoticeType = (index:number) => {
  const type = ouaaOptions.find(e => formList.value[index].noticeUser.findIndex(ele => ele.name === e.value) === -1)?.value
  if (type) {
    formList.value[index].noticeUser.push(
      { name: type, value: [] }
    )
  }
}

const delNoticeType = (index:number, i:number) => {
  formList.value[index].noticeUser.splice(i, 1)
}

const initValue=()=>{
  return {
    label:props.label,
    sceneCode:props.businessType,
    noticeObjs:[],
    noticeWays:[],
    noticeWay:[],
    value:0,
    noticeUser:[
        {
          name: OuaaEnum.USER,
          value:[]
        }
    ]
  }
}

const addForm = () => {
  formList.value.push(initValue())
}
const del = (index:number) => {
  if (formList.value.length <= 1) {
    message.warning('至少保留一项')
    return
  }
  formList.value.splice(index, 1)
}

watch(() => props.config, () => {
  
  formList.value = props.config.filter(e => {return e.sceneCode === props.businessType && e.label}).map(e=>{
    const noticeUser= e.noticeObjs.map(e=>{
      return {name:e.objType as OuaaEnum,value:JSON.parse(e.objInfo)}
    })
    return {
      ...e,
      label:props.label,
      noticeWay:e.noticeWays.map(e=>e.noticeWay),
      noticeUser:e.noticeObjs.length?noticeUser:[{name: OuaaEnum.USER,value:[]}]
    }
  })

  // 初始化
  if(formList.value.length===0){
    formList.value.push(initValue())
  }

}, { deep: true })

const msgOptions=ref<{label:string;value:string}[]>([])
onMounted(async ()=>{
  msgOptions.value = await cubeMessageCenterService.sceneNotificationMethod(props.businessType)
})

const getData = () => {
  return {
    businessType: props.businessType,
    data: formList.value.map(e=>{
      return {
        label:e.label,
        sceneCode:props.businessType,
        noticeObjs:e.noticeUser.filter(ele=>ele.value.length).map(ele=>{
            return {
              objType:ele.name,
              objId:ele.value.map(e=>e.id).join(','),
              objInfo:JSON.stringify(ele.value)
            }
        }),
        noticeWays:e.noticeWay.map(ele=>{return {noticeWay:ele}}),
        value:e.value
      }
    })
  }
}

defineExpose({
  getData
})
</script>

<style lang="less" scoped>
.check-item {
  display: inline-flex;
  align-items: center;
  margin-right: 30px;

  :deep(.ant-FormItem) {
    margin-bottom: 0 !important;
  }
}

.top-add {
  margin-bottom: 16px;

  .INVENTORY_TASK {
    color: #F59A23;
  }
}

.person-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
}

.form-item {
  position: relative;

  .del-btn {
    position: absolute;
    bottom: 10px;
    right: 0;
  }
}
</style>
