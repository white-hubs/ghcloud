<template>
  <GLayout :title="pageTitle" class="msg-config">
    <template #content-table>
      <Tabs v-model:activeKey="activeKey" type="card">
        <TabPane v-for="(item,i) in tabs" :key="i" :tab="item.title" force-render>
          <MsgConfigItem ref="msgConfigItems" :business-type="item.businessType" :config="config" />
        </TabPane>
      </Tabs>
    </template>
    <template #footer-page>
      <Button :loading="subLoading" type="primary" @click="save">保存</Button>
    </template>
  </GLayout>
</template>

<script lang="ts" setup>
import GLayout from '@/components/common/g-layout.vue'
import MsgConfigItem from './component/msg-config-item.vue'
import { onMounted, ref } from 'vue'
import { MsgConfigBusinessTypeEmum, msgOptions, type MsgConfigFormState } from './component/msg-config'
import type { ValueType } from 'ant-design-vue/es/input-number/src/utils/MiniDecimal'
import { message } from 'ant-design-vue'
import type { MsgConfig, MessageConfigInfo } from '@/api/asset-management/types'
import { addConfig, getConfigInfo } from '@/api/asset-management/asset-management'
import { cubeMessageCenterService } from "@/api/service";
import { usePageName } from '@ghcloud/cube-utils'
interface MsgConfigItemComponent {
  getData: () => {
    businessType: MsgConfigBusinessTypeEmum;
    data: MsgConfigFormState[];
  };
}
const { pageTitle } = usePageName()
const tabs = [
  // { businessType: MsgConfigBusinessTypeEmum.TASK_GENERATE, title: '巡检任务' },
  { businessType: MsgConfigBusinessTypeEmum.TASK_LAPSE, title: '任务即将失效' },
  { businessType: MsgConfigBusinessTypeEmum.TASK_LAPSE_UNFINISHED, title: '任务失效未完成' },
  { businessType: MsgConfigBusinessTypeEmum.TASK_RECORD_ERROR, title: '任务异常' }
]
const activeKey = ref(0)
const subLoading = ref(false)
const msgConfigItems = ref<MsgConfigItemComponent[]>([])
const save = async (): Promise<void> => {
  const data: MsgConfig[] = []
  msgConfigItems.value.forEach((element, i) => {
    const itemData = element.getData()
    const params = itemData.data.map(e => {
      // 通知条件
      const condition: { name: string; value: ValueType; }[] = []

      let msgTmpContent = ''
      if (MsgConfigBusinessTypeEmum.TASK_GENERATE === itemData.businessType) {
        msgTmpContent = '您收到${taskName}巡检任务，任务将在${content}失效，请及时接收任务进行巡检'
      } else if (MsgConfigBusinessTypeEmum.TASK_LAPSE === itemData.businessType) {
        msgTmpContent = '您负责的${taskName}巡检任务，任务将在${content}分钟后失效，请及时接收任务进行巡检'
      } else if (MsgConfigBusinessTypeEmum.TASK_LAPSE_UNFINISHED === itemData.businessType) {
        msgTmpContent = '由${content}负责的${taskName}没有完成且当前已经失效，请知悉'
      } else if (MsgConfigBusinessTypeEmum.TASK_RECORD_ERROR === itemData.businessType) {
        msgTmpContent = '由${executor}执行的巡查任务，再巡查：${targetName}时发现了异常，请知悉'
      }
      // 通知方式
      const msgConfig = [{
        satMsgDefineCode: itemData.businessType,
        msgTmpContent,
        satMsgChannelConfigModifyParams: msgOptions.filter(option => e.msgConfig.includes(option.value)).map(item => {
          return {
            channelType: item.value === 'CHANNEL_SITE_APP' ? 'CHANNEL_SITE' : item.value,
            terminal: item?.terminal ?? '',
            terminalName: ''
          }
        })
      }]
      if (MsgConfigBusinessTypeEmum.TASK_GENERATE === itemData.businessType) {
        msgConfig[0].satMsgChannelConfigModifyParams.length > 0 && condition.push({ name: 'GENERATE', value: '' })
      } else if (MsgConfigBusinessTypeEmum.TASK_LAPSE_UNFINISHED === itemData.businessType) {
        msgConfig[0].satMsgChannelConfigModifyParams.length > 0 && condition.push({ name: 'UNFINISHED', value: '' })
      } else if (MsgConfigBusinessTypeEmum.TASK_LAPSE === itemData.businessType) {
        e.condition.forEach(ele => {
          if (ele.checked) {
            condition.push({ name: ele.name, value: ele.value })
          }
        })
      } else if (MsgConfigBusinessTypeEmum.TASK_RECORD_ERROR === itemData.businessType) {
        msgConfig[0].satMsgChannelConfigModifyParams.length > 0 && condition.push({ name: 'RECORD_ERROR', value: '' })
      }
      const noticeObjs: { objType: string;objId: string;objInfo: string; }[] = []
      e.noticeType.forEach((item: any) => {
        noticeObjs.push({
          objId: item.value ? item.value.map((e: { id: string; }) => e.id).join() : '{}',
          objType:  item.name,
          objInfo: JSON.stringify(item)
        })
      })

      return {
        label: tabs.filter(item => item.businessType === itemData.businessType)[0].title,
        value: e.condition[0].checked ? e.condition[0].value : 0,
        sceneCode: itemData.businessType,
        // noticeType: e.noticeType,
        noticeWays: e.msgConfig.map(item => { return { noticeWay: item } }),
        noticeObjs
      }
    })
    params.forEach((item) => {
      data.push(item)
    })
  })
  
  try {
    if (data[1].noticeObjs?.every(item=>item.objType)) {
      subLoading.value = true
      await addConfig({
        businessType: 'INSPECTION',
        sceneConfigDTOS: data
      })
      const res = await getConfigInfo('INSPECTION')
      config.value = res.data ?? []
      message.success('消息配置保存成功')
    }else{
      message.warning('请选择巡检类型')
    }
  } catch (error) {
    message.error('消息配置保存失败')
  } finally {
    setTimeout(() => {
      subLoading.value = false
    }, 500)
  }
}

const config = ref<MessageConfigInfo[]>([])
onMounted(async () => {
  const res = await getConfigInfo('INSPECTION')
  const channels = await cubeMessageCenterService.satMsgChannels()
  const noticeWays = channels.map(item => { return { noticeWay: item.channelCode, templateId: null } })
  if (res.data?.length === 0) {
    config.value = [
      {
        label: '任务即将失效',
        sceneCode: 'TASK_LAPSE',
        value: 0,
        noticeWays: noticeWays,
        noticeObjs: [
          {
            objType: 'USER',
            objId: '',
            objInfo: '{}'
          }
        ]
      },
      {
        label: '任务失效未完成',
        sceneCode: 'TASK_LAPSE_UNFINISHED',
        value: 0,
        noticeWays: noticeWays,
        noticeObjs: [
          {
            objType: 'USER',
            objId: '',
            objInfo: '{}'
          }]
      },
      {
        label: '任务异常',
        sceneCode: 'TASK_RECORD_ERROR',
        value: 0,
        noticeWays: noticeWays,
        noticeObjs: [
          {
            objType: 'USER',
            objId: '',
            objInfo: '{}'
          }]
      }
    ]
  } else {
    config.value = res.data ?? []
  }
})

</script>

<style lang="less" scoped>
:deep(.content-table) {
  overflow: overlay !important;
}
</style>
