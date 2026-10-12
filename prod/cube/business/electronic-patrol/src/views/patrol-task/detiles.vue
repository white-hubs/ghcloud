<!-- eslint-disable no-console -->
<template>
  <GLayout title="巡更任务-详情" :showfooter="true">
    <template #content-data>
      <div class="pl-30px pr-30px">
        <div class="w-60% flex justify-between mt-15px">
          <div>任务名称：{{ taskInfo.taskName }}</div>
          <div>任务时间:{{ dayjs(taskInfo.startDate).format("YYYY-MM-DD") }}</div>
          <div>巡更时间:{{ taskInfo.executeData }}</div>
          <!-- <div>巡更时间段:{{ taskInfo.executePeriod.join(",") }}</div> -->
        </div>
        <div class="label-text">协同人:{{ taskInfo.assistNames }}</div>
        <div class="label-text">巡更人:{{ taskInfo.userName }}</div>

        <div class="mt-15px">
          <div>巡更明细：</div>
          <Tabs v-model:activeKey="tabsKey" @change="changeTabs">
            <TabPane v-for="(item) in taskInfo.executePeriod" :key="item" :tab="item">
              <Table
                class="mt-15px" :columns="columns" :data-source="tableList" :pagination="false"
                :scroll="{
                  y: scrollY,
                }"
              />
            </TabPane>
          </Tabs>
        </div>
      </div>
    </template>

    <template #footer-page>
      <div class="inline-block text-center">
        <Button class="mr-15px" @click="goback">返回</Button>
        <Button v-if="status === 'TO_BE_RECEIVED'" type="primary" @click="accept">
          接收
        </Button>
      </div>
    </template>
    <Modal v-model:visible="visible" title="巡更详情" width="900px" @ok="visible = false">
      <div>
        <div class="mt- -15px">巡更点：{{ patrolInfo.locationName }}</div>
        <div class="mt-15px">
          巡更结果：<span :class="patrolInfo.patrolResult === 'ABNORMAL' ? 'color-red' : ''">{{
            `${
              patrolInfo.patrolResult === "NORMAL"
                ? "正常"
                : patrolInfo.patrolResult === "ABNORMAL"
                  ? "异常"
                  : "--"
            }`
          }}</span>
        </div>
        <div class="mt-15px">说明:{{ patrolInfo.remark }}</div>
        <div class="mt-15px">
          图片:
          <div class="flex flex-wrap">
            <div v-for="item in patrolInfo.files" :key="item.path" class="ml-5px overflow-hidden">
              <Image :src="item.path" :width="100" :height="100" />
            </div>
          </div>
        </div>
        <a v-if="patrolInfo.hiddenId" class="mt-15px" @click="toyh">关联隐患</a>
      </div>
    </Modal>
  </GLayout>
</template>
<script lang="ts">
import { getoneTask, acceptTask, getListTask } from '@/api/task-api'
import GLayout from '@/components/common/g-layout.vue'
import { Button, type TableColumnType, Image } from 'ant-design-vue'
import dayjs from 'dayjs'
import { h, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
</script>
<script setup lang="ts">
const useroute = useRoute()
const { id, status } = useroute.query
const userouter = useRouter()
const scrollY = ref(450)
const columns: TableColumnType[] = [
  {
    title: '序号',
    width: 70,
    customRender: ({ index }) => {
      return index + 1
    },
  },
  {
    title: '巡更点',
    dataIndex: 'locationName',
    key: 'locationName',
  },
  {
    title: '所属区域',
    dataIndex: 'arae',
    key: 'arae',
    customRender: ({ record }) => {
      return `${record.arae.map((res: { name: string; }) => res.name).join('/')}`
    },
  },
  {
    title: '巡更人员',
    dataIndex: 'userName',
    key: 'userName',
    customRender: ({ record }) => {
      return `${record.userName === '' ? '--' : record.userName}`
    },
  },
  {
    title: '巡更时间',
    dataIndex: 'patrolDate',
    key: 'patrolDate',
    customRender: ({ record }) => {
      return `${
        record.patrolDate == null
          ? '--'
          : dayjs(record.patrolDate).format('YYYY-MM-DD HH:mm:ss')
      }`
    },
  },
  {
    title: '巡更结果',
    dataIndex: 'patrolResult',
    key: 'patrolResult',
    customRender: ({ record }) => {
      return h(
        'div',
        {
          style: record.patrolResult === 'ABNORMAL' ? 'color:red' : '',
        },
        {
          default: () =>
            `${
              record.patrolResult === 'NORMAL'
                ? '正常'
                : record.patrolResult === 'ABNORMAL'
                  ? '异常'
                  : '--'
            }`,
        }
      )
    },
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    customRender: ({ record }) => {
      return [
        h(
          Button,
          { type: 'link', size: 'small', onClick: () => { editRow(record) } },
          { default: () => '详情' }
        ),
      ]
    },
  },
]
const toyh = () => {
  history.pushState(
    history.state,
    '',
    `/portal/stream-engine-render/index?businessType=HIDDENDANGER&processInstanceId=${patrolInfo.hiddenId}&currentTaskId=&status=ACTIVE&type=detail&title=隐患单`

  )
}
const visible = ref<boolean>(false)
const goback = () => {
  history.back()
}
const accept = async () => {
  await acceptTask(id)
  userouter.go(-1)
}
const taskInfo = reactive<{
  taskName: string;
  userName: string;
  startDate: number;
  executeData: string;
  assistNames: string;
  executePeriod: string[];
  data: { id: string; }[];
}>({
  taskName: '',
  userName: '',
  startDate: 0,
  executeData: '',
  assistNames: '',
  data: [],
  executePeriod: [],
})
const tabsKey = ref('')
const tableList = ref([])
const changeTabs = async (value: string) => {
  const { data: info } = await getListTask({
    taskId: id,
    executePeriod: value
  })

  tableList.value = info
}
const checkCurrentTime = (data: string[]): string => {
  const now = new Date()
  const currentTime = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes()

  for (let i = 0; i < data.length; i++) {
    const [start, end] = data[i].split('-')
    if (currentTime >= start && currentTime < end) {
      return data[i]
    }
  }
  return data[0]
}
const getScrollY = (): void => {
  const ele = document.getElementById('appContainer')
  const height = ele?.clientHeight
  if (height) {
    scrollY.value = height - 400
  }
}
window.onresize = () => {
  getScrollY()
}
onMounted(async () => {
  getScrollY()
  const { data } = await getoneTask(id)
  Object.assign(taskInfo, data)
  tabsKey.value = checkCurrentTime(taskInfo.executePeriod)
  changeTabs(tabsKey.value)
  tabsKey.value = taskInfo.executePeriod[0]
  const { data: info } = await getListTask({
    taskId: id,
    executePeriod: tabsKey.value

  })
  tableList.value = info
})
const patrolInfo = reactive<{
  locationName: string;
  patrolResult: string;
  remark: string;
  hiddenId: string;
  files: { path: string; }[];
}>({
  locationName: '',
  patrolResult: '',
  remark: '',
  files: [],
  hiddenId: '',
})
const editRow = (record: string) => {
  visible.value = true
  Object.assign(patrolInfo, record)
}
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");

.label-text {
  margin-top: 10px;
}
</style>
