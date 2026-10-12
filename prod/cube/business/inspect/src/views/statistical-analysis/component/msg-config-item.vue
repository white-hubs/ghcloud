<template>
  <div class="asset-maintenance-item">
    <div v-if="props.businessType===MsgConfigBusinessTypeEmum.TASK_LAPSE" class="top-add">
      <Button type="primary" @click="addForm">
        <template #icon>
          <PlusCircleOutlined />
        </template>
        添加
      </Button>
    </div>
    <div v-for="(formState,index) in formList" :key="index">
      <div style="display: flex;justify-content: space-between;">
        <Form :model="formState">
          <FormItem label="通知条件">
            <template v-if="props.businessType===MsgConfigBusinessTypeEmum.TASK_GENERATE">
              任务下发即提醒
            </template>
            <template v-if="props.businessType===MsgConfigBusinessTypeEmum.TASK_LAPSE_UNFINISHED">
              巡检任务且没有完成即通知
            </template>
            <template v-if="props.businessType===MsgConfigBusinessTypeEmum.TASK_LAPSE">
              <div class="check-item">
                <Checkbox v-model:checked="formState.condition[0].checked" />
                <div style="margin-left: 5px;">
                  距离任务失效时间还有
                  <InputNumber
                    v-model:value="formState.condition[0].value" :min="0" style="width: 70px;margin:0 12px"
                    size="small"
                  />
                  分钟提醒
                </div>
              </div>
            </template>
            <template v-if="props.businessType===MsgConfigBusinessTypeEmum.TASK_RECORD_ERROR">
              任务异常通知
            </template>
          </FormItem>
          <FormItem label="通知方式">
            <CheckboxGroup v-model:value="formState.msgConfig" :options="msgChannel" />
          </FormItem>
          <FormItem label="消息模版">
            <template v-if="props.businessType===MsgConfigBusinessTypeEmum.TASK_LAPSE">
              您负责的【巡检任务名称】巡检任务，任务将在【配置的通知条件（例：30分钟）】后失效，请及时接收任务进行巡检
            </template>
            <template v-if="props.businessType===MsgConfigBusinessTypeEmum.TASK_LAPSE_UNFINISHED">
              由【巡检任务责任人】负责的【巡检任务名称】没有完成且当前已经失效，请知悉
            </template>
            <template v-if="props.businessType===MsgConfigBusinessTypeEmum.TASK_RECORD_ERROR">
              由【任务执行人】执行的巡查任务，再巡查：【巡检对象】时发现了异常，请知悉
            </template>
          </FormItem>
          <FormItem v-if="props.businessType===MsgConfigBusinessTypeEmum.TASK_LAPSE_UNFINISHED || props.businessType===MsgConfigBusinessTypeEmum.TASK_RECORD_ERROR" label="通知人员">
            <div class="personnel-config">
              <div v-for="(item,i) in formState.noticeType" :key="item.name" class="person-item">
                <Select
                  v-model:value="item.name" size="middle" style="width: 200px; margin-right: 10px"
                  :options="inspectTypeData" placeholder="请选择巡检类型"
                />
                <OuaaPicker v-model:value="item.value" :type="OuaaEnum.USER" :multiple="true" />
                <Button
                  v-if="i===0" shape="circle" type="primary" style="margin-left: 10px;"
                  @click="addNoticeType(index)"
                >
                  <template #icon><plus-outlined /></template>
                </Button>
                <Button
                  v-else shape="circle" danger style="margin-left: 10px;"
                  @click="delNoticeType(index,i)"
                >
                  <template #icon><minus-outlined /></template>
                </Button>
              </div>
            </div>
          </FormItem>
        </Form>
        <Popconfirm
          v-if="props.businessType===MsgConfigBusinessTypeEmum.TASK_LAPSE&&index!==0" title="是否删除当前消息配置"
          ok-text="是" cancel-text="否" @confirm="delectForm(index)"
        >
          <Button style="align-self:flex-end" type="primary">
            删除
          </Button>
        </Popconfirm>
      </div>
      <Divider v-if="index!==formList.length-1" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlusCircleOutlined } from '@ant-design/icons-vue'
import { ref, watch, onMounted } from 'vue'
import OuaaPicker from '@/components/common/ouaa-picker/ouaa-picker.vue'
import { OuaaEnum, ouaaOptions } from '@/components/common/ouaa-picker/ouaa-picker'
import { MsgConfigBusinessTypeEmum, type MsgConfigFormState } from './msg-config.ts'
import { Popconfirm, message } from 'ant-design-vue'
import { inspectTypePage } from '@/api/inspection'
import { cubeMessageCenterService } from "@/api/service";
import type { MessageConfigInfo } from '@/api/asset-management/types'

const props = withDefaults(defineProps<{
  businessType: MsgConfigBusinessTypeEmum;
  config: MessageConfigInfo[];
}>(), {
})
const msgChannel = ref<{
    value: string;
    label: string;
  }[]>([])
const inspectTypeData =ref<{label:string;value:string}[]>([])
const initValue = (): MsgConfigFormState[] => {
  const condition = [{ name: '', value: '', checked: false }, { name: '', value: '', checked: false }]
  if (props.businessType === MsgConfigBusinessTypeEmum.TASK_GENERATE) {
    condition[0].name = 'GENERATE'
  } else if (props.businessType === MsgConfigBusinessTypeEmum.TASK_LAPSE) {
    condition[0].name = 'LAPSE'
  } else if (props.businessType === MsgConfigBusinessTypeEmum.TASK_LAPSE_UNFINISHED){
    condition[0].name = 'UNFINISHED'
  } else if (props.businessType === MsgConfigBusinessTypeEmum.TASK_RECORD_ERROR){
    condition[0].name = 'RECORD_ERROR'
  }
  return [{
    condition,
    msgConfig: [],
    noticeType: [{ name: null, value: [] }]
  }]
}
const formList = ref<MsgConfigFormState[]>(initValue())

const addNoticeType = (index: number): void => {
  const type = ouaaOptions.find(e => formList.value[index].noticeType.findIndex(ele => ele.name === e.value) === -1)?.value
  if (type) {
    formList.value[index].noticeType.push(
      { name: inspectTypeData.value[0].value, value:[]}
    )
  }
}

const delNoticeType = (index: number, i: number): void => {
  formList.value[index].noticeType.splice(i, 1)
}

const addForm = (): void => {
  formList.value.push(
    initValue()[0]
  )
}
const delectForm = (index: number): void => {
  if (index !== 0) {
    formList.value.splice(index, 1)
  } else {
    message.error('消息配置不能为空')
  }
}
// 该通知下的通知方式
const getReceive = async (): Promise<void> => {
  msgChannel.value = await cubeMessageCenterService.sceneNotificationMethod(props.businessType)
}
const getInspectType = async (): Promise<void> => {
   const res = await inspectTypePage({pageNumber:1,pageSize:100})
   inspectTypeData.value = res.data?.records?.map((item: { id: string; name: string; }) => {
    return {
      label: item.name,
      value: item.id
    }
   }) ?? []
}

watch(() => props.config, () => {
  const propsConfig = props.config ?? []

  const config = propsConfig.filter(e => {
    return e.sceneCode === props.businessType
  })

  formList.value = config.map(e => {
    const item = initValue()[0]
    // 通知条件
    if (e.value) {
      item.condition[0].value = e.value
      item.condition[0].checked = true
    } else {
      item.condition[0].value = 0
      item.condition[0].checked = false
    }

    // 通知方式
    item.msgConfig = e.noticeWays.map(element => {
      return element.noticeWay
    })
    // 通知人员
    item.noticeType = e.noticeObjs.map(item => {
      return JSON.parse(item.objInfo)
    })
    return item
  })
}, { deep: true })
onMounted(async () => {
 await getInspectType()
 await getReceive()
})
const getData = (): any => {
  return {
    businessType: props.businessType,
    data: formList.value
  }
}

defineExpose({
  getData
})
</script>

<style lang="less" scoped>
.check-item {
  display: flex;
  align-items: center;

  :deep(.ant-FormItem) {
    margin-bottom: 0 !important;
  }
}

.top-add {
  margin-bottom: 16px;
}

.personnel-config {
  display: inline-flex;
  align-items: top;
  flex-flow: column;

  .person-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 10px;
  }
}
</style>
