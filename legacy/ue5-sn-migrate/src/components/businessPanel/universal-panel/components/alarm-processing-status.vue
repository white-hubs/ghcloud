<template>
    <SubPanelTemplate :title="title" class="alarm-event">
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
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import { ModelValueItf } from '../../public/types'
import { equipmentNumber } from '@/utils/requestData/alarm'
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import OperateDays from "../../public/operateDays.vue";
import GridContainer from "../../public/gridContainer.vue";
import PlanPie from "../../public/charts/pie/planePie.vue";
import PieList from "../../public/pieList.vue";
import { storeMenu } from "@/piniaStore/menu";
import { storeArea } from "@/piniaStore/area";
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();

interface Props {
  title: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: '报警处理情况',
});
const hiddenDangerTime = ref<ModelValueItf>()
const alarmTotal = ref(0)
const alarmCon = ref({
  count: 0,
  ratio: 0,
});
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
// 设备报警趋势
const changeHandleHiddenDangerTime = async()=>{
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
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