<template>
  <div class="panel">
    <SubPanelTemplate title="设备状态统计">
      <OperateDays title="设备总数" :value="deviceTotal" />
        <div class="chart">
          <RingChart
            :pieData="pieData"
            seriesName="设备类型统计"
            :total="deviceTotal"
          ></RingChart>
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
    <SubPanelTemplate title="巡更点漏巡点位统计">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="hiddenDangerTime"
          @search="changeHandleHiddenDangerTime"
        ></DateInlineForm>
      </template>
      <div class="lineChart">
        <barChart :title="''" :unit="''" :x-data="xData"
                    :data="[{ color: '#1890FF', name: '', data: yData }]"/>
        </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="巡更异常事件统计">
      <template #extra>
        <div class="details" @click="showAbnormalModal=true">
          查看详情
        </div>
      </template>
      <div class="footer">
         <RollTable :column="column" :data="listData" :limitScrollNum="4">
         </RollTable>
       </div>
    </SubPanelTemplate>
  </div>
  <modal-table v-if="showAbnormalModal"  :show="showAbnormalModal" title="异常事件列表" @close="showAbnormalModal=false">
    <abnormalEvents></abnormalEvents>
  </modal-table>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted,computed} from 'vue'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import OperateDays from "../public/operateDays.vue";
import RingChart from "../public/charts/ring/ring.vue";
import RollTable from "../public/rollTable/index.vue";
import modalTable from '@/components/modal-table/modal.vue'
import inspectionEquipmentStatus from "./components/inspection-equipment-status.vue";
import { statusStat , leakStat , alarmPage} from "@/api/maintain";
import abnormalEvents from "./components/abnormal-events.vue";
import barChart from "../public/charts/bar/barChart.vue";
import { ModelValueItf } from '../public/types'

const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
const deviceTotal = ref(0)
const pieData = ref([]);
const hiddenDangerTime = ref<ModelValueItf>()
const showAbnormalModal = ref(false)
const xData = ref<string[]>([]);
const yData = ref<number[]>([]);
const statisticValueStyle = computed(() => (index) => {
  return {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: colors[index % colors.length],
  };
});
const statisticStyle = computed(() => {
  return {
    fontSize: "16px",
    color: "#FFFFFF",
    paddingLeft: "16px",
  };
});
const column = [
  {
    title: "报警地点",
    dataIndex: "alarmPoint",
    width: 120,
  },
  {
    title: "报警时间",
    dataIndex: "alarmTime",
  },
  {
    title: "处理结果",
    dataIndex: "alarmResult",
    width: 140,
  }
];
const listData = ref([])
const getDeviceStatus =async () => {
  const res = await statusStat()
  pieData.value.length=0
  deviceTotal.value = 0
  pieData.value = res.map((item,index)=>{
  deviceTotal.value += item.num
    return {
      name:item.name,
      value:item.num,
      color:colors[index]
    }
  })
}
const changeHandleHiddenDangerTime =async ()=>{
 const res = await leakStat({period:hiddenDangerTime.value.dateRange.join(",")})
 xData.value.length = 0
 yData.value.length = 0
 res.forEach(item=>{
  xData.value.push(item.locationName)
  yData.value.push(item.omitNum)
 })
}
const getAlarmPage =async () => {
 const {records} = await alarmPage({pageSize:10,pageNumber:1,keyword:''})
 listData.value = records
}
onMounted(()=>{
  getDeviceStatus()
  getAlarmPage()
})
</script>
<style lang="less" scoped>
.details{
    color: #74b2ff;
    font-size: 14px;
    cursor:pointer;
}
.chart {
   width: 100%;
   height: 140px;
  }
  .lineChart{
   height: 220px;
  }
.statistic {
  display: grid;
  grid-column-gap: 10px;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  margin-top:10px;

    .title {
      font-size: 12px;
      color: #d0deee;

      .box {
        margin-right: 8px;
      }
    }
}
.footer{
  height:200px;
}
</style>