<template>
  <view class="message">
    <view class="header">
      <view class="title">
        <text style="color: #FF8630;">热门</text>
        <text>资讯</text>
      </view>
      <view class="more" @tap="toMore">
        <text>更多</text>
        <text class="iconfont">&#xe860;</text>
      </view>
    </view>
    <view class="content">
      <template v-if="hotList.length > 0" >
        <view class="text" v-for="item in hotList" :key="item.id" @tap="toDetail(item.id)">
          <span class="hot">{{ item.tagName || '热' }}</span>
          {{ item.title }}
        </view>
      </template>
      <Empty v-else description='暂无热门资讯' />
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
    url: `../web-page/web-page?type=news`
  })
}
const toDetail = (id: string) => {
  uni.navigateTo({
    url: `../web-page/web-page?type=news-detail&id=${id}`
  })
}
const hotList = ref<Notice[]>([])
const getHotNotice = async () => {
  const res = await getNoticeList({
    pageNumber: 1,
    pageSize: 3,
    informationType: 'NEW_INFORMATION',
    status: 'DISPLAY'
  })
  if(res) {
    hotList.value = (res as {data: {records: Notice[]}})?.data.records ?? []
  }
}
onMounted(() => {
  getHotNotice()
  uni.$on('refreshList', async () => {
    getHotNotice()
  })
})
</script>

<style lang="less" scoped>
.message {
  background: linear-gradient(180deg,#fff2e4, #fff8f2 32%, #ffffff);
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
      margin-bottom: 16px;

      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .hot{
      background: #fff1e9;
      border-radius: 3px;
      padding: 3px;
      color: #ff7528;
      font-size: 12px;
      line-height: 12px;
    }
  }
}
</style>