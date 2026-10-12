<template>
  <div >
    <SubPanelTemplate title="当日值班人员" class="monitor">
      <div class="body">
        <DutyPersonList :arrive="personnelInfo.obj.arrive" :total="personnelInfo.obj.total" :list="personnelInfo.list" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警处理排名" class="alarm-event">
        <template #extra>
          <DateInlineForm v-model:modelValue="handleTime" @search="changeHandleTime"></DateInlineForm>
        </template>
      <div class="body" style="min-height: 250px;" v-show="AlarmHandlList.list.length > 0">
        <EventAlarmItem v-for="(item, index) in AlarmHandlList.list" :key="item.id" :sort="index + 1" :name="item.name"
          :linkRatio="item.chainRatio" :count="item.alarmNum" :ratio="item.ratio + '%'" />
      </div>
      <div class="body" style="min-height: 200px;" v-show="AlarmHandlList.list.length <= 0">
        <noData></noData>
      </div>
    </SubPanelTemplate>
  </div>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import DateInlineForm from '@/components/businessPanel/public/dateInlineForm.vue'
import EventAlarmItem from '@/components/businessPanel/public/eventAlarmItem.vue'
import DutyPersonList from '../public/dutyPersonList.vue'
import noData from '@/components/businessPanel/public/noData.vue'
import { ModelValueItf } from '../public/types'
import { alarmHandleTop } from "@/api/alarm"
import { AlarmAreaTop } from '@/api/models/alarm'
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue"
import { arrangeTodayStat } from '@/api/attendance'
import moment from 'moment'
import { useStateStore } from "@/pages/state/use-state-store"
interface AlarmHandlType {
  list: AlarmAreaTop[]
}
let timer: any = reactive(null)
const { globalState } = useStateStore();
let handleTime = ref<ModelValueItf>()
let AlarmHandlList = reactive<AlarmHandlType>({
  list: []
})
let personnelInfo = reactive({
  obj: {
    arrive: 0,
    total: 0
  },
  list: []
})
watch(() => globalState.business.currentAreaId, () => {
  clearInterval(timer)
  timer = setInterval(() => {
    init()
  }, (window as any).config.pageLoopRequestTime)
  init()
})
// 报警处理排名
function changeHandleTime() {
  getAlarmHandlTop()
}
async function getAlarmHandlTop() {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: handleTime.value.dateRange.join(','),
    type: handleTime.value.timeType,
  }
  AlarmHandlList.list = await alarmHandleTop(params)
}
const getDutyPersonnel = async () => {
  let res = await arrangeTodayStat()
  personnelInfo.obj.arrive = res.workCount
  personnelInfo.obj.total = res.totalCount
  personnelInfo.list = res.staffResultList.map(item=>{
    return {
      ...item,
      startWorkTime:moment(item.startWorkTime).format('DD日HH:mm'),
      endWorkTime:moment(item.endWorkTime).format('DD日HH:mm'),
    }
  })
}
function init() {
  getDutyPersonnel()
  getAlarmHandlTop()
}
onMounted(() => {
  getDutyPersonnel()
  timer = setInterval(() => {
    init()
  }, (window as any).config.pageLoopRequestTime)
})
onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<style lang="less" scoped>
.panel {
  padding: 8px;
  display: flex;
  flex-direction: column;
}

.chart {
  height: 140px;
  display: flex;
}

.monitor {
  .title {
    color: #fff;
  }

  .group {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    img {
      width: 160px;
      height: 90px;
      margin-top: 10px;
    }
  }
}

.alarm-event {
  .body {
    margin-top: 20px;
  }

  .footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}
</style>