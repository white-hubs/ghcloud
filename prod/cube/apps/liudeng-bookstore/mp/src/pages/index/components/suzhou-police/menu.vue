<template>
  <view class="menu">
    <view class="item" v-for="item in appList" :key="item.title" @tap="toWebApp(item.type)">
      <view>
        <text class='p1'>{{item.title}}</text>
        <text class='p2'>{{item.desc}}</text>
      </view>
      <view class="icon-wrap">
        <image style="width:40px;height: 40px;" :src="item.icon" alt="" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeUser } from '@/store/user'
const userStore = storeUser()
const appList = ref([
  { title:'访客预约', icon:'../../../../static/images/booking1.png', type:'invite', desc:'进入人员请先预约登记' },
])
const toWebApp = (type: string) => {
  if(!(userStore.userInfo && userStore.authInfo) && !(type.includes('news') || type.includes('notice'))){
    uni.showModal({
      title: '温馨提示',
      content: '您尚未登录，请先登录。',
      showCancel: false,
      confirmText: '确定'
    });
  }else{
    uni.navigateTo({
      url: `../web-page/web-page?type=invite&phone=${userStore.userInfo?.mobile}`
    })
  }
}
</script>

<style lang="less" scoped>
.menu {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  grid-gap: 14px;
  margin: 0 14px;
  margin-top: -32px;
  margin-bottom: 14px;

  .item {
    height: 68px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    color: #3d3d3e;
    font-size: 30rpx;
    line-height: 30rpx;
    background: linear-gradient(180deg,rgba(255,255,255,0.70), #ffffff);
    border-image: linear-gradient(180deg, #ffffff, #ffffff) 1 1;
    border-radius: 10px;
    backdrop-filter: blur(4px);
    border-radius: 10px;
    font-weight: 500;

  }
  .p2{
    display: block;
    margin-top: 7px;
    font-size: 10px;
    font-family: Source Han Sans CN, Source Han Sans CN-Regular;
    font-weight: Regular;
    text-align: left;
    color: #939597;
    line-height: 10px;
  }
}
</style>
