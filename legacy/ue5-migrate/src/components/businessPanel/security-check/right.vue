<template>
  <div >
    <SubPanelTemplate title="报警事件top5">
      <template #extra>
        <DateInlineForm v-model:modelValue="eventInfo" @search="alarmEventTop"></DateInlineForm>
      </template>
      <div class="body" v-show="alarmTop.arr.length > 0" style="min-height: 250px">
        <EventAlarmItem v-for="(item, index) in alarmTop.arr" :key="item.id" :sort="index + 1" :name="item.name"
          :count="item.alarmNum" :ratio="item.ratio + '%'" />
      </div>
      <div class="body" v-show="alarmTop.arr.length <= 0" style="min-height: 150px">
        <noData></noData>
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
      <GridContainer :data="deviceStatistic" class="body-bum"></GridContainer>
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
    <SubPanelTemplate title="安检通道报警级别" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="alarmLevelTime" @search="changeAlarmLevelTime"></DateInlineForm>
      </template>
      <GridContainer :data="levelStatistic"></GridContainer>
      <div class="flex-between mg-10">
        <PlanPie :pieData="levelPieData">
          <div class="content">
            <div class="total-num">{{ levelAlarmTotal }}</div>
            <div>报警总数</div>
          </div>
        </PlanPie>
        <PieList :roundPieData="levelPieData"></PieList>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import PlanPie from "../public/charts/pie/planePie.vue";
import PieList from "../public/pieList.vue";
import GridContainer from "../public/gridContainer.vue";
import OperateDays from "../public/operateDays.vue";
import { ModelValueItf } from '../public/types'
import { alarmStatisticsList } from '@/api/alarm'
import moment from 'moment'
import { equipmentNumber } from '@/utils/requestData/alarm'
import useCommon from '@/components/hooks/useCommon'
import EventAlarmItem from "../public/eventAlarmItem.vue";
import { useStateStore } from '@/pages/state/use-state-store';
const { globalState } = useStateStore()
const eventInfo = ref<ModelValueItf>({
  timeType: 'TODAY',
  dateRange: []
});
const {
  getAlarmLevel,
  getEventTop
} = useCommon();
const column = [
  {
    title: "报警事件",
    dataIndex: "alarmEventName",
    width: 120,
  },
  {
    title: "报警时间",
    dataIndex: "alarmTime",
  },
  {
    title: "处理情况",
    dataIndex: "alarmStatus",
    slots: {
      customRender: "alarmStatus",
    },
    width: 140,
  }
];
const alarmListData = ref([])
const alarmCon = ref({
  count: 0,
  ratio: 0,
});
const alarmTop = reactive({ arr: [] });
const hiddenDangerTime = ref()
const alarmLevelTime = ref()
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
const levelStatistic = ref([
  {
    alarmNum: 10,
    alarmStatus: '',
    alarmStatusName: '一级',
    color: '#FFC700'
  },
  {
    alarmNum: 10,
    alarmStatus: '',
    alarmStatusName: '二级',
    color: '#74AEE7'
  },
  {
    alarmNum: 10,
    alarmStatus: '',
    alarmStatusName: '三级',
    color: '#00F27B'
  },
  {
    alarmNum: 10,
    alarmStatus: '',
    alarmStatusName: '四级',
    color: '#29C2FF'
  },
]);
const levelPieData = ref([])
const alarmTotal = ref(0)
const levelAlarmTotal = ref(0)
const monitorSituationPieData = ref([]);
// 报警事件Top5
const alarmEventTop = async () => {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: eventInfo.value.dateRange.join(","),
    type: eventInfo.value.timeType,
  };
  let res = await getEventTop(param);
  alarmTop.arr = res;
};
// 获取报警列表
const getAlarmTakeNotes = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    type: 'THIS_YEAR',
    period: [moment().startOf("year").format('YYYY-MM-DD 00:00:00'), moment().format("YYYY-MM-DD HH:mm:ss")].join(','),
    pageSize: 10,
    pageNumber: 1,
  };
  let res = await alarmStatisticsList(params);
  alarmListData.value = res.records.map((item) => {
    return {
      ...item,
      alarmTime: moment(item.alarmTime).format("YYYY-MM-DD"),
    };
  });
}
// 设备报警趋势
const changeHandleHiddenDangerTime = async () => {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: hiddenDangerTime.value.dateRange.join(","),
    type: hiddenDangerTime.value.timeType,
  };
  let data = await equipmentNumber(param);
  //@ts-ignore
  deviceStatistic.value = data.alarmStatusStatistics;
  alarmCon.value.count = data.alarmNum;
  alarmCon.value.ratio = data.chainRatio;
  alarmTotal.value = data.alarmNum
  monitorSituationPieData.value = data.alarmStatusStatistics.map(item => {
    return {
      label: item.alarmStatusName,
      value: item.alarmNum,
      color: item.color
    }
  })
}
// 报警级别
const changeAlarmLevelTime = async () => {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: alarmLevelTime.value.dateRange.join(","),
    type: alarmLevelTime.value.timeType,
  };
  levelPieData.value.length = 0
  levelAlarmTotal.value = 0
  const res = await getAlarmLevel(param);
  res.forEach((item, index) => {
    levelAlarmTotal.value += item.alarmNum
    levelStatistic.value[index].alarmNum = item.alarmNum
    levelPieData.value.push({
      label: item.name,
      value: item.alarmNum,
      color: levelStatistic.value[index].color
    })
  })
}
onMounted(() => {
  getAlarmTakeNotes()
})
</script>
<style lang="less" scoped>
.body-bum {
  margin: 10px 0;
}

.footer {
  height: 250px;
}

.content {
  text-align: center;
  color: #fff;
  font-size: 14px;

  .total-num {
    font-size: 16px;
  }
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
</style>