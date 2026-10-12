<template>
  <div class="dashboard-container">
    <div class="dashboard-item" :id="'fire-pressure-'+item.propCode" v-for="item in pressureData" :key="item.propCode" />
  </div>
</template>

<script lang="ts" setup>
import {  nextTick, onBeforeUnmount, onMounted, watch } from 'vue';
import { PressureDashboard } from '../components/dashboard/fire/pressure/pressure';
import { BaseDashboard } from '../components/base/base-dashboard';

const props = withDefaults(defineProps<{
  data:any;
  productPropVoList:{
    propCode: string;
    propName:string;
    dataConstraint: number[];
}[]
}>(),{
  data:{},
  productPropVoList:()=>[]
})

const pressureData = props.productPropVoList.filter(item=>item.propCode.includes('pressure'))

const dashboardInstanceMap = new Map()


const renderChartItem = (item:{propCode:string})=>{
  const id = `fire-pressure-${item.propCode}`
  const dashboard = dashboardInstanceMap.get(id) 
  dashboard && dashboard.setValue(props.data[item.propCode] ?props.data[item.propCode]: 0)
  dashboard && dashboard.render()
}

const setValue = ()=>{
  pressureData.forEach(item => renderChartItem(item))
}

const createDashBoardInstance = ()=>{
  nextTick(()=>{
    pressureData.forEach(item => {
      try {
        const id = `fire-pressure-${item.propCode}`
        const dashboard = new PressureDashboard({
          dom: document.getElementById(id) as HTMLElement,
          title:item.propName,
          code:item.propCode,
          productPropVoList:props.productPropVoList,
          textColor:'#fff'
        })
        dashboardInstanceMap.set(id,dashboard)
      } catch (error) {
        
      }
    })
    setValue()
  })
}

watch(()=>props.data,setValue)

onMounted(async ()=>{
  createDashBoardInstance()
})
onBeforeUnmount(()=>{
  BaseDashboard.destroyAll()
})
</script>

<style scoped lang="less">
.dashboard-title {
  color: #fff;
  font-size: 14px;
}
.dashboard-container{
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  .dashboard-item{
    width: 46%;
  }
}
</style>