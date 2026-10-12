<template>
  <view class="announce">
    <view class="header">
      <view class="title">
        <text style="color: #1578FF;">最新</text>
        <text>公告</text>
      </view>
      <view class="more" @tap="toMore">
        <text>更多</text>
        <text class="iconfont">&#xe860;</text>
      </view>
    </view>
    <view class="content">
      <template v-if="noticeList.length > 0" >
        <view class="text" v-for="item in noticeList" :key="item.id" @tap="toDetail(item.id)">
          {{ item.title }}
        </view>
      </template>
      <Empty v-else description='暂无最新公告' />
    </view>
  </view>
</template>

<script setup lang="ts">
import { getNoticeList } from '@/api';
import type { Notice } from '@/types';
import { onMounted, ref } from 'vue';
import Empty from '@/components/empty/index.vue'

const toMore = () => {
  uni.navigateTo({
    url: `../web-page/web-page?type=notice`
  })
}
const toDetail = (id: string) => {
  uni.navigateTo({
    url: `../web-page/web-page?type=notice-detail&id=${id}`
  })
}
const noticeList = ref<Notice[]>([])
const getData = async () => {
  const res = await getNoticeList({
    pageNumber: 1,
    pageSize: 3,
    informationType: 'ANNOUNCEMENT',
    status: 'DISPLAY'
  })
  if(res) {
    noticeList.value = (res as {data: {records: Notice[]}})?.data.records ?? []
  }
}
onMounted(() => {
  getData()
  uni.$on('refreshList', async () => {
    getData()
  })
})
</script>

<style lang="less" scoped>
.announce {
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
    .text{
      font-size: 15px;
      color: #0F181F;
      line-height: 24px;
      margin-bottom: 10px;

      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
