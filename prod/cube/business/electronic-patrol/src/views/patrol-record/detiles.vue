<template>
  <GLayout title="巡更记录-详情" :showfooter="true">
    <template #content-data>
      <div class="font-900 mt-10px">基本信息</div>
      <div class="pl-30px pr-30px">
        <Descriptions class="mt-15px">
          <DescriptionsItem label="任务名称">{{ pointInfo.taskName || '--' }}</DescriptionsItem>
          <DescriptionsItem label="巡更人员">{{ pointInfo.userName || '--' }}</DescriptionsItem>
          <DescriptionsItem label="协同人员">{{ pointInfo.assistNames || '--' }}</DescriptionsItem>
          <DescriptionsItem label="所属部门">{{ pointInfo.userDep || '--' }}</DescriptionsItem>
          <DescriptionsItem label="任务完成时间">
            {{
            pointInfo.completeDate==null?'--':dayjs(pointInfo.completeDate).format('YYYY-MM-DD HH:mm:ss') }}
          </DescriptionsItem>
          <DescriptionsItem label="巡更路线">{{ pointInfo.routeName || '--' }}</DescriptionsItem>
          <DescriptionsItem label="巡更点数">{{ pointInfo.patrolLocationNum || '--' }}</DescriptionsItem>
          <DescriptionsItem label="已巡点数">{{ pointInfo.completedNum || '--' }}</DescriptionsItem>
          <DescriptionsItem label="未巡点数">{{ pointInfo.undoneNum || '--' }}</DescriptionsItem>
        </Descriptions>
      </div>
      <div class="font-900 mt-15px">巡更明细</div>
      <div class="pl-30px pr-30px">
        <Tabs v-model:activeKey="tabsKey" @change="changeTabs">
          <TabPane v-for="(item) in pointInfo.executePeriod" :key="item" :tab="item">
            <Timeline class="mt-15px">
              <div class="patrol-details overflow-y-auto pt-20px">
                <TimelineItem v-for="item in tableList" :key="item.id"
                  :color="item.patrolResult!=='ABNORMAL'?'green':'red'">
                  <Descriptions :column="5">
                    <DescriptionsItem label="巡更点">{{ item.locationName || '--' }}</DescriptionsItem>
                    <DescriptionsItem label="所属区域">
                      {{ item.arae ? item.arae.map((res:any)=>res.name).join('/') : '--' }}
                    </DescriptionsItem>
                    <DescriptionsItem label="巡更时间">
                      {{ item.patrolDate===null?'--':
                      dayjs(item.patrolDate).format('YYYY-MM-DD HH:mm:ss') }}
                    </DescriptionsItem>
                    <DescriptionsItem label="巡更人员">{{ item.userName || '--' }}</DescriptionsItem>
                    <DescriptionsItem>
                      <div :style="item.patrolResult!=='ABNORMAL'?'color:green':'color:red'">
                        {{ item.patrolResult==='ABNORMAL'?'异常':'正常' }}
                      </div>
                    </DescriptionsItem>
                  </Descriptions>
                  <div>
                    <Descriptions :column="1">
                      <DescriptionsItem v-if="item.patrolResult==='ABNORMAL'" label="异常说明">{{ item.remark || '--' }}
                      </DescriptionsItem>
                      <DescriptionsItem v-if="item.files.length>0&&item.patrolResult==='ABNORMAL'">
                        <div v-for="file in item.files" :key="file.id" class="ml-5px overflow-hidden">
                          <Image :src="file.path" :width="100" :height="100" />
                        </div>
                      </DescriptionsItem>
                      <DescriptionsItem label="关联隐患">
                        <a v-if="item.hiddenId" @click="toyh(item.hiddenId)">隐患排查单</a>
                        <span v-else>--</span>
                      </DescriptionsItem>
                      <DescriptionsItem label="巡更图片">
                        <ImagePreviewGroup>
                            <Image  v-for="file in item.files" :key="file.id" :src="file.path" :width="100"/>
                        </ImagePreviewGroup>
                      </DescriptionsItem>
                    </Descriptions>
                  </div>
                </TimelineItem>
              </div>
            </Timeline>
          </TabPane>
        </Tabs>
      </div>
    </template>

    <template #footer-page>
      <div class="inline-block text-center">
        <Button @click="goback">返回</Button>
      </div>
    </template>
  </GLayout>
</template>
<script lang="ts">
import { getListTask, getoneTask } from '@/api/task-api'
import GLayout from '@/components/common/g-layout.vue'
import { TimelineItem, Image,ImagePreviewGroup } from 'ant-design-vue'
import dayjs from 'dayjs'
import { onMounted, reactive, ref } from 'vue'

import { useRoute } from 'vue-router'
</script>
<script setup lang="ts">

const useroute = useRoute()
// const userouter = useRouter()
const { id } = useroute.query
const tabsKey = ref('')
const pointInfo = reactive<any>({})
const tableList = ref<any>([])
const changeTabs = async (value: string) => {
  const { data: info } = await getListTask({
    taskId: id,
    executePeriod: value
  })

  tableList.value = info
}
onMounted(async () => {
  const { data } = await getoneTask(id)
  Object.assign(pointInfo, data)
  tabsKey.value = pointInfo.executePeriod[0]
  const { data: info } = await getListTask({
    taskId: id,
    executePeriod: pointInfo.executePeriod[0]
  })

  tableList.value = info
  
})
const goback = () => {
  history.go(-1)
}
const toyh = (id: string) => {
  history.pushState({}, '', `/portal/stream-engine-render/index?businessType=HIDDENDANGER&processInstanceId=${id}&currentTaskId=&status=ACTIVE&type=detail&title=隐患单`
  )
}
</script>
<style lang="less" scoped>
@import url('@/style/theme/color.less');

.patrol-details {
  height: calc(100vh - 500px);
}
</style>
