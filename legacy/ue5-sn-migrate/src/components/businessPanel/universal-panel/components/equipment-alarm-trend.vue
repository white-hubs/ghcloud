<template>
    <SubPanelTemplate :title="title" class="alarm-event">
      <template #extra>
        <DateInlineForm
        v-model:modelValue="trend"
        @search="alarmTrendInfo"
        ></DateInlineForm>
      </template>
      <OperateDays :value="alarmNum" title="报警总数">
        <div class="ringRatio">
          <span>环比</span>
          <!-- uptriangle 向上三角根据Prop改变 -->
          <div :class="['downtriangle', chainRatio > 0 && 'uptriangle']"></div>
          <div :class="[chainRatio > 0 ? 'up' : 'down']">{{ chainRatio + "%" }}</div>
        </div>
      </OperateDays>
      <GridContainer style="margin-top: 12px" :data="alarmStatusData"></GridContainer>
      <LineChart :x-data="xData.arr" :series="series" :title="'次'"></LineChart>
    </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import { ModelValueItf } from '../../public/types'
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
import { alarmTrend, equipmentNumber } from '@/utils/requestData/alarm'
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import OperateDays from "../../public/operateDays.vue";
import GridContainer from "../../public/gridContainer.vue";
import LineChart from "../../public/lineChart.vue";
interface Props {
  title: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: '设备报警趋势',
});
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const trend = ref<ModelValueItf>();
const alarmNum = ref<number>(0);
const chainRatio = ref<number>(0);
let alarmStatusData = reactive([]);
const xData = reactive({
  arr: ["1时", "2时", "3时", "4时", "5时"],
});
const series = reactive([
  {
    data: [0],
    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
  },
])

// 设备报警趋势
const alarmTrendInfo = async () => {
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: trend.value.dateRange.join(","),
    type: trend.value.timeType,
  };
  let res: any = await alarmTrend(param);
  let data: any = await equipmentNumber(param);
  alarmStatusData = data.alarmStatusStatistics;
  alarmNum.value = data.alarmNum;
  chainRatio.value = data.chainRatio;
  xData.arr = res.xdata;
  series[0].data = res.ydata;
};
</script>
<style lang="less" scoped>
.ringRatio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin-left: 6px;
}
</style>