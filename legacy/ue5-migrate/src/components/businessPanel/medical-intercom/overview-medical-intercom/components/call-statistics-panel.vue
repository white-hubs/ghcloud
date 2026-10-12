<template>
  <SubPanelTemplate title="呼叫统计" class="call-statistics">
    <div class="list">
      <div class="item" v-for="(item,index) in callStatisticsData">
        <div class="time">{{ item.time }}</div>
        <div class="datas">
          <div class="value">
            <CountTo :startVal="0" :endVal="item.value" :duration="2000" separator="" />
          </div>
          <span class="rate" :style="{ color: item.rate > 0 ? '#F14545' : '#2AE8BD' }" v-show="index===1||index===3">
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
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { onMounted,  ref } from 'vue';
import {callStatistics} from '@/api/medical-intercom'
import { useStateStore } from "@/pages/state/use-state-store";
const { globalState } = useStateStore()

/**
 * 呼叫统计
 */
 const callStatisticsData = ref(
  [ 
    { time: "昨日", value: 0, rate: 0},
    { time: "今日", value: 0, rate: 0},
    { time: "上周", value: 0,rate: 0 },
    { time: "本周", value: 0, rate:0 }
  ]
)
const getCallStatistics=async()=>{
  let params = {
      sceneType: globalState.business.currentMenu,
      areaId: globalState.business.currentAreaId
    };
 const res= await callStatistics(params)
 callStatisticsData.value[0].value=res.yesToday
 callStatisticsData.value[1].value=res.today
 callStatisticsData.value[1].rate=res.todayRate
 callStatisticsData.value[2].value=res.yesWeek
 callStatisticsData.value[3].value=res.week
 callStatisticsData.value[3].rate=res.weekRate
}
onMounted(() => {
  getCallStatistics()
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
    display: flex;
    flex-wrap: wrap;
    justify-content:space-between;

    .item {
      width: 154px;
      height: 60px;
      background: rgba(255, 255, 255, 0.06);
      margin-bottom: 12px;
      box-sizing: border-box;
      padding-left: 12px;
      position: relative;
      margin-right: 10px;
      padding-top: 4px;

      .time {
        font-size: 14px;
        font-weight: 400;
        color: #D0DEEE;
        margin-right: 10px;
      }

      .datas {
        display: flex;
        justify-content:space-between;

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
          line-height: 30px;

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
