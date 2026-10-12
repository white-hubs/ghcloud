<template>
     <SubPanelTemplate title="园区租售总情况" class="alarm-event">
      <div class="flex-between mg-10">
        <PlanPie :pieData="levelPieData">
          <div class="content">
            <div class="pie-center">{{ (throughNum/10000).toFixed(2) }}万㎡</div>
            <div>总使用面积</div>
          </div>
        </PlanPie>
        <PieList :roundPieData="levelPieData"></PieList>
      </div>
      <RollTable :column="columns" :data="industryStatistics" :showLength="8"> </RollTable>
    </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import PieList from "@/components/businessPanel/public/pieList.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import { rentRecordStatRentedSold } from '@/api/youxianqu-park'


const levelPieData = ref([])
const throughNum = ref(0)
const industryStatistics = ref([])
const columns = ref([
  {
    title: "租赁情况",
    dataIndex: "industry",
    width: 120,
  },
  {
    title: "面积",
    dataIndex: "num",
  },
  {
    title: "占比",
    dataIndex: "rate",
  },
]);

const changeTopTimeFrame = async()=>{
  const res = await rentRecordStatRentedSold()
  throughNum.value = res.total
  levelPieData.value = [
    {
      name: "已租赁",
      value: res.rented,
      color:'#328BF7',
    },
    {
      name: "预定",
      value: res.reserve,
      color:'#FFC700',
    },
    {
      name: "已售",
      value: res.sold,
      color:'#19F8F7',
    },
  ]
  industryStatistics.value = [
    {
      industry:'已租赁',
      num:res.rented,
      rate:res.total?((res.rented/res.total)*100).toFixed(2)+'%':0+'%'
    },
    {
      industry:'预定',
      num:res.reserve,
      rate:res.total?((res.reserve/res.total)*100).toFixed(2)+'%':0+'%'
    },
    {
      industry:'已售',
      num:res.sold,
      rate:res.total?((res.sold/res.total)*100).toFixed(2)+'%':0+'%'
    },
  ]
}
onMounted(()=>{
  changeTopTimeFrame()
})
</script>
<style lang="less" scoped>
.charts {
  width: 100%;
  height: 250px;
}

.mg-10 {
  :deep(.policeList) {
    height: auto;
  }

  .content {
    color: #fff;
    text-align: center;
    font-size: 16px;
    .pie-center{
      font-size: 18px
    }
  }
}
</style>