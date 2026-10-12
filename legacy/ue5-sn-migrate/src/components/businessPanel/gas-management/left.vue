<template>
  <div class="panel">
    <SubPanelTemplate title="报警情况统计">
      <template #extra>
        <DateInlineForm v-model:modelValue="alarmtimeType" @search="changeDate"></DateInlineForm>
      </template>
      <displayPanel :bg-img="'overView16.png'" :content-list="contentList" :showimg="false"></displayPanel>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警趋势" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="trend" @search="alarmTrendInfo"></DateInlineForm>
      </template>
      <LineChart class="line_char" :x-data="xData.arr" :series="series"></LineChart>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警处理排名">
      <template #extra>
        <DateInlineForm v-model:modelValue="handleTime" @search="changeHandleTime"></DateInlineForm>
      </template>
      <div class="body" style="min-height: 250px;" v-show="alarmRank.list.length > 0">
        <EventAlarmItem @click="handleClickItem(item)" v-for="(item, index) in alarmRank.list" :key="item.id" :sort="index + 1"
          :name="item.name" :linkRatio="item.chainRatio" :count="item.alarmNum" :ratio="item.ratio + '%'" />
      </div>
      <div class="body" style="min-height: 150px;" v-show="alarmRank.list.length <= 0">
        <noData></noData>
      </div>  
    </SubPanelTemplate>
    <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="parameter"></modal-alarm-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import displayPanel from "@/components/businessPanel/public/display-panelsafty.vue";
import noData from '@/components/businessPanel/public/noData.vue'
import EventAlarmItem from '../public/eventAlarmItem.vue';
import { ModelValueItf } from '../public/types'
import LineChart from "../public/lineChart.vue";
import { alarmTrend } from '@/utils/requestData/alarm'
import { storeMenu } from '@/piniaStore/menu'
import { storeArea } from '@/piniaStore/area'
import { alarmHandleTop, statisticsLevel, statisticsSituation } from '@/api/alarm'
import { AlarmAreaTop } from '@/api/models/alarm'
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
interface AlarmHandlType {
    list: AlarmAreaTop[]
}
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const parameter = reactive({
  userId:'',
})
//报警情况统计====================================================================================================
let alarmtimeType = ref({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const alarmModalShow=ref<boolean>()
const contentList = ref([
  {
    name: "报警超时率",
    value: 0,
  },
  {
    name: "报警正确率",
    value: 0,
  },
  {
    name: "报警处理率",
    value: 0,
  },
  {
    name: "报警响应率",
    value: 0,
  },
  {
    name: "用气报警占比",
    value: 0,
  },
]);
const changeDate =async () => {
  const res = await statisticsSituation({
    areaId: piniaStoreArea.currentAreaId,
    period: alarmtimeType.value.dateRange.join(","),
    sceneType:piniaStoreMenu.currentMenu,
  });
  contentList.value[0].value = Number(res.timeoutRatio);
  contentList.value[1].value = Number(res.actualRatio);
  contentList.value[2].value = Number(res.handlerRatio);
  contentList.value[3].value = Number(res.confirmedRatio);
  contentList.value[4].value = Number(res.ratio);
}
//报警趋势====================================================================================================
const trend = ref<ModelValueItf>({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const xData = reactive({
  arr: ["1时", "2时", "3时", "4时", "5时"],
});
const series = reactive([
  {
    data: [110,21,31,44,51],
    smooth:false,
    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
  },
]);
// 设备报警趋势
const alarmTrendInfo = async () => {
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: trend.value.dateRange.join(","),
    type: trend.value.timeType,
  };
  let res: any = await alarmTrend(param);
  xData.arr = res.xdata;
  series[0].data = res.ydata;
};
//报警处理排名====================================================================================================
let handleTime = ref<ModelValueItf>({
  timeType:'THIS_YEAR',
  dateRange:[]
})
const alarmRank = reactive<AlarmHandlType>({
    list: []
})
// 报警处理排名
async function changeHandleTime() {
  let params = {
        sceneType: piniaStoreMenu.currentMenu,
        areaId: piniaStoreArea.currentAreaId,
        period: handleTime.value.dateRange.join(','),
        type: handleTime.value.timeType,
      }
  alarmRank.list = await alarmHandleTop(params)
}
const closeModal=()=>{
  alarmModalShow.value=false
}
const handleClickItem=(item:AlarmAreaTop)=>{
  parameter.userId=item.id
  alarmModalShow.value=true
}
</script>
<style lang="less" scoped>
.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 10px 10px;
  align-items: center;

  .pie_list {
    width: 150px;
    margin-left: 10px;
  }
}

.chart {
  flex: 1;
  height: 180px;
}

.line_char {
  width: 100%;
  height: 200px;
}
</style>