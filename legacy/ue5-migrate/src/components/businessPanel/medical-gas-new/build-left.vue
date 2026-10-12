<template>
  <div >
    <SubPanelTemplate title="设备状态总览">
      <OperateDays title="设备数" :value="alarmCon" style="margin-bottom: 10px;" />
      <GridContainer :data="levelStatistic"></GridContainer>
    </SubPanelTemplate>
    <SubPanelTemplate title="异常设备清单">
      <template #extra>
        <div class="details" @click="deviceModal=true">
          全部
        </div>
      </template>
      <RollTable :column="alarmColumn" :data="listData" :limitScrollNum="4">
      </RollTable>
    </SubPanelTemplate>
    <SubPanelTemplate title="告警设备top5统计">
      <template #extra>
        <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
      </template>
      <div class="chart">
          <barChart  :x-data="alarmType.xData"
            :data="[{ color: '#1890FF', name: '', data: alarmType.yData }]" class="columnBox" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="医用气体设备分类">
      <OperateDays title="设备总数" :value="alarmCon" />
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
  </div>
  <!-- 异常设备清单弹窗 -->
  <FailedEquipmentModal title="异常设备清单" v-if="deviceModal" v-model="deviceModal" @close="deviceModal = false"
    :footer="null" />
</template>

<script setup lang="ts">
import { ref, reactive,onMounted, computed} from 'vue'
import GridContainer from "../public/gridContainer.vue";
import OperateDays from "../public/operateDays.vue";
import RollTable from "../public/rollTable/index.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import barChart from "../public/charts/bar/barChart.vue";
import RingChart from "../public/charts/ring/ring.vue";
import FailedEquipmentModal from '@/components/businessPanel/surgical-demonstration/components/failed-equipment-modal.vue';
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from '../public/types'
import { equipmentTotal } from '@/api/equipment'
import { alarmStatisticsList } from '@/api/alarm'
import moment from 'moment'
import { useStateStore } from '@/pages/state/use-state-store';

const { globalState } = useStateStore()
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
const deviceModal = ref<boolean>(false);
const trendTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
const alarmCon = ref(0)
const levelStatistic = ref([]);
const alarmType = reactive({
    xData: ['流量报警', '温度报警', '液位报警', '超压报警'],
    yData: [380, 80, 30, 540]
})
const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
const pieData = ref([
{
    name:'流量计',
    value:10,
    color:'#29C2FF'
  },  {
    name:'压力计',
    value:20,
    color:'#74AEE7'
  },  {
    name:'报警箱',
    value:10,
    color:'#FFC700'
  },
]);
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

/**
 * 区域报警Top5
 */
const getTemplateData = async()=>{
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: trendTime.value.dateRange.join(","),
    type: trendTime.value.timeType,
  };
  // areaAlarmRank.value = res;
}

// 异常设备清单
const abnormalEquipment = async ()=>{
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
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
// 设备实时数据
const deviceDataInfo = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
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
onMounted(()=>{
  deviceDataInfo()
  abnormalEquipment()
})
</script>
<style lang="less" scoped>
.details {
  color: #74b2ff;
  font-size: 14px;
  cursor: pointer;
}

.chart {
  height: 200px;
}

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
</style>