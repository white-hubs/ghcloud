
<template>
  <GLayout :title="title" class="msg-config">
    <template #content-table>
      <Tabs v-model:activeKey="activeKey" type="card">
        <TabPane v-for="(item,i) in tabs" :key="i" :tab="item.title" force-render>
          <MsgConfigItem ref="msgConfigItems" :business-type="item.businessType" :config="config" :label="item.title" />
        </TabPane>
      </Tabs>
    </template>
    <template #footer-page>
      <Button :loading="subLoading" type="primary" @click="save">保存</Button>
    </template>
  </GLayout>
</template>

<script lang="ts" setup>
import GLayout from '@/components/common/gLayout.vue'
import MsgConfigItem from './component/message-config-item/index.vue'
import { Tabs, TabPane, Button } from 'ant-design-vue'
import { onMounted, ref } from 'vue'
import { getMessageConfigInfo, saveMessageConfig } from '@/api/message/index'
import { message } from 'ant-design-vue'
import { usePageName } from '@/hooks/usePageName'
import type { SceneConfigDTO } from '@/api/message/types'
interface MsgConfigItemComponent{
  getData:() => {
    businessType:string;
    data:SceneConfigDTO[];
  };
}
const tabs = [
  { businessType: 'FOCUS_WORK_WILL_OVERTIME_PUBLISHED_NOTIFY', title: '事项即将超时提醒' },
]
const {title}=usePageName()
const activeKey = ref(0)
const subLoading = ref(false)
const msgConfigItems = ref<MsgConfigItemComponent[]>([])
const save = async () => {
  const sceneConfigDTOS:SceneConfigDTO[]=[]
  msgConfigItems.value.forEach(element => {
    const itemData = element.getData().data
    sceneConfigDTOS.push(...itemData)
  });

  try {
    subLoading.value = true
    await saveMessageConfig({
      businessType: 'OFFICIAL_MANAGEMENT',
      sceneConfigDTOS: sceneConfigDTOS
    })
    message.success('操作成功')
  } catch (error) {
  } finally {
    setTimeout(() => {
      subLoading.value = false
    }, 500);
  }
}

const config = ref<SceneConfigDTO[]>([])
onMounted(async () => {
  const res=await getMessageConfigInfo({businessType:'OFFICIAL_MANAGEMENT'})
  if(res.data){
    config.value=res.data as SceneConfigDTO[]
  }
  // const res = await queryByBusinessType()
  // if (res.data?.conditions.length) {
  //   const data: unknown[] = []
  //   res.data.conditions.forEach(e => {
  //     data.push(...e)
  //   })
  //   config.value = data
  // }
})

</script>

<style lang="less" scoped>
:deep(.content-table) {
  overflow: overlay !important;
}
</style>
