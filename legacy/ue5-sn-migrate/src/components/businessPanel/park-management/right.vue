<template>
  <div class="panel">
    <SubPanelTemplate title="园区租赁总情况">
      <div class="flex-between mg-10">
        <PlanPie :pieData="levelPieData">
        </PlanPie>
        <PieList :roundPieData="levelPieData"></PieList>
      </div>
      <RollTable :column="columns" :data="industryStatistics" :showLength="8"> </RollTable>
    </SubPanelTemplate>
    <SubPanelTemplate title="园区租赁趋势">
      <div class="charts">
        <LineChart :x-data="xData" :series="yData" :showLegend="true" :showBackground="true" :titles="['']" gridTop="5"
          :unit="{ x: '', y: '' }" :axisPointer="true" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="园区楼层租赁比情况">
      <template #extra>
        <a-select ref="select" v-model:value="areaData" style="width: 80px" @change="getParkFloors">
          <a-select-option v-for="item in areaList" :value="item.id">{{ item.name }}</a-select-option>
        </a-select>
      </template>
      <div class="charts">
        <stackedColumn :unit="'%'" :xData="buildUtilization.xData" :yData="buildUtilization.yData"></stackedColumn>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import RollTable from "../public/rollTable/index.vue";
import PlanPie from "../public/charts/pie/planePie.vue";
import PieList from "../public/pieList.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import stackedColumn from "../public/charts/stacked-column/stackedColumn.vue";
import { parkFloors, parkLeasing, rentalTrends } from '@/api/park'
import { getAreaList } from "@/api/mdata";

const levelPieData = ref([
  {
    name:'已租赁',
    color:"#29C2FF",
    value:0
  },
  {
    name:'未租赁',
    color:"#74AEE7",
    value:0
  },
])
const columns = ref([
  {
    title: "租赁情况",
    dataIndex: "name",
    width: 120,
  },
  {
    title: "面积",
    dataIndex: "useArea",
  },
  {
    title: "占比",
    dataIndex: "useAreaRate",
  },
]);
const areaList = ref([])
const areaData = ref()
const industryStatistics = ref([])
const xData = ref<string[]>(['1','2','3','4','5','6','7'])
const yData = ref<{name:string; data: number[];}[]>([
  {
    name:'',
    data:[]
  }
])
const buildUtilization = reactive({
  xData: [],
  yData: [
    {
      name:'已租赁',
      data:[]
    },{
      name:'未租赁',
      data:[]
    },
  ],
})
const getAreaListData = async () => {
 const res = await getAreaList()
  areaList.value = res[0].children
  areaData.value = areaList.value[0].id;
}
const getParkLeasing = async () => {
  const res = await parkLeasing()
  const color = ['#29C2FF','#74AEE7']
  levelPieData.value = res.leased.map((item,index)=>{
    return {
      name:item.name,
      color:color[index],
      value:item.useArea
    }
  })
  industryStatistics.value = res.leased.map(item=>{
    return {
      name:item.name,
      useArea:item.useArea + "㎡",
      useAreaRate:item.useAreaRate + '%',
    }
  })
}
const getRentalTrends = async () => {
  const res = await rentalTrends()
  xData.value = res.xtitle.map(item => {
            return item += '月'
    });
  yData.value[0].data = res.xtitle.map(xItem=>{
      return res.rentalTrends.find(item=>item.timeFlag===xItem)?res.rentalTrends.find(item=>item.timeFlag===xItem).num:0
    })
}
const getParkFloors = async () => {
  const res = await parkFloors(areaData.value)
  buildUtilization.xData = res.map(item=>{
    return item.areaName
  })
  buildUtilization.yData[0].data = res.map(item=>{
    return item.rentedAreaRate
  })
  buildUtilization.yData[1].data = res.map(item=>{
    return item.unleasedAreaRate
  })
}
onMounted(async()=>{
 await getAreaListData()
  getParkLeasing()
  getRentalTrends()
  getParkFloors()
})
</script>
<style lang="less" scoped>
.mg-10 {
  :deep(.policeList) {
    height: auto;
  }
}

.charts {
  height: 240px;
}
</style>