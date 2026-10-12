<template>
  <view class="container">
    <view class="top">
      <view class="title">
        <text class="tit-1">苏州数智公安</text>
        <text class="tit-2">访客进入请先预约</text>
      </view>
      <image class="banner" src="../../../../static/suzhou-police/banner.png" alt="" />
    </view>
    <view class="wrapper">
        <menu-nav />
        <invite />
        <!-- 测试访客审批表单 -->
        <!-- <view style="text-align: center; display: flex; ">
          <input
            v-model="state.processId"
            placeholder="填写processId"
            @change="handleChange"
            style="border: 1px solid; padding: 5px 0; flex:1;" 
          />
          <view class="go-form" @tap="goForm()">跳转</view>
        </view> -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad, onPullDownRefresh, onShow } from '@dcloudio/uni-app';
import MenuNav from './menu.vue'
import invite from './invite.vue'
import { reactive, ref } from 'vue';
  const state = reactive({
    processId: ''
  })
  onLoad((options) => {
    const processId = (options as {processId: string;}).processId || '';
    autoLinkVisitorForm(processId)
  })
  // 自动跳转访客邀请表单
  const autoLinkVisitorForm = (processId: string) => {
    const validId = processId?.trim()
    if (!validId) {
      return
    }
    uni.navigateTo({
      url: `../web-page/web-page?type=streamengineH5&processId=${validId}`
    })
  }
  
  const handleChange = (event: Event) => {
    const value = (event.target as HTMLInputElement).value
    state.processId = value
  }
  const goForm = () => {
    uni.navigateTo({
      url: `../web-page/web-page?type=streamengineH5&processId=${state.processId}`
    })
  }
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
  background: linear-gradient(180deg,#dae2fe 2%, #e9f2ff 79%, #e3eeff 96%, rgba(205,225,254,0.00));
}
.top{
  width: 100vw;
  height: 294px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: linear-gradient(180deg,#dae2fe 2%, #e9f2ff 79%, #e3eeff 96%, rgba(205,225,254,0.00));
  .title{
    position: absolute;
    top: 150px;
    left: 34px;
    .tit-1{
      font-family: Source Han Sans CN, Source Han Sans CN-Medium;
      font-weight: Medium;
      font-size: 20px;
      color: #3d3d3e;
      line-height: 24px;
      display: block;
    }
    .tit-2{
      margin-top: 8px;
      display: block;
      font-size: 12px;
      font-family: Source Han Sans CN, Source Han Sans CN-Regular;
      font-weight: Regular;
      text-align: left;
      color: #939597;
      line-height: 12px;
    }
  }
}
.banner{
  width: 100vw;
  height: 196px;
}
.wrapper {
  position: relative;
}
.go-form{
  text-align: center;
  padding: 10px;
  color: #1578FF;
  text-decoration: underline;
}
</style>
