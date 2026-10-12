<template>
  <view>
    <template v-if="isLiudengBookstore" >
      <liudeng-bookstore />
    </template>
    <template v-if="isSuzhouPolice" >
      <suzhou-police />
    </template>
  </view>
</template>

<script setup lang="ts">
import { onLoad, onPullDownRefresh, onShow } from '@dcloudio/uni-app';
import LiudengBookstore from './components/liudeng-bookstore/index.vue'
import SuzhouPolice from './components/suzhou-police/index.vue'
import { ref } from 'vue';
import { templateUI } from '@/config';

  const isLiudengBookstore = templateUI === 'liudeng-bookstore-applet-mp'
  const isSuzhouPolice = templateUI === 'suzhou-police-applet-mp'
  const scrollTop = ref(0);
  onLoad( () => {
    uni.getSystemInfo({
      success: function (res) {
        scrollTop.value = res.windowHeight - 384;
      }
    })
  })
  onShow(() => {
    uni.$emit('refreshList')
  })
  onPullDownRefresh(() => {
    uni.$emit('refreshList')
    uni.stopPullDownRefresh()
  })
</script>

<style lang="less" scoped>
page {
  height: 100vh;
}
.container {
  color: #666666;
  overflow: hidden;
  position: relative;
  background: linear-gradient(178deg,#f3f8ff 3%, #f5f6fa 95%);
}
.top{
  width: 100vw;
  height: 254px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: linear-gradient(180deg,#e0ebff 2%, #cde1fe 79%, #cde1fe 96%, rgba(205,225,254,0.00) 89%);
  .title{
    position: absolute;
    top: 130px;
    left: 34px;
    .tit-1{
      font-family: Douyin Sans, Douyin Sans-Regular;
      font-size: 20px;
      font-weight: Regular;
      color: #3d3d3e;
      line-height: 24px;
      display: block;
    }
    .tit-2{
      margin-top: 8px;
      font-size: 14px;
      display: block;
    }
  }
}
.banner{
  width: 100vw;
  height: 156px;
}
.wrapper {
  position: relative;
}
</style>
