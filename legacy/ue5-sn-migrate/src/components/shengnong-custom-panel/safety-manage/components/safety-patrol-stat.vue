<template>
  <div class="safety-patrol-stat">
    <SubPanelTemplate title="安全巡更统计" image="xj.png" class="visiting-data inspectCard">
      <template #extra>
        <DateInlineForm v-model:modelValue="state.safetyPatrolTime" @search="changePatrolTabTime" menuPage="safetyManage"/>
      </template>
      <NumberStatistics :data="state.safetyPatrolData" skin="row-cell" @click="handleClickItem" />
      <div>
        <div class="inspectTab">
          <a-tabs @change="handleChange" v-model:activeKey="state.activeKey">
            <a-tab-pane key="" tab="巡更数"></a-tab-pane>
            <a-tab-pane key="errorInspectionNum" tab="巡更异常数"></a-tab-pane>
          </a-tabs>
        </div>
        <div class="more" @click="handleMore">查看更多></div>
        <div class="riskList" v-if="state.patrolRankList.length !== 0">
          <EventAlarmItem style="cursor: pointer" @click="clickItem(item)" v-for="(item, index) in state.patrolRankList"
            :width="item.width" :sort="item.sort" :linkRatio="item.ratio" :ratio="item.ratio" :count="item.count"
            :name="item.name" />
        </div>
        <div v-else>
          <noData />
        </div>
      </div>
      <AlarmStatisticsModal @close="state.showMoreModal = false" :modalTitle="moreTitle"
        :showModal="state.showMoreModal" :fieldNames="{
           name:'marketName',
           value:'taskNum',
           chainRatio:'ratio'
        }" :parameter="state.safetyPatrolTime" :getDataFunc="getPatrolRankApi">
      </AlarmStatisticsModal>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang='js'>
import { reactive, toRefs, onMounted, computed } from 'vue';
import SubPanelTemplate from "../../common/snPanelTemplate.vue";
import DateInlineForm from "../../common/dateInlineForm.vue";
import NumberStatistics from "../../common/number-statistics.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import EventAlarmItem from "../../common/snEventItem.vue";
import { safetyPatrol, getSafetyPatrolRank } from '@/api/shennong/compre';
import { getallNumber, filterMarket } from "@/utils/common";
import AlarmStatisticsModal from "@/components/shengnong-custom-panel/security-monitoring/components/alarm-statistics-modal.vue";
const emits = defineEmits(['clickRow', 'patrolMore'])
/**
* 数据部分
*/

const state = reactive({
  activeKey: '',
  showMoreModal: false,
  patrolRankList: [],
  safetyPatrolData: [
    {
      name: '巡更总数',
      value: 0,
      unit: '个',
      icon: '',
      color: 'blue',
      code: 'totalCount',
    },
    {
      name: '巡更异常数',
      value: 0,
      unit: '个',
      icon: '',
      color: 'blue',
      code: 'errCount',
    },
  ],
  safetyPatrolTime: {
    timeType: "THIS_YEAR",
    dateRange: [""],
  },
})
const moreTitle = computed(() => {
  return state.activeKey ? "巡更异常数" : "巡更数"
})
const getPatrolStat = async () => {
  const params = {
    period: (state.safetyPatrolTime.dateRange || [dayjs().startOf("year").format('YYYY-MM-DD 00:00:00'), dayjs().endOf("year").format('YYYY-MM-DD HH:mm:ss')]).join(","),
    type: state.safetyPatrolTime.timeType,
    marketTenant: '',
  }
  let result = await safetyPatrol(params);
  const { totalCount, errCount } = result;
  state.safetyPatrolData[0].value = totalCount;
  state.safetyPatrolData[1].value = errCount;
}
const getPatrolRankApi = async (params) => {
  const payload = {
    marketTenant: '',
    abnormal: !state.activeKey ? false : true,
    ...params,
    period: state.safetyPatrolTime.dateRange.join(","),
    type: state.safetyPatrolTime.timeType,
  }
  return await getSafetyPatrolRank(payload)
}
const getPatrolRank = async () => {
  const { records } = await getPatrolRankApi({
    pageNumber: 1,
    pageSize: 50,
  })
  const newRecords = filterMarket(records)
  const total = getallNumber(newRecords, "taskNum")
  state.patrolRankList = newRecords.map((item, index) => {
    return {
      ...item,
      count: item.taskNum,
      name: item.marketName,
      ratio: item.ratio,
      sort: index + 1,
      marketTenant: item.marketTenant,
      width: item.taskNum / total * 100,
    }
  }).slice(0, 3)
}
const changePatrolTabTime = async () => {
  getPatrolStat()
  getPatrolRank()
}
const clickItem = (item) => {
  emits('clickRow', {
    ...item,
    dateRange: state.safetyPatrolTime.dateRange,
    activeKey: state.activeKey
  })
}
const handleClickItem = (item) => {
  emits('clickRow', {
    ...item,
    dateRange: state.safetyPatrolTime.dateRange,
    activeKey: item.code === 'errCount' ? 'errCount' : ''
  })
}
const handleChange = () => {
  const params = {
    period: state.safetyPatrolTime.dateRange.join(","),
    type: state.safetyPatrolTime.timeType,
    marketTenant: '',
  }
  getPatrolRank(params)
}
const handleMore = () => {
  state.showMoreModal = true
}
onMounted(() => {
})
// 使用toRefs解构
// let { } = { ...toRefs(state) } 
defineExpose({
  ...toRefs(state)
})

</script>
<style scoped lang='less'>
.more {
  color: #93AADB;
  font-size: 14px;
  text-align: right;
  padding: 0 4px;
  cursor: pointer;
}

:deep(.row-cell .box) {
  padding-left: 40px;
}

:deep(.row-cell .dot) {
  display: none !important;
}

.inspectTab {
  height: 30px;
  text-align: right;
  margin-top: 10px;
  position: relative;

  :deep(.ant-tabs-tab-btn) {
    color: #93aadb;
  }

  :deep(.ant-tabs-nav::after) {
    content: none;
  }

  :deep(.ant-tabs-nav::before) {
    content: none;
  }

  :deep(.ant-tabs-tab-active) {
    background: linear-gradient(180deg,
        rgba(97, 148, 247, 0.0196) 0%,
        rgba(97, 148, 247, 0.5) 96%);
    color: #6194f7;
  }

  :deep(.ant-tabs-tab) {
    height: 26px;
  }
}

:deep(.inspectCard .hidden-danger .hidden-danger-box .hidden-danger-name) {
  white-space: nowrap;
}

:deep(.inspectCard .hidden-danger .hidden-danger-box) {
  width: 30%;
  overflow: hidden;
  background-size: cover;
}

:deep(.inspectCard .ant-tabs > .ant-tabs-nav) {
  display: inline-block;
}
</style>