<template>
  <view class="booking" v-if="isLogin">
    <view class="header">
      <view class="title">
        <text style="color: #1578FF;">我的</text>
        <text>访客预约</text>
      </view>
      <view class="more" @tap="toMore">
        <text>更多</text>
        <text class="iconfont">&#xe860;</text>
      </view>
    </view>
    <template v-if="reservationList.length > 0" >
      <view class="content" v-for="item in reservationList" :key="item.id" @tap="toDetail(item)">
        <view class="left">
          <view class="title">
            {{item.accessDate ? dayjs(item.accessDate).format('M.DD') : '--'}}号｜{{ item.timeStr }}
            <text :class="item.status">{{ getStatus(item)?.label }}</text>
          </view>
          <view class="desc">{{ item.areaName || item.visitorName || '--' }}</view>
        </view>
        <view class="code-wrap" v-if="item.status === 'COMPLETE'">
          <image class=code src="../../../../static/images/code.png" alt="" />
          <text>预约码</text>
        </view>
      </view>
    </template>
    <Empty v-else description='暂无我的访客预约' />
  </view>
</template>

<script setup lang="ts">
import { getVisitorInviteRecord } from '@/api';
import { computed, onMounted, ref } from 'vue';
import Empty from '@/components/empty/index.vue'
import { storeUser } from '@/store/user'
import dayjs from 'dayjs'

interface VisitorInviteRecord {
  /**
   * 访问日期
   */
  accessDate?: string;
  /**
   * 访问区域
   */
  areaId?: string;
  /**
   * 访问区域
   */
  areaName?: string;
  /**
   * 预约二维码
   */
  barCode?: string;
  /**
   * 主键
   */
  id?: number;
  /**
   * 流程实例id
   */
  processInsId?: string;
  /**
   * 状态
   */
  status?: string;
  /**
   * 访问时段
   */
  timeStr?: string;
  /**
   * 访客身份证号
   */
  visitorIdCard?: string;
  /**
   * 访客姓名
   */
  visitorName?: string;
  /**
   * 访客电话
   */
  visitorPhone?: string;
}
const InviteStatusOptions = [
  {
    label: '待处理',
    value: 'PENDING',
  },
  {
    label: '处理中',
    value: 'PROCESSING',
  },
  {
    label: '已驳回',
    value: 'REJECTED',
  },
  {
    label: '已完成',
    value: 'COMPLETE',
  },
  {
    label: '已失效',
    value: 'EXPIRED',
  }
]

const userStore = storeUser()
const toMore = () => {
  uni.navigateTo({
    url: `../web-page/web-page?type=invite&phone=${userStore.userInfo?.mobile}`
  })
}
const toDetail = (item: VisitorInviteRecord) => {
  if (item.status === 'COMPLETE') {
    const processId = item?.processInsId || ''
    uni.navigateTo({
      url: `../web-page/web-page?type=invite-detail&processId=${processId}`
    })
  }
}
const reservationList = ref<VisitorInviteRecord[]>([])
const getReservationList = async () => {
  const res = await getVisitorInviteRecord({
    pageNumber: 1,
    pageSize: 10,
    phone: userStore.userInfo?.mobile,
  })
  if(res) {
    reservationList.value = (res as {records: VisitorInviteRecord[]})?.records ?? []
  }
}
const getStatus = (item: VisitorInviteRecord)  => {
  const curState = InviteStatusOptions.find(e => e.value === item.status)
  return curState
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
  background: linear-gradient(180deg,#f3f4ff, #eff3f8 32%, #f6faff);
  border-image: linear-gradient(180deg, #ffffff, rgba(255,255,255,0.00)) 1 1;
  border-radius: 8px;
  box-shadow: 0px 0px 6px 0px rgba(0,0,0,0.04);
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
      .status{
        padding: 3px 5px;
        height: 18px;
        border-radius: 4px;
        font-size: 11px;
        line-height: 11px;
        font-family: Source Han Sans CN, Source Han Sans CN-Regular;
        font-weight: Regular;
        text-align: center;
        margin-left: 8px;
      }
      .PENDING{
        background: rgba(21,120,255,0.1);
        color: #1578FF;

        padding: 3px 5px;
        height: 18px;
        border-radius: 4px;
        font-size: 11px;
        line-height: 11px;
        font-family: Source Han Sans CN, Source Han Sans CN-Regular;
        font-weight: Regular;
        text-align: center;
        margin-left: 8px;
      }
      .PROCESSING{
        background: rgba(21,120,255,0.1);
        color: #1578FF;

        padding: 3px 5px;
        height: 18px;
        border-radius: 4px;
        font-size: 11px;
        line-height: 11px;
        font-family: Source Han Sans CN, Source Han Sans CN-Regular;
        font-weight: Regular;
        text-align: center;
        margin-left: 8px;
      }
      .REJECTED{
        background: rgba(246,151,3,0.1);
        color: #F69703;

        padding: 3px 5px;
        height: 18px;
        border-radius: 4px;
        font-size: 11px;
        line-height: 11px;
        font-family: Source Han Sans CN, Source Han Sans CN-Regular;
        font-weight: Regular;
        text-align: center;
        margin-left: 8px;
      }
      .COMPLETE{
        background: rgba(106,181,57,0.1);
        color: #52c41a;

        padding: 3px 5px;
        height: 18px;
        border-radius: 4px;
        font-size: 11px;
        line-height: 11px;
        font-family: Source Han Sans CN, Source Han Sans CN-Regular;
        font-weight: Regular;
        text-align: center;
        margin-left: 8px;
      }
      .EXPIRED{
        background: rgba(50,50,50,0.1);
        color: #323232;

        padding: 3px 5px;
        height: 18px;
        border-radius: 4px;
        font-size: 11px;
        line-height: 11px;
        font-family: Source Han Sans CN, Source Han Sans CN-Regular;
        font-weight: Regular;
        text-align: center;
        margin-left: 8px;
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
