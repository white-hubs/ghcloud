<template>
  <div >
    <SubPanelTemplate title="事件报警top5" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="handleTime" @search="areaAlarmStatistic"></DateInlineForm>
      </template>
      <div class="body" v-show="areaAlarmRank.length" style="min-height: 190px">
        <EventAlarmItem v-for="(item, index) in areaAlarmRank" :sort="index + 1" :name="item.name"
          :linkRatio="item.chainRatio" :count="item.alarmNum" :ratio="item.ratio + '%'" />
      </div>
      <div class="body" v-show="!areaAlarmRank.length">
        <noData></noData>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备离线率" class="alarm-event">
      <div class="equipmentInfo">
        <waterPolo
          title=""
          :value="faultRate"
          unit="%"
          bgColor="#FFC700"
          color="#FFC700"
        ></waterPolo>
        <deviceModule :data-list="dataList"></deviceModule>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警处理情况" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="hiddenDangerTime" @search="changeHandleHiddenDangerTime"></DateInlineForm>
      </template>
      <OperateDays title="报警数" :value="alarmCon.count">
        <div class="extra flex-start">
          <div class="mode">环比</div>
          <div :class="['downtriangle', alarmCon.ratio > 0 && 'uptriangle']"></div>
          <div :class="[alarmCon.ratio < 0 ? 'down' : 'up']">{{ alarmCon.ratio }}%</div>
        </div>
      </OperateDays>
      <GridContainer :parameter="hiddenDangerTime" :data="deviceStatistic" class="body-bum"></GridContainer>
      <div class="flex-between mg-10">
        <PlanPie :pieData="monitorSituationPieData">
          <div class="content">
            <div class="total-num">{{ alarmTotal }}</div>
            <div>报警总数</div>
          </div>
        </PlanPie>
        <PieList :roundPieData="monitorSituationPieData"></PieList>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import EventAlarmItem from "../public/eventAlarmItem.vue";
import noData from "../public/noData.vue";
import { AlarmRateList, ModelValueItf } from '../public/types'
import { AlarmAreaTop } from '@/api/models/alarm'
import GridContainer from "../public/gridContainer.vue";
import waterPolo from "../public/charts/waterPolo/waterPolo.vue";
import OperateDays from "../public/operateDays.vue";
import deviceModule from "../public/deviceModule.vue";
import useCommon from '@/components/hooks/useCommon'
import { equipmentNumber } from '@/utils/requestData/alarm'
import PlanPie from "../public/charts/pie/planePie.vue";
import PieList from "../public/pieList.vue";
import { useStateStore } from '@/pages/state/use-state-store';
const { getEquipmentNumber,getEventTop } = useCommon();
const { globalState } = useStateStore()

const faultRate = ref<number>(0);
const hiddenDangerTime = ref<ModelValueItf>()
const alarmTotal = ref(0)
const monitorSituationPieData = ref([]);
  const deviceStatistic = ref([
  {
    alarmNum: 10,
    alarmStatus: '',
    alarmStatusName: '处理中',
    color: '#FFC700'
  },
  {
    alarmNum: 10,
    alarmStatus: '',
    alarmStatusName: '挂起',
    color: '#74AEE7'
  },
  {
    alarmNum: 10,
    alarmStatus: '',
    alarmStatusName: '已处理',
    color: '#00F27B'
  },
  {
    alarmNum: 10,
    alarmStatus: '',
    alarmStatusName: '待确认',
    color: '#29C2FF'
  },
]);
  const alarmCon = ref({
  count: 0,
  ratio: 0,
});
const dataList = reactive<AlarmRateList[]>([
  {
    title: "设备总数",
    value: 0,
    ringRatio: false,
  },
  {
    title: "离线总数",
    value: 0,
    ringRatio: true,
    label: 0,
    unit: "%",
  },
]);
const handleTime = ref<ModelValueItf>();
const areaAlarmRank = ref<AlarmAreaTop[]>([]);
// 设备报警趋势
const changeHandleHiddenDangerTime = async()=>{
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: hiddenDangerTime.value.dateRange.join(","),
    type: hiddenDangerTime.value.timeType,
  };
  let data: any = await equipmentNumber(param);
  deviceStatistic.value = data.alarmStatusStatistics;
  alarmCon.value.count = data.alarmNum;
  alarmCon.value.ratio = data.chainRatio;
  alarmTotal.value = data.alarmNum
  monitorSituationPieData.value = data.alarmStatusStatistics.map(item=>{
    return {
      label:item.alarmStatusName,
      value:item.alarmNum,
      color:item.color
    }
  })
}
/**
 * 区域报警Top5
 */
 const areaAlarmStatistic = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: handleTime.value.dateRange.join(","),
    type: handleTime.value.timeType,
  };
  areaAlarmRank.value = await getEventTop(params);
};
/**
 * 设备类型分布
 */
 const equipmentStatistic = async () => {
  const res = await getEquipmentNumber();
  if (JSON.stringify(res) === "{}") {
    return;
  }
  res.deviceStatusNums.forEach((item) => {
    if (item.name === "OFFLINE" && res.deviceNum !== 0) {
      faultRate.value = Math.round((item.num / res.deviceNum) * 10000) / 100.0;
      dataList[0].value = res.deviceNum;
      dataList[1].value = item.num;
      dataList[1].label = faultRate.value;
    }
  });
};
onMounted(()=>{
  equipmentStatistic()
})
</script>
<style lang="less" scoped>
.equipmentInfo {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px 0 20px;
}
.extra {
  margin-left: 16px;
  font-size: 12px;
  font-weight: 400;
  font-family: Roboto-Regular, Roboto;

  .mode {
    color: #e7f0ff;
  }

  .downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    margin: 0 3px;
    transform: rotate(180deg);
  }

  .uptriangle {
    border-bottom: 8px solid #ffcece;
    transform: rotate(0deg);
  }

  .down {
    color: #2ae8bd;
    font-family: Roboto-Regular, Roboto;
  }

  .up {
    color: #f14545;
    font-family: Roboto-Regular, Roboto;
  }
}
.content {
  text-align: center;
  color: #fff;
  font-size: 14px;

  .total-num {
    font-size: 16px;
  }
}
.body{
  height: 300px;
}
</style>