<template>
  <div class="panel">
    <SubPanelTemplate title="设备状态总览">
      <OperateDays title="设备数" :value="alarmCon" style="margin-bottom: 10px;" />
      <GridContainer :data="levelStatistic"></GridContainer>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备分类">
      <div class="chart">
        <RingChart :pieData="pieData" seriesName="设备类型统计" :total="alarmCon"></RingChart>
      </div>
      <div class="statistic">
        <div class="statistic-item" v-for="(item, index) in pieData">
          <a-statistic :value="item.value" :valueStyle="statisticStyle">
            <template #title>
              <div class="title flex-start">
                <div class="box" :style="statisticValueStyle(index)"></div>
                <span>{{ item.name }}</span>
              </div>
            </template>
            <template #suffix>
              <span>{{ item.ratio }}</span>
            </template>
          </a-statistic>
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备告警趋势">
      <template #extra>
        <DateInlineForm v-model:modelValue="topTimeFrame" @search="getAlarmsNumber"></DateInlineForm>
      </template>
      <div class="chart">
        <LineChart :x-data="xData" :series="[
            {
              data: yData,
              linearGradientColor: ['rgb(86, 142, 255)', 'rgb(86, 142, 255,0)'],
            },
          ]" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="异常设备清单">
      <template #extra>
        <div class="details">
          全部
        </div>
      </template>
      <RollTable :column="alarmColumn" :data="listData" :limitScrollNum="4">
      </RollTable>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted, computed} from 'vue'
import GridContainer from "../public/gridContainer.vue";
import RollTable from "../public/rollTable/index.vue";
import OperateDays from "../public/operateDays.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import RingChart from "../public/charts/ring/ring.vue";
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
import { equipmentTotal } from '@/api/equipment'
import { ModelValueItf } from '../public/types'
import { alarmStatisticsList, statisticsTrend } from '@/api/alarm'
import moment from 'moment'

const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const topTimeFrame = ref<ModelValueItf>();
const xData = ref<string[]>([])
const yData = ref<number[]>([])
const alarmCon = ref(0)
const alarmColumn = [
  {
    title: "设备名称",
    dataIndex: "alarmTargetName",
    width: 120,
  },
  {
    title: "异常情况",
    dataIndex: "alarmTargetTypeName",
  },
  {
    title: "上报时间",
    dataIndex: "alarmTime",
    width: 140,
  }
];
const listData = ref([])
const levelStatistic = ref([]);
const statisticStyle = computed(() => {
  return {
    fontSize: "16px",
    color: "#FFFFFF",
    paddingLeft: "16px",
  };
});
const statisticValueStyle = computed(() => (index) => {
  return {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: colors[index % colors.length],
  };
});
const deviceStatusType = {
    ALARM: "报警",
    TROUBLE: "故障",
    OFFLINE: "离线",
    NORMAL: "正常",
}
const colorList = [
  "#FFAB10",
  "#2F8DFF",
  "#F14545",
  "#19F8F7",
]
const pieData = ref([]);
// 设备实时数据
const deviceDataInfo = async () => {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
  }
    let res: any = await equipmentTotal(params);
    if (!res.deviceNum) {
        return;
    }
    levelStatistic.value.length = 0
    pieData.value.length = 0
    res.deviceStatusNums.forEach((item, index) => {
      alarmCon.value += item.num;
      levelStatistic.value.push({
            alarmStatusName: deviceStatusType[item.name],
            color: colorList[index],
            alarmNum: item.num,
        })
    })    
    res.deviceGenreNums.forEach((item, index) => {
      pieData.value.push({
            name: item.genreName,
            color: colorList[index],
            value: item.num,
        })
    })
};
// 报警状态统计&报警趋势折线图统计
const getAlarmsNumber = async()=> {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: topTimeFrame.value.dateRange.join(","),
    type: topTimeFrame.value.timeType,
  };
  let Trend = await statisticsTrend(params);
  xData.value.length = 0
  yData.value.length = 0
  Trend.forEach((item) => {
    let time = "";
    if (params.type === "TODAY") {
      time = "时";
    } else if (params.type === "THIS_YEAR") {
      time = "月";
    } else {
      time = "号";
    }
    xData.value.push(item.period + time);
    yData.value.push(item.alarmNum);
  });
}
// 异常设备清单
const abnormalEquipment = async ()=>{
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    // period:[moment().startOf("month").format('YYYY-MM-DD 00:00:00'), moment().format("YYYY-MM-DD HH:mm:ss")].join(','),
    pageSize: 10,
    pageNumber: 1, 
  };
  let {records} = await alarmStatisticsList(params);
  listData.value = records.map(item=>{
    return {
      ...item,
      alarmTime:moment(item.alarmTime).format("YYYY-MM-DD HH:mm:ss")
    }
  })
}
onMounted(()=>{
  deviceDataInfo()
  abnormalEquipment()
})
</script>
<style lang="less" scoped>
.statistic {
  display: grid;
  grid-column-gap: 10px;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  margin-top: 10px;

  .title {
    font-size: 12px;
    color: #d0deee;

    .box {
      margin-right: 8px;
    }
  }
}

.chart {
  height: 200px;
}
</style>