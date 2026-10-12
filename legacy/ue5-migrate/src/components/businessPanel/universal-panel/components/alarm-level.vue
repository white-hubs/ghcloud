<template>
  <SubPanelTemplate :title="title" class="alarm-level">
     <template #extra>
       <DateInlineForm v-model:modelValue="timeFrame" @search="getAlarmLevel" />
      </template>
      <div class="body">
        <div class="chart">
          <Pie3D :data="fakeData" label-key="name" value-key="alarmNum" />
        </div>
        <div class="footer">
          <AlarmStatisticsItem
            v-for="(item, index) in fakeData"
            :key="item.name"
            :level="index + 1"
            :alarmNum="item.alarmNum"
            :chainRatio="item.chainRatio"
            :name="item.name"
            :is-grow="item.isGrow"
          />
        </div>
      </div>
    </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import AlarmStatisticsItem from "../../public/alarmStatisticsItem.vue";
import { ModelValueItf } from '../../public/types'
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DateInlineForm from "../../public/dateInlineForm.vue";
import Pie3D from "../../public/charts/pie/pie.vue";
import { AlarmLevelType } from '@/api/models/alarm'
import { statisticsLevel } from "@/api/alarm";
import { useStateStore } from '@/pages/state/use-state-store';

interface Props {
  title: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: '报警级别分布',
});
const { globalState } = useStateStore()

let timeFrame = ref<ModelValueItf>();
const fakeData = ref<AlarmLevelType[]>([
  {
    alarmNum: 0,
    name: "一级报警",
    chainRatio: 0,
    isGrow: false,
  },
]);
// 获取报警级别分布数据
const getAlarmLevel = async()=> {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: timeFrame.value.dateRange.join(","),
    type: timeFrame.value.timeType,
  };
  let res = await statisticsLevel(params);
  fakeData.value = res.map((item) => {
    item.chainRatio <= 0 ? (item.isGrow = false) : (item.isGrow = true);
    item.name += "报警";
    return item;
  });
}
</script>
<style lang="less" scoped>
.alarm-level {
  .chart {
    display: flex;
    height: 140px;
  }

  .footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}
</style>