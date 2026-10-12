<template>
  <a-tabs v-model:activeKey="activeKey" :tabBarStyle="{color:'#fff'}" >
    <a-tab-pane key="电压数据" tab="电压数据" forceRender>
    </a-tab-pane>
    <a-tab-pane key="电流数据" tab="电流数据" force-render>
    </a-tab-pane>
    <a-tab-pane key="温度数据" tab="温度数据" force-render>
    </a-tab-pane>
  </a-tabs>
  <div class="dashboard" style="height: 200px;" >
    <div class="dashboard-container" :style="{ top:activeKey === '电压数据'? 0 : '-10000px'}">
      <div class="dashboard-item" :id="'electric-'+item.code" v-for="item in state.voltage" :key="item.code" />
    </div>
    <div class="dashboard-container" :style="{ top:activeKey === '电流数据'? 0 : '-10000px'}">
      <div class="dashboard-item" :id="'electric-'+item.code" v-for="item in state.current" :key="item.code" />
    </div>
    <div class="dashboard-container" :style="{ top:activeKey === '温度数据'? 0 : '-10000px'}">
      <div class="dashboard-item" :id="'electric-'+item.code" v-for="item in state.temperature" :key="item.code" />
    </div>
  </div>

  <template v-if="showAllElectricEnergy">
    <div v-for="item in state.all" :key="item.code">
      <div class="dashboard-title">{{ item.attributiveName }}</div>
      <div class="dashboard-container" style="color:#fff">{{ item.attributeValue }}KW·h</div>
    </div>
  </template>
</template>

<script lang="ts" setup>
import { cubeSecurityManagementService } from '@/api/service';
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { VoltageDashboard } from '../components/dashboard/electric/voltage/voltage';
import { TemperatureDashboard } from '../components/dashboard/electric/temperature/temperature';
import { BaseDashboard } from '../components/base/base-dashboard';
import { CurrentDashboard } from '../components/dashboard/electric/current/current';

const props = withDefaults(defineProps<{
  data:any;
  productPropVoList:{
    propCode: string;
    dataConstraint: number[];
  }[],
  showAllElectricEnergy:boolean;
}>(),{
  data:{},
  productPropVoList:()=>[],
  showAllElectricEnergy:false
})
const activeKey = ref('电压数据')
const state = reactive<Record<string,{
  applicationCode: string;
  attributiveName: string;
  code: string;
  groupId: string;
  attributeValue?:number;
}[]>>({
  voltage: [],
  current: [],
  temperature: [],
  all:[]
})

const dashboardInstanceMap = new Map()

/** 获取属性分组 */
const getGroupAttributive = async () => {
  const res = await cubeSecurityManagementService.getGroupAttributive('ELECTRICMANAGE')
  state.voltage = res.find((data) => data.name === '电压').groupAttributiveDetailsVos
  state.current = res.find((data) => data.name === '电流').groupAttributiveDetailsVos
  state.temperature = res.find((data) => data.name === '温度').groupAttributiveDetailsVos

  state.all = res.find((data) => data.name === '总电能').groupAttributiveDetailsVos
}

const renderChartItem = (item)=>{
  const id = `electric-${item.code}`
  item.attributeValue = props.data[item.code] || 0
  
  const dashboard = dashboardInstanceMap.get(id) 
  dashboard && dashboard.setValue(item.attributeValue)
  dashboard && dashboard.render()
}
/** 设值 */
const setChartValue = () => {
  state.voltage.forEach(item=>renderChartItem(item))
  state.current.forEach(item=>renderChartItem(item))
  state.temperature.forEach(item=>renderChartItem(item))
  state.all.forEach(item=>{
    item.attributeValue = props.data[item.code] ?? 0
  })
}
const createDashBoardInstance = ()=>{
  nextTick(()=>{
    state.voltage.forEach(item => {
      try {
        const id = `electric-${item.code}`
        const dashboard = new VoltageDashboard({
          dom: document.getElementById(id),
          title:item.attributiveName,
          code:item.code,
          productPropVoList:props.productPropVoList,
          textColor:'#fff'
        })
        dashboardInstanceMap.set(id,dashboard)
      } catch (error) {
        
      }
    })
    state.current.forEach(item => {
      try {
        const id = `electric-${item.code}`
        const dashboard = new CurrentDashboard({
          dom: document.getElementById(id),
          title:item.attributiveName,
          code:item.code,
          productPropVoList:props.productPropVoList,
          textColor:'#fff'
        })
        dashboardInstanceMap.set(id,dashboard)
      } catch (error) {
        
      }
    })
    state.temperature.forEach(item => {
      try {
        const id = `electric-${item.code}`
        const dashboard = new TemperatureDashboard({
          dom: document.getElementById(id),
          title:item.attributiveName,
          code:item.code,
          productPropVoList:props.productPropVoList,
        })
        dashboardInstanceMap.set(id,dashboard)
      } catch (error) {
        
      }
    })
    setChartValue()
  })
}

watch(()=>props.data, ()=>{
  setChartValue()
})

onMounted(async ()=>{
  await getGroupAttributive()
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
.dashboard{
    position: relative;
    .dashboard-container {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    position: absolute;
    .dashboard-item {
      width: 32.5%;
    }
  }
}
</style>