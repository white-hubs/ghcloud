<template>
  <SubPanelTemplate title="设备利用率统计分析">
    <div class="equipmentInfo">
      <waterPolo title="" :value="faultRate" unit="%" bgColor="#FFC700" color="#FFC700"></waterPolo>
      <deviceModule :data-list="dataList"></deviceModule>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="实时监测实验室设备状态">
    <OperateDays title="设备总数" :value="deviceTotal">
    </OperateDays>
    <GridContainer :data="deviceStatistic" class="body-bum"></GridContainer>
    <div class="chart">
      <pieGuidance :y-data="yData" height="100%"></pieGuidance>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="环境参数监测与控制">
    <div class="line-chart">
      <stackedLine :title="lineData.title" :yData="lineData.yData" :xData="lineData.xData"
        :color="['#2989FF', '#FF6E23']"></stackedLine>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import waterPolo from "@/components/businessPanel/public/charts/waterPolo/waterPolo.vue";
import deviceModule from "@/components/businessPanel/public/deviceModule.vue";
import OperateDays from "@/components/businessPanel/public/operateDays.vue";
import GridContainer from "@/components/businessPanel/public/gridContainer.vue";
import pieGuidance from "@/components/businessPanel/public/charts/pie/pie-guidance.vue"
import stackedLine from "@/components/businessPanel/public/charts/stackedLine/stackedLine.vue";

const faultRate = ref<number>(0);
const dataList = reactive([
  {
    title: "设备总数",
    value: 320,
    ringRatio: false,
  },
  {
    title: "使用率",
    value: 100,
    ringRatio: true,
    label: 32,
    unit: "%",
  },
]);
const deviceTotal = ref(320);
const deviceStatistic = ref([
  {
    alarmStatusName:"正常",
    color:'#2F8DFF',
    alarmNum:180
  },
  {
    alarmStatusName:"故障",
    color:'#19F8F7',
    alarmNum:10
  },
  {
    alarmStatusName:"离线",
    color:'#7786a3',
    alarmNum:20
  },
  {
    alarmStatusName:"报警",
    color:'#FFAB10',
    alarmNum:10
  },
]);
const yData = ref([
    { name: '正常', value: 5.6, itemStyle: { color: "#2F8DFF" } },
    { name: '离线', value: 1, itemStyle: { color: "#2AE8BD" } },
    { name: '故障', value: 1, itemStyle: { color:  "#7786a3" } },
    { name: '告警', value: 1, itemStyle: { color: "#f7c741" } },
])
const monitorPanelData = ref([
    {
        imgPath: 'overView5.png',
        value: 65,
        name: '设备状态'
    },
    {
        imgPath: 'overView29.png',
        value: 98,
        name: '历史数据'
    },
])
const lineData = reactive({
    title: "",
    xData: ['4', '8', '12', '16', '20', '24'],
    yData: [
        {
            data: [1, 2, 4, 5, 6, 8, 7],
            name: "设备状态",
            colors: [
                {
                    offset: 0,
                    color: "rgba(41, 137, 255, 1)",
                },
                {
                    offset: 1,
                    color: "rgba(41, 137, 255, 0.20)",
                },
            ],
        },
        {
            data: [10, 12, 14, 5, 86, 8, 7],
            name: "历史数据",
            colors: [
                {
                    offset: 0,
                    color: "rgba(255, 110, 35, 1)",
                },
                {
                    offset: 1,
                    color: "rgba(255, 110, 35, 0.02)",
                },
            ],
        },
    ],
});
</script>
<style lang="less" scoped>
.equipmentInfo {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px 0 20px;
}
.chart{
  height: 200px;
}
.line-chart{
  height: 180px;
}
</style>