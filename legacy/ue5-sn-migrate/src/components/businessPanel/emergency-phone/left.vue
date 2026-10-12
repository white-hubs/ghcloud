<template>
  <div class="panel">
    <SubPanelTemplate title="最新紧急电话">
      <div class="footer">
        <RollTable :column="column" :data="listData" :showLength="5">
          <template #fileUrl="{ record }">
            <div class="operate">
              <span @click="play(record)">播放</span>
              <span @click="cease">停止</span>
            </div>
          </template>
        </RollTable>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="电话使用趋势" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="through" @search="abnormalPassageInfo"></DateInlineForm>
      </template>
      <div class="chart">
        <LineChart :x-data="charsData.xData" :series="[
            {
              data: charsData.yData,
              linearGradientColor: ['rgb(255, 162, 0.1)', 'rgb(255, 222, 165,1)'],
            },
          ]" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备离线率">
      <div class="equipmentInfo">
        <waterPolo title="" :value="faultRate" unit="%" bgColor="#FFAF2A" color="#FFAF2A"></waterPolo>
        <deviceModule :data-list="dataList"></deviceModule>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import deviceModule from "../public/deviceModule.vue";
import waterPolo from "../public/charts/waterPolo/waterPolo.vue";
import LineChart from "../public/lineChart.vue";
import RollTable from "../public/rollTable/index.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { AlarmRateList } from '../public/types'
import useCommon from '@/components/hooks/useCommon'
import { emergencyPhone, telephoneTrends } from '@/api/securitymanagement'

const { getEquipmentNumber } = useCommon();
const column = [
  {
    title: "设备编号",
    dataIndex: "deviceCode",
    width: 100,

  },
  {
    title: "设备区域",
    dataIndex: "areaName",
    width: 120,
  },
  {
    title: "紧急电话内容",
    dataIndex: "fileUrl",
    slots: {
      customRender: "fileUrl",
    },
  }
];
const listData = ref<{ label: string; value: number; color?: string }[]>([])
const audio = ref()
const through = ref();
const faultRate = ref(10);
const charsData = reactive({
  xData: [],
  yData: [],
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
const abnormalPassageInfo = async () => {
};
const getEmergencyPhone = async () => {
 const res =  await emergencyPhone({pageSize:10,pageNumber:1 })
 listData.value = res.records
}
const getTelephoneTrends =async () => {
  const params ={
    type:through.value.timeType,
    period:through.value.dateRange.join(","),
  }
  const res = await telephoneTrends(params)
  charsData.xData = res.xtitle.map(item => {
        if (through.value.timeType === 'TODAY') {
            return item += '时'
        } else if (through.value.timeType === 'THIS_YEAR') {
            return item += '月'
        } else {
            return item
        }
    });
    charsData.yData=res.xtitle.map(xItem=>{
                return res.telephoneUsageTrends.find(item=>item.timeFlag===xItem)?res.telephoneUsageTrends.find(item=>item.timeFlag===xItem).num
:0
            });
} 
const play = (data)=>{
audio.value = new Audio(data.fileUrl);
audio.value.play();
}
const cease = ()=>{
  audio.value.pause();
}
/**
 * 设备类型分布
 */
 const equipmentStatistic = async () => {
  const res = await getEquipmentNumber();
  faultRate.value = 0
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
  getEmergencyPhone()
  getTelephoneTrends()
})
</script>
<style lang="less" scoped>
.chart {
  height: 200px;
  display: flex;
}

.equipmentInfo {
  display: flex;
  justify-content: space-between;
  padding: 10px 10px 0 30px;
  align-items: center;
}

.operate {
  color: #1890FF;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}
</style>