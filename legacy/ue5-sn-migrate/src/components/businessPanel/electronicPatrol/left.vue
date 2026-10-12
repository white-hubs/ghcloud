<template>
  <div class="panel">
    <SubPanelTemplate title="巡更路线">
      <div class="footer">
         <RollTable :column="routeColumn" :data="listData" :limitScrollNum="4">
         </RollTable>
       </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="巡更计划">
      <GridContainer :data="deviceStatistic" ></GridContainer>
      <div class="flex-between mg-10">
          <PlanPie :pieData="monitorSituationPieData">
            <div class="content">
              <div class="total-num">{{ total }}</div>
              <div>计划总数</div>
            </div>
          </PlanPie>
          <PieList
            :roundPieData="monitorSituationPieData"
          ></PieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="巡更点异常top5统计">
      <template #extra>
      <DateInlineForm
        v-model:modelValue="alarmTime"
        @search="changeAlarmTime"
      ></DateInlineForm>
      </template>
         <RollTable :column="column" :data="planListData">
         </RollTable>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import GridContainer from "../public/gridContainer.vue";
import PlanPie from "../public/charts/pie/planePie.vue";
import PieList from "../public/pieList.vue";
import RollTable from "../public/rollTable/index.vue";
import { routeList,getPalnStatus,locationList } from "@/api/maintain";
import { ModelValueItf } from '../public/types'
const alarmTime = ref<ModelValueItf>()
const deviceStatistic = ref([
  {
    alarmStatusName:'执行中',
    code:'ENABLE',
    alarmNum:0,
    color:'#328BF7'
  },
  {
    alarmStatusName:'已停用',
    code:'STOP',
    alarmNum:0,
    color:'#FFC700'
  },
  {
    alarmStatusName:'已结束',
    code:'END',
    alarmNum:0,
    color:'#EF424A'
  }
  ]);
const total = ref(0)
const monitorSituationPieData = ref<{ label: string; value: number; color: string }[]>([
    {
    label:'执行中',
    value:0,
    color:'#328BF7'
  },
    {
    label:'已停用',
    value:0,
    color:'#FFC700'
  },
    {
    label:'已结束',
    value:0,
    color:'#EF424A'
  }
  ]);
const routeColumn = [
  {
    title: "巡更路线",
    dataIndex: "patrolRouteName",
    width: 120,
  },
  {
    title: "巡更点数量",
    dataIndex: "patrolLocationNumber",
  }
];
const column = [
  {
    title: "巡更点",
    dataIndex: "locationName",
    width: 120,
  },
  {
    title: "异常次数",
    dataIndex: "abnormalNum",
  },
  {
    title: "巡更率",
    dataIndex: "patrolRatio",
    width: 140,
  }
];
const listData = ref([])
const planListData = ref([])
const changeAlarmTime =async () => {
 planListData.value = await locationList({period:alarmTime.value.dateRange.join(',')})
 planListData.value.map(item=>{
    item.abnormalNum = item.abnormalNum || 0
  })
}
const getPatrolRoute =async () => {
  listData.value = await routeList()
}
const guardTourPlan = async()=>{
  const res= await getPalnStatus()
  total.value = 0
  deviceStatistic.value.forEach((item,index)=>{
    total.value +=res[index].value
  })
  deviceStatistic.value.forEach((item,index)=>{
   res.forEach(data=>{
    if (item.code === data.name) {
      item.alarmNum =data.value
      monitorSituationPieData.value[index].value = data.value
    }
   })
  })
}

onMounted(()=>{
  getPatrolRoute()
  guardTourPlan()
})
</script>
<style lang="less" scoped>
.content {
    text-align: center;
    color: #fff;
    font-size: 14px;

    .total-num {
      font-size: 16px;
    }
  }
  .mg-10{
    margin-top:10px;
    :deep(.policeList){
      height:auto;
    }
  }
</style>