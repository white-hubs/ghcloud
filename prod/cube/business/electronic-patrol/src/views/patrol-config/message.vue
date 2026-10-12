<!-- eslint-disable @typescript-eslint/no-unsafe-return -->
<template>
  <GLayout :title="pageTitle" :showfooter="true">
    <template #content-data>
      <Tabs v-model:activeKey="activeKey" hide-add type="card">
        <TabPane key="任务接收提醒" tab="任务接收提醒">
          <Button class="ml-30px" size="middle" @click="addtaskaccept">添加</Button>
          <div class="p-30px pt-0 overflow-auto h-600px">
            <template v-for="(item, index) in taskaccept" :key="item.id">
              <div class="w-70% p-5px mt-10px" style="border: 1px dotted #ccc; position: relative">
                <div
                  v-if="index !== 0" style="position: absolute; right: 3px; top: 0; cursor: pointer"
                  @click="deleteaccept(index)"
                >
                  <CloseOutlined />
                </div>
                <div>
                  通知条件：距离任务巡更开始时间还有
                  <InputNumber v-model:value="item.condition" :min="1" :max="999" />
                  分钟，仍未接收提醒
                </div>
                <div class="mt-15px">
                  通知方式：
                  <CheckboxGroup v-model:value="item.mode" name="checkboxgroup" :options="acceptNotice" />
                </div>
                <div class="mt-15px">
                  通知示例：{{
                    `您有一条【巡更任务名称】还有即将在【${item.condition}】分钟开始，请及时接收任务避免影响巡更进度`
                  }}
                </div>
              </div>
            </template>
          </div>
        </TabPane>
        <TabPane key="任务到期提醒" tab="任务到期提醒">
          <Button class="ml-30px" size="middle" @click="addtaskexpire">添加</Button>
          <div class="p-30px pt-0 overflow-auto h-600px">
            <template v-for="(item, index) in taskexpire" :key="item.id">
              <div class="w-70% p-5px mt-10px" style="border: 1px dotted #ccc; position: relative">
                <div
                  v-if="index !== 0" style="position: absolute; right: 3px; top: 0; cursor: pointer"
                  @click="deleteexpire(index)"
                >
                  <CloseOutlined />
                </div>
                <div>
                  通知条件：距离巡更截止时间
                  <InputNumber v-model:value="item.condition" :min="1" :max="999" />
                  分钟提醒
                </div>
                <div class="mt-15px">
                  通知方式：
                  <CheckboxGroup v-model:value="item.mode" name="checkboxgroup" :options="expireNotice" />
                </div>
                <div class="mt-15px">
                  通知示例：{{
                    `您有一条【巡更任务名称】还有【${item.condition}】分钟即将截止，请及时处理`
                  }}
                </div>
              </div>
            </template>
          </div>
        </TabPane>
      </Tabs>
    </template>
    <template #footer-page>
      <Button type="primary" @click="newsave">保存</Button>
    </template>
  </GLayout>
</template>
<script lang="ts">
import GLayout from '@/components/common/g-layout.vue'
import { onMounted, ref } from 'vue'
import { getnewmessage, addnewmessage } from '@/api/message-api'
import { CloseOutlined } from '@ant-design/icons-vue'
import { message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { cubeMessageCenterService } from '@/api/service'

</script>
<script setup lang="ts">
const { pageTitle } = usePageName()
const activeKey = ref('任务接收提醒')
const acceptNotice = ref<{
  label: string;
  value: string;
}[]>([])
const expireNotice = ref<{
  label: string;
  value: string;
}[]>([])
const taskaccept = ref<{
  id: number;
  condition: number;
  mode: string[];
}[]>([{
  id: 1,
  condition: 1,
  mode: [],
}])
const taskexpire = ref<{
  id: number;
  condition: number;
  mode: string[];
}[]>([{
  id: 1,
  condition: 1,
  mode: [],
}])
const addtaskaccept = (): void => {
  taskaccept.value.push({
    id: Math.random(),
    condition: 1,
    mode: [],
  })
}
const addtaskexpire = (): void => {
  taskexpire.value.push({
    id: Math.random(),
    condition: 1,
    mode: [],
  })
}
const deleteaccept = (index: number): void => {
  taskaccept.value.splice(index, 1)
}
const deleteexpire = (index: number): void => {
  taskexpire.value.splice(index, 1)
}

const newrecevice = () => {
  return taskaccept.value.map((res) => {
    return {
      label: '任务接收提醒',
      sceneCode: 'ELECTRON_TASK_RECEIVE',
      value: res.condition,
      noticeWays: res.mode.map((item) => {
        return {
          noticeWay: item,
        }
      }),
    }
  })
}
const getSceneNotificationMethod = async (code: string): Promise<{
  label: string;
  value: string;
}[]> => {
  return await cubeMessageCenterService.sceneNotificationMethod(code)
}
const newexpire = () => {
  return taskexpire.value.map((res) => {
    return {
      label: '任务到期提醒',
      sceneCode: 'ELECTRON_TASK_EXPIRE',
      value: res.condition,
      noticeWays: res.mode.map((item) => {
        return {
          noticeWay: item,
        }
      }),
    }
  })
}
const newsave = async (): Promise<void> => {
  await addnewmessage({
    businessType: 'ELECTRONIC_PATROL',
    sceneConfigDTOS: [...newrecevice(), ...newexpire()],
  })
  message.success('保存成功')
  newgetmessage('任务接收提醒')
  newgetmessage('任务到期提醒')
}

const newgetmessage = async (label: string): Promise<void> => {
  const { data } = await getnewmessage({
    businessType: 'ELECTRONIC_PATROL',
    label,
  })
  if (data.length === 0) return
  if (label === '任务接收提醒') {
    taskaccept.value = data.map((res: { value: any; noticeWays: { noticeWay: string; }[]; }) => {
      return {
        id: Math.random(),
        condition: res.value,
        mode: res.noticeWays.map((item: { noticeWay: string; }) => item.noticeWay),
      }
    })
  } else {
    taskexpire.value = data.map((res: { value: any; noticeWays: { noticeWay: string; }[]; }) => {
      return {
        id: Math.random(),
        condition: res.value,
        mode: res.noticeWays.map((item: { noticeWay: string; }) => item.noticeWay),
      }
    })
  }
}
onMounted(async () => {
  acceptNotice.value = await getSceneNotificationMethod('ELECTRON_TASK_RECEIVE')
  expireNotice.value = await getSceneNotificationMethod('ELECTRON_TASK_EXPIRE')
  newgetmessage('任务接收提醒')
  newgetmessage('任务到期提醒')
})
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");
</style>
