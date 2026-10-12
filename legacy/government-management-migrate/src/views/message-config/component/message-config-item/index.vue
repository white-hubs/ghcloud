<template>
  <div class="asset-maintenance-item">
    <div v-for="(formState,index) in formList" :key="index" class="form-item">
      <Form :model="formState">
        <FormItem label="通知条件">
          <div class="check-item">
            督办事项距超期
            <InputNumber v-model:value="formState.value" :min="0" style="width: 70px;margin:0 12px" size="small" />
            分钟时提醒
          </div>
        </FormItem>
        <FormItem label="通知方式">
          <CheckboxGroup v-model:value="formState.noticeWay" :options="msgOptions" v-if="msgOptions.length" />
          <span v-else>当前场景未配置可使用的通知方式</span>
        </FormItem>
        <FormItem label="通知内容">
          您有一条x x事项名称 已超时，事项当前完成进度为x x
        </FormItem>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlusCircleOutlined } from '@ant-design/icons-vue'
import { onMounted, ref, watch } from 'vue'
import { getNoticeCode } from '@/api/message'
import { OuaaEnum } from './types'
import { message } from 'ant-design-vue'
import { Button,Form,FormItem,InputNumber,CheckboxGroup,Popconfirm,Divider } from 'ant-design-vue'
import type { SceneConfigDTO } from '@/api/message/types'
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

const msgOptions=ref<{label:string,value:string}[]>([])
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
