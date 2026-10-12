<template>
  <SubPanelTemplate title="外来人员概况">
    <deviceModule :data-list="dataList"></deviceModule>
    <div class="equipmentAlarm">
        <RoundPie :eventNum="eventNum" :data="roundPieData">
          <div class="content">
            <span>{{ eventNum }}</span> <br />总人数
          </div>
        </RoundPie>
        <pieList :roundPieData="roundPieData"></pieList>
      </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import deviceModule from "../public/deviceModule.vue";
import { AlarmRateList } from "../public/types";
import RoundPie from "../public/charts/roundPie/roundPie.vue";
import pieList from "../public/pieList.vue";
import { areaTodayUserStat, personnelTodayReasonStat } from '@/api/lingchuanhik'

const colors = ['#306CCA', '#3590FF', '#19F8F7', '#2AE8BD', '#FFC700', '#FF6E23']
const eventNum = ref<number>(0);
const roundPieData: any = ref([
  {
    label: "今日进校",
    value: 0,
    color: "#00ff00",
  },
  {
    label: "当前在校",
    value: 0,
    color: "#ff0000",
  }
]);

const dataList = ref<AlarmRateList[]>([
  {
    title: "今日进校",
    value: '0人',
    ringRatio: false,
  },
  {
    title: "当前在校",
    value: '0人',
    ringRatio: false,
  },
]);
const getData = async() => {
  const data = await areaTodayUserStat({type:3})
  const res = await personnelTodayReasonStat()
  
  if (data) {
    dataList.value[0].value = (data?.enter||0)+'人'
    dataList.value[1].value = (data?.leave||0)+'人'
  }
  eventNum.value = 0
  roundPieData.value = res.map((e,i)=>{
  eventNum.value += e.total
    return {
      label: e.visitReason,
      value: e.total,
      color:colors[i]
    }
  })
}
onMounted(() => {
  getData()
})

</script>
<style lang="less" scoped>
.deviceList{
  display: flex;
  justify-content: space-between;
}
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;

  .content {
    font-size: 12px;
  }
}
</style>