<template>
  <div class="panel">
    <SubPanelTemplate title="安检通道设备监控" class="alarm-event">
      <GridContainer :data="deviceStatistic"></GridContainer>
      <div class="flex-between mg-10">
        <PlanPie :pieData="monitorSituationPieData">
          <div class="content">
            <div class="total-num">{{ alarmTotal }}</div>
            <div>设备总数</div>
          </div>
        </PlanPie>
        <PieList :roundPieData="monitorSituationPieData"></PieList>
      </div>
      <div class="footer">
        <RollTable :column="column" :data="listData" :limitScrollNum="4">
        </RollTable>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备离线" class="alarm-event">
      <div class="flex-between">
        <traffic v-for="item in trafficList" :key="item.color" :trafficInfo="item"></traffic>
      </div>
      <div class="lineChart">
        <stackedBarChart :legendY="'top'" :x-data="equipmentSituation.xData" :y-data="equipmentSituation.yData" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备故障" class="alarm-event">
      <div class="flex-between">
        <traffic v-for="item in faultList" :key="item.color" :trafficInfo="item"></traffic>
      </div>
      <div class="flex-between mg-10">
        <PlanPie :pieData="faultPieData">
          <div class="content">
            <div class="total-num">{{ alarmTotal }}</div>
            <div>设备总数</div>
          </div>
        </PlanPie>
        <PieList :roundPieData="faultPieData"></PieList>
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
import RollTable from "../public/rollTable/index.vue";
import GridContainer from "../public/gridContainer.vue";
import { equipmentTotal } from '@/api/equipment'
import traffic from "../public/traffic.vue";
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
import { offlineNum } from '@/api/device'
import stackedBarChart from "../Information-release/stacked-bar-chart.vue"

const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const deviceStatusType = {
  ALARM: "报警",
  TROUBLE: "故障",
  OFFLINE: "离线",
  NORMAL: "正常",
}
const colorList = [
  "#2F8DFF",
  "#D0DEEE",
  "#FFAB10",
  "#F14545",
]
const trafficList = reactive([
  {
    color: "#2989FF",
    label: "离线",
    value: 0,
  },
  {
    color: "#F14545",
    label: "离线率",
    value: '0',
  },
]);
const faultList = reactive([
  {
    color: "#2989FF",
    label: "故障",
    value: 0,
  },
  {
    color: "#FFAB10",
    label: "故障率",
    value: '0',
  },
]);
const roundPieData = ref([]);
const roundPieList = ref([]);
const equipmentSituation = reactive({
  xData: [],
  yData: [
    {
      color: '#2F8DFF',
      name: '在线',
      data: [],
      value: 0
    },
    {
      color: '#F14545',
      name: '离线',
      data: [],
      value: 0
    }
  ]
})
const deviceStatistic = ref([]);
const alarmTotal = ref(0)
const monitorSituationPieData = ref([]);
const faultPieData = ref([]);
const column = [
  {
    title: "正常",
    dataIndex: "name",
    width: 120,
  },
  {
    title: "数量",
    dataIndex: "number",
  },
  {
    title: "占比",
    dataIndex: "value",
    width: 140,
  }
];
const listData = ref([])
// 设备实时数据
const deviceDataInfo = async () => {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
  }
  let res = await equipmentTotal(params);
  if (!res.deviceNum) {
    return;
  }
  monitorSituationPieData.value.length = 0;
  faultPieData.value.length = 0;
  deviceStatistic.value.length = 0
  listData.value.length = 0
  roundPieData.value.length = 0
  roundPieList.value.length = 0
  alarmTotal.value = 0;
  let total = 0
  res.deviceStatusNums.forEach((item, index) => {
    alarmTotal.value += item.num;
    let obj = {
      label: deviceStatusType[item.name],
      color: colorList[index],
      value: item.num,
    };
    monitorSituationPieData.value.push(obj);
    deviceStatistic.value.push({
      alarmStatusName: deviceStatusType[item.name],
      color: colorList[index],
      alarmNum: item.num,
    })
    const deviceList = {
      name: deviceStatusType[item.name],
      value: ((item.num / res.deviceNum) * 100).toFixed(2),
      number: item.num
    }
    listData.value.push(deviceList)
    if (item.name === 'NORMAL') {
      total += item.num
      let obj = {
        label: deviceStatusType[item.name],
        color: '#FFAB10',
        value: item.num,
      };
      faultPieData.value.push(obj)
    } else if (item.name === 'TROUBLE') {
      total += item.num
      faultList[0].value = item.num
      faultList[1].value = total ? ((item.num / total) * 100).toFixed(0) + '%' : '0%'
      let obj = {
        label: deviceStatusType[item.name],
        color: '#F14545',
        value: item.num,
      };
      faultPieData.value.push(obj)
    }
  });
  res.deviceGenreNums.forEach((item, index) => {
    let obj = {
      name: `${item.genreName}(${Math.round((item.num / res.deviceNum) * 10000) / 100.0
        }%)`,
      color: colorList[index],
      value: item.num,
    };
    roundPieData.value.push(obj);
    roundPieList.value.push({
      label: `${item.genreName}(${Math.round((item.num / res.deviceNum) * 10000) / 100.0
        }%)`,
      color: colorList[index],
      value: item.num,
    })
  });
};
const offLineDevice = async () => {
  const params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    applicationCode: 'SECURITY_CHECKP'
  }
  const res = await offlineNum(params)
  equipmentSituation.xData.length = 0
  equipmentSituation.yData[0].data.length = 0
  equipmentSituation.yData[1].data.length = 0
  equipmentSituation.yData[0].value = 0
  equipmentSituation.yData[1].value = 0
  trafficList[0].value = res.offlineNum
  trafficList[1].value = res.totalNum ? ((res.offlineNum / res.totalNum) * 100).toFixed(0) + '%' : '0%'
  res.areaOfflineareaOffline.forEach(item => {
    equipmentSituation.xData.push(item.areaName)
    equipmentSituation.yData[0].data.push(item.onNum)
    equipmentSituation.yData[1].data.push(item.offlineNum)
    equipmentSituation.yData[0].value += item.onNum
    equipmentSituation.yData[1].value += item.offlineNum
  })
}
onMounted(() => {
  deviceDataInfo();
  offLineDevice()
})
</script>
<style lang="less" scoped>
.mg-10 {
  margin-top: 10px;

  :deep(.policeList) {
    height: auto;
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

.lineChart {
  height: 160px;
}
</style>