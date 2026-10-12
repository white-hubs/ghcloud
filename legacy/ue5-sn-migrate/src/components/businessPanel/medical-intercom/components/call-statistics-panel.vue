<template>
  <SubPanelTemplate title="呼叫统计" class="call-statistics">
    <div class="total-num">
      <img :src="getAssetsImage('circel1.png')" class="img1 rotate" />
      <img :src="getAssetsImage('circel-halo1.png')" class="img2 rotate reverse" />
      <a-progress :stroke-color="{ '0%': '#2970FF', '100%': '#c3dffc', }" :percent="30" type="circle"
        strokeLinecap="square" trailColor="rgba(255, 255, 255, 0.1)" />
      <img :src="getAssetsImage('bubble.png')" class="img3 rotate" />
      <div class="value">
        <CountTo :startVal="0" :endVal="callStatisticsData.totalNum" :duration="2000" separator="" />
        <span>呼叫总数</span>
      </div> 
    </div>
    <div class="list">
      <div class="item" v-for="item in callStatisticsData.list">
        <div class="time">{{ item.time }}</div>
        <div class="datas">
          <div class="value">
            <CountTo :startVal="0" :endVal="item.value" :duration="2000" separator="" />
          </div>
          <span class="rate" :style="{ color: item.rate > 0 ? '#F14545' : '#2AE8BD' }">
            <span class="text">环比</span>
            <CaretRightOutlined :style="{ fontSize: '12px', color: item.rate > 0 ? '#FFCECE' : '#D2FFF3' }"
              :rotate="item.rate > 0 ? -90 : 90" />
            <count-to :startVal="0" :endVal="item.rate" :duration="2000" separator="" decimals="2"></count-to>%
          </span>
        </div>
      </div>
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { CaretRightOutlined } from '@ant-design/icons-vue';
import { getAssetsImage } from '@/utils/getImage';
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { onMounted, onUnmounted, reactive } from 'vue';

/**
 * 呼叫统计
 */
const callStatisticsData = reactive({
  totalNum: 34563,
  list: [
    { time: "今日", value: 33, rate: 6.8 },
    { time: "本月", value: 1234, rate: -6.8 },
    { time: "本年", value: 34563, rate: 6.8 },
  ]
})

let timer = null
const fakeData = [
  {
    total: 34563, list: [
      { time: "今日", value: 33, rate: 6.8 },
      { time: "本月", value: 1234, rate: -6.8 },
      { time: "本年", value: 34563, rate: 6.8 },
    ]
  },
  {
    total: 34587, list: [
      { time: "今日", value: 50, rate: 6.8 },
      { time: "本月", value: 1251, rate: -6.8 },
      { time: "本年", value: 34587, rate: 6.8 },
    ]
  },
  {
    total: 34597, list: [
      { time: "今日", value: 83, rate: 6.8 },
      { time: "本月", value: 1267, rate: -6.8 },
      { time: "本年", value: 34597, rate: 6.8 },
    ]
  }
]
let fakeIndex = 1
onMounted(() => {
  timer = setInterval(() => {
    callStatisticsData.totalNum = fakeData[fakeIndex].total
    callStatisticsData.list = fakeData[fakeIndex].list
    fakeIndex++
    if (fakeIndex > fakeData.length - 1) {
      fakeIndex = 0
    }
  }, (window as any).config.pageLoopRequestTime)
})

onUnmounted(() => {
  clearInterval(timer)
})

</script>
<style scoped lang="less">
.call-statistics {
  :deep(.sub-panel-content) {
    display: flex;
    align-items: center;
    justify-content: space-around;
  }

  .total-num {
    position: relative;
    width: 159px;
    height: 153px;

    img,
    .value {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .img1 {
      width: 159px;
      height: 153px;
    }

    .img2 {
      width: 142px;
      height: 142px;
    }

    .img3 {
      width: 80px;
      height: 80px;
    }

    :deep(.ant-progress) {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-25deg);

      .ant-progress-text {
        display: none;
      }
    }

    .value {
      display: flex;
      flex-flow: column;
      align-items: center;

      :deep(.gh-count-to) {
        font-size: 20px;
        font-family: "YouSheBiaoTiHei";
        font-weight: 400;
        color: #FFFFFF;
        margin-bottom: -8px;
      }

      &:last-child {
        font-size: 12px;
        font-weight: 400;
        color: #D0DEEE;
      }
    }
  }

  .list {
    margin-top: 20px;
    .item {
      width: 154px;
      height: 60px;
      background: rgba(255, 255, 255, 0.06);
      margin-bottom: 12px;
      box-sizing: border-box;
      padding-left: 12px;
      display: flex;
      align-items: center;
      position: relative;

      .time {
        font-size: 14px;
        font-weight: 400;
        color: #D0DEEE;
        margin-right: 10px;
      }

      .datas {
        display: flex;
        flex-flow: column;
        margin-top: -15px;

        .value {
          :deep(.gh-count-to) {
            font-size: 20px;
            font-family: "YouSheBiaoTiHei";
            font-weight: 400;
            color: #FFFFFF;
          }
        }

        .rate {
          font-size: 12px;
          font-weight: 400;
          line-height: 0;
          margin-top: 0px;

          .text {
            color: #D0DEEE !important;
            margin-right: 2px;
          }
        }
      }

      &::before {
        position: absolute;
        left: 0;
        top: 0;
        width: 17px;
        height: 1px;
        background: #2970FF;
        content: '';
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: translate(-50%, -50%) rotate(0);
  }

  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.rotate {
  animation: rotate 15s infinite linear;
}

.reverse {
  animation-direction: reverse;
}
</style>
