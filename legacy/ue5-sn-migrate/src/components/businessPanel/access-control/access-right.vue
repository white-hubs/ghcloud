<!-- 门禁管理 -->
<template>
  <div class="panel">
    <SubPanelTemplate title="人流通行趋势">
      <template #extra>
        <DateInlineForm v-model:modelValue="through" @search="abnormalPassageInfo"></DateInlineForm>
      </template>
        <OperateDays :value="numberPasses" title="通行总次数"> </OperateDays>
      <div class="chart">
        <LineChart :x-data="ecahrtsData.xData" :series="[
            {
              data: ecahrtsData.yData,
              linearGradientColor: ['rgb(255, 162, 0.1)', 'rgb(255, 222, 165,1)'],
            },
          ]" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="通行分析" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="throughType" @search="trafficAnalysisInfo"></DateInlineForm>
      </template>
      <div class="equipmentAlarm" v-show="roundPieData.arr.length > 0">
        <planPie :pie-data="roundPieData.arr">
          <div class="content">
            <div class="pie-center">{{ throughNum }}</div>
            <div>通行总数</div>
          </div>
        </planPie>
        <pieList :roundPieData="roundPieData.arr"></pieList>
      </div>
      <div class="equipmentAlarm" v-show="roundPieData.arr.length <= 0">
        <noData></noData>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="实时通行数据" class="alarm-event">
      <!-- <template #bar>
                <div class="right-bar">查看更多》</div>
                    </template> -->
      <RollTable :column="columns" :data="data" :showLength="8"> </RollTable>
    </SubPanelTemplate>
  </div>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import planPie from "../public/charts/pie/planePie.vue";
import pieList from "../public/pieList.vue";
import OperateDays from "../public/operateDays.vue";
import LineChart from "../public/lineChart.vue";
import RollTable from "../public/rollTable/index.vue";
import moment from "moment"
import {
  abnormalPassage,
  accessType,
  trafficAnalysis,
} from "@/utils/requestData/accessControl";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from '@/piniaStore/menu'
import { visualizationEvent } from '@/api/door'
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
let through = ref();
let throughType = ref();
const throughNum = ref(0);
const ecahrtsData = reactive({
  xData: [],
  yData: [],
});
let timer = ref<any>(null);
let numberPasses = ref(0);
const roundPieData = reactive({
  arr: [],
});

const columns = ref([
  {
    title: "时间",
    dataIndex: "eventTime",
    width: 120,
  },
  {
    title: "门禁名称",
    dataIndex: "doorName",
  },
  {
    title: "通行方式",
    dataIndex: "eventWay",
  },
]);
const data = ref<any>([]);
watch(
  () => piniaStoreArea.currentAreaId,
  () => {
    clearInterval(timer.value);
    timer.value = setInterval(() => {
      init();
    }, (window as any).config.pageLoopRequestTime);
    init();
  }
);

// 人流通行趋势
const abnormalPassageInfo = async () => {
  let res = await abnormalPassage(through.value.timeType, "DO_PASS");
  ecahrtsData.xData = res.xdata;
  ecahrtsData.yData = res.series[0].value;
  numberPasses.value = 0;
  res.series[0].value.forEach((item) => {
    numberPasses.value += item;
  });
};
// 通行类型占比
const accessTypeInfo = async () => {
  roundPieData.arr = await accessType(throughType.value.timeType);
};
// 通行分析
const trafficAnalysisInfo = async () => {
  let res = await trafficAnalysis(throughType.value.timeType);
  throughNum.value = res.total;
  roundPieData.arr = res.arr;
};
// 实时通行数据
const realTimeTrafficData = async () => {
  let param = {
        sceneType: piniaStoreMenu.currentMenu,
        areaId: piniaStoreArea.currentAreaId,
        pageNumber:1,
        pageSize:50,
    }
let res = await visualizationEvent(param);
  res.records.forEach(item=>{
    item.eventTime = moment(item.eventTime).format('YYYY-MM-DD HH:mm:ss')
  })
  data.value = res.records.filter(item=>{
    if (moment(item.eventTime).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
      return item
    }
  })
};
const init = () => {
  // accessTypeInfo()
  realTimeTrafficData();
  trafficAnalysisInfo();
  abnormalPassageInfo();
};
onMounted(() => {
  init();
  timer.value = setInterval(() => {
    init();
  }, (window as any).config.pageLoopRequestTime);
});
onBeforeUnmount(() => {
  clearInterval(timer.value);
});
</script>
<style lang="less" scoped>
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;

  .content {
    font-size: 16px;
  }

  .pie-center {
    font-size: 18px;
    font-weight: bold;
  }
}

.ringRatio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin-left: 6px;
}

.chart {
  height: 180px;
  display: flex;
}

.iconOutlined {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #cbe2ff;
}

.content {
  color: #fff;
  text-align: center;
  font-size: 12px;
}
</style>
