<template>
  <SubPanelTemplate title="师生比例">
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
import { policeStatisticsCount,criminalStatisticsCount } from '@/api/lingchuanhik'

const eventNum = ref<number>(0);
const roundPieData: any = ref([
  {
    label: "老师",
    value: 0,
    color: "#00ff00",
  },
  {
    label: "学生",
    value: 0,
    color: "#ff0000",
  }
]);

const dataList = reactive<AlarmRateList[]>([
  {
    title: "老师总数",
    value: '0人',
    ringRatio: false,
  },
  {
    title: "学生总数",
    value: '0人',
    ringRatio: false,
  },
]);

const getData = async () => {
  const police = await policeStatisticsCount()
  const criminal = await criminalStatisticsCount()
  dataList[0].value = police + '人'
  dataList[1].value = criminal + '人'
  roundPieData.value[0].value = police
  roundPieData.value[1].value = criminal
  eventNum.value = police + criminal
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