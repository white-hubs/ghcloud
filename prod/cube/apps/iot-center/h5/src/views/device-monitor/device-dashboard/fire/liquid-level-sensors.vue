<template>
  <div class="dashboard-title">现场数据</div>
  <div class="dashboard-container">
    <div class="dashboard-item" id="liquid-level-sensors-hydraulics" />
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, watch } from 'vue';
import { LiquidLevelDashboard } from '../components/dashboard/fire/liquid-level/liquid-level';
import { BaseDashboard } from '../components/base/base-dashboard';
import { nextTick } from 'vue'

const props = withDefaults(defineProps<{
  data:any;
  productPropVoList:{
    propCode: string;
    propName: string;
    dataConstraint: number[];
  }[],
  showAllElectricEnergy:boolean;
}>(),{
  data:{},
  productPropVoList:()=>[],
  showAllElectricEnergy:false
})


const dashboardInstanceMap = new Map()


const renderChartItem = ()=>{
  
  const id = `liquid-level-sensors-hydraulics`
  const dashboard = dashboardInstanceMap.get(id) 
  dashboard && dashboard.setValue(props.data['hydraulics'])
  dashboard && dashboard.render()
}


watch(()=>props.data, ()=>{
  renderChartItem()
})

onMounted(async ()=>{
  nextTick(()=>{
    const id = `liquid-level-sensors-hydraulics`
    const dashboard = new LiquidLevelDashboard({
      dom: document.getElementById(id) as HTMLElement,
      title:props.productPropVoList.find(e=>e.propCode === 'hydraulics')?.propName??'液压高度',
      code:'hydraulics',
      productPropVoList:props.productPropVoList,
      textColor:'#323233',
      titleColor:'#323233'
    })
    dashboardInstanceMap.set(id,dashboard)
    renderChartItem()
  })
})
onBeforeUnmount(()=>{
  BaseDashboard.destroyAll()
})
</script>

<style scoped lang="less">
.dashboard-title {
  color: #323233;
  font-size: 14px;
}

.dashboard-container {
  width: 100%;
  margin-bottom: 10px;
  .dashboard-item {
    text-align: center;
    text-align: -webkit-center;
    width: 98%;
  }
}
</style>