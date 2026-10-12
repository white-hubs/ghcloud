<template>
  <g-layout title="电费配置" :show-search="false">
    <template #content-table>
      <div class="fee">
        <template v-for="(item,index) in navList" :key="index">
          <router-link v-if="item.path" :to="item.path" class="item">
            <div class="wrap">
              <span class="text">{{ item.text }}</span>
              <img :src="item.icon" class="icon">
            </div>
          </router-link>
          <div v-else class="item not">
            <div class="wrap">
              <span class="text">{{ item.text }}</span>
              <img :src="item.icon" class="icon">
            </div>
          </div>
        </template>
      </div>
    </template>
  </g-layout>
</template>
<script setup lang="ts">
import { EnergyGateList } from '@/api/loadPrediction'
import { onMounted, ref } from 'vue'

const EC = '/resource/v1/energy-consumption-migrate'
const one = `${EC}/icon_f1.png`
const two = `${EC}/icon_f2.png`
const three = `${EC}/icon_f3.png`
const four = `${EC}/icon_f4.png`

interface feeState{
  path:string;
  text:string;
  icon:string;
  type:string;
}
const navList = ref<feeState[]>([
  { path: '/feeManagement/feeSettings/electric', text: '电费配置', icon: one, type: 'electricity_meter' },
  { path: '/feeManagement/feeSettings/water', text: '水费配置', icon: two, type: 'water_meter' },
  { path: '/feeManagement/feeSettings/gas', text: '燃气费配置', icon: three, type: 'gas_meter' },
  { path: '', text: '热力费配置', icon: four, type: 'vapour' }
])
// 获取能耗配置
const queryConfig = async () => {
  const { data } = await EnergyGateList()
  const tabList = data.filter((item: { open: boolean; energyType: string; }) => {
    return item.open
  }).map((item: { energyType: string; }) => item.energyType)
  const list = navList.value.filter((item:{type:string;}) => {
    return tabList.includes(item.type)
  })
  navList.value = list
}
// 页面加载
onMounted(() => {
  queryConfig()
})
</script>
<style lang="less" scoped>
@import url('@/style/theme/color.less');
.fee{
  display: flex;
  align-items: center;
  margin: 0 8px;
  .item{
    font-size: 16px;
    flex: 1;
    margin: 16px 8px;
    cursor: pointer;
    .wrap{
      padding: 30px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .text{
      font-size: 14px;
      font-weight: 400;
      color: #000000;
      display: inline-block;
    }
    .icon{
      display: inline-block;
      width: 64px;
      height: 64px;
    }
    &:nth-child(1){
      background: linear-gradient(51deg, #FFF9F9 0%, rgba(255,249,249,0.65) 37%, #FFFDFD 100%, #FFFFFF 100%);
    }
    &:nth-child(2){
      background: linear-gradient(51deg, #F7FAFF 0%, rgba(245,249,255,0.22) 37%, #F7FAFF 100%);
    }
    &:nth-child(3){
      background: linear-gradient(51deg, #FFFAF5 0%, rgba(255,250,245,0.42) 37%, #FFFCF9 100%);
    }
    &:nth-child(4){
      background: linear-gradient(51deg, #F6F8FF 0%, rgba(246,248,255,0.42) 37%, #F8FAFF 100%);
    }
    &.not{
      cursor: not-allowed;
    }
  }
}
</style>
