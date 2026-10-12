<template>
  <div class="panel">
    <SubPanelTemplate :title="props.title">
      <template #extra>
      <DateInlineForm v-model:modelValue="timeType" @search="timeDate"></DateInlineForm>
      </template>
      <div class="barChart">
        <overviewChartBar
        @clickbar="alarmClickBar"
          :bottom="'0%'"
          :title="''"
          :xData="barData.xData"
          :yData="barData.yData"
        ></overviewChartBar>
      </div>
    </SubPanelTemplate>
    <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="parameter"></modal-alarm-table>
  </div>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue";
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import { reactive, ref } from "vue";
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
import { alarmEventTypeStatisticsc } from '@/api/alarm'

const props = withDefaults(defineProps<{
  title?: string;
}>(), {
  title: '报警情况统计'
})
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const alarmModalShow = ref<boolean>(false);
let eventDataList=[]
let timeType = ref({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const parameter = reactive({
  alarmEventTypeId:'',
  dateRange:[],
})
const closeModal=()=>{
  alarmModalShow.value=false;
}
const timeDate = async () => {
  const data = await alarmEventTypeStatisticsc({
    areaId: piniaStoreArea.currentAreaId,
    period: timeType.value.dateRange.join(","),
    sceneType: piniaStoreMenu.currentMenu,
    type: timeType.value.timeType,
  });
  barData.xData = data.map((res) => {
    return res.name;
  });
  barData.yData[0].data = data.map((res) => {
    return res.totalNum;
  });
  eventDataList=data
};


const barData = reactive({
  xData: ["1", "2", "3"],
  yData: [
    {
      data: [],
      name: "",
      color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
    },
  ],
});
const alarmClickBar = (value)=>{
  const {name}=value
  const findItem =  eventDataList.find(item=>item.name===name)
  if(findItem){
    parameter.alarmEventTypeId=findItem.id
    parameter.dateRange = timeType.value.dateRange
    alarmModalShow.value=true
  }
}

</script>
<style lang="less" scoped>
.panel {
  .chart {
    height: 220px;
  }
}
.trafficBox {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 12px;
}

.parkingLot {
  display: flex;
  justify-content: space-around;
  margin-top: 30px;
}

.backgroundBox {
  width: 86px;
  height: 86px;
  background: rgba(41, 137, 255, 0.302);
  box-shadow: inset 0px 0px 10px 0px rgba(41, 137, 255, 0.6),
    inset 0px 0px 6px 0px rgba(41, 137, 255, 0.8);
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  transform: translate(-50%, -50%);

  img {
    width: 36px;
    height: 28px;
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
}
.barChart {
  height: 200px;
}
</style>
