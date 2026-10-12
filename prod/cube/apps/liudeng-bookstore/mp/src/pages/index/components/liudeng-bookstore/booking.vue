<template>
  <view class="booking" v-if="isLogin">
    <view class="header">
      <view class="title">
        <text style="color: #1578FF;">我的</text>
        <text>进馆预约</text>
      </view>
      <view class="more" @tap="toMore">
        <text>更多</text>
        <text class="iconfont">&#xe860;</text>
      </view>
    </view>
    <template v-if="reservationList.length > 0" >
      <view class="content" v-for="item in reservationList" :key="item.id" @tap="toDetail(item.id)">
        <view class="left">
          <view class="title">{{item.dayStr ? dayjs(item.dayStr).format('M.DD') : '--'}}号｜{{ item.timeStr }}</view>
          <view class="desc">{{ item.areaName }}</view>
        </view>
        <view class="code-wrap">
          <image class=code src="../../../../static/images/code.png" alt="" />
          <text>预约码</text>
        </view>
      </view>
    </template>
    <Empty v-else description='暂无我的进馆预约' />
  </view>
</template>

<script setup lang="ts">
import { getReservationRecord } from '@/api';
import type { Reservation } from '@/types';
import { computed, onMounted, ref } from 'vue';
import Empty from '@/components/empty/index.vue'
import { storeUser } from '@/store/user'
import dayjs from 'dayjs'

const userStore = storeUser()
const toMore = () => {
  uni.navigateTo({
    url: `../web-page/web-page?type=visitor-mine`
  })
}
const toDetail = (id: string | number) => {
  uni.navigateTo({
    url: `../web-page/web-page?type=visitor-detail&id=${id}`
  })
}
const reservationList = ref<Reservation[]>([])
const getReservationList = async () => {
  const res = await getReservationRecord({
    pageNumber: 1,
    pageSize: 3,
    phone: userStore.userInfo?.mobile,
    period: `${dayjs().format('YYYY-MM-DD 00:00:00')}, ${dayjs().format('YYYY-MM-DD 23:59:59')}`,
    statusList: '1,2,3'
  })
  if(res) {
    reservationList.value = (res as {data: {records: Reservation[]}})?.data.records ?? []
  }
}
const isLogin = computed(() => {
  if (userStore.authInfo) {
    return true
  }
  return false
})
onMounted(async () => {
  isLogin.value && await getReservationList()
  uni.$on('refreshList', async () => {
    isLogin.value && await getReservationList()
  })
})
</script>

<style lang="less" scoped>
.booking {
  background: linear-gradient(180deg, #e4efff, #ecf4ff 32%, #ffffff);
  border-radius: 8px;
  padding: 14px 12px 12px;
  margin: 12px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    align-content: flex-start;
    font-size: 16px;
    line-height: 19px;
    margin-bottom: 12px;
    .title{
      font-family: Douyin Sans, Douyin Sans-Regular;
    }
    .more{
      font-size: 13px;
      line-height: 13px;
      display: flex;
      align-items: center;
      .iconfont{
        font-size: 12px;
        display: inline-block;
        padding-left: 2px;
      }
    }
  }

  .content {
    background: #ffffff;
    border-radius: 8px;
    padding: 12px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    .text{
      font-size: 15px;
      color: #1f3140;
      line-height: 15px;
      margin-bottom: 10px;
    }
    .left{
      margin-right: 12px;
      .title{
        font-size: 15px;
        color: #0f181f;
        line-height: 15px;
        margin-bottom: 12px;

        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .desc{
        font-size: 13px;
        color: #a6abb0;
        line-height: 20px;

        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .code-wrap{
      color: #1578ff;
      line-height: 12px;
      font-size: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      word-break: keep-all;
      .code{
        width: 26px;
        height: 26px;
        background: #eaf4ff;
        border-radius: 4px;
        display: block;
        margin-bottom: 5px;
      }
    }
  }
}
</style>
