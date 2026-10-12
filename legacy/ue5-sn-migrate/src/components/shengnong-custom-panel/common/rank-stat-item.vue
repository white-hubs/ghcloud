<template>
  <div class="rank-stat-item">
    <div class="info">
      <div class="rank-market">
        <div :class="['rank','rank-'+props.rank]">{{props.rank}}</div>
        <div class="market">{{ props.name }}</div>
      </div>
      <div class="rank-value">
        <div class="value">{{props.count}}</div>
        <div class="unit" v-if="props.showChainRatio">
          <span>环比</span>
          <img :src="props.chainRatio>0? getSnImage('up.png') : getSnImage('down.png')" alt="">
          <span :class="['chainRatio',props.chainRatio>0?'up':'down']">{{Math.round(Number(props.chainRatio))}}%</span>
        </div>
      </div>
    </div>
    <div class="progress">
      <div :class="['progress-line',lineColor ? lineColor:'line-color-' + props.rank]" :style="{
        width: props.percent
      }"></div>
      <div class="progress-dot"></div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { getSnImage } from '@/utils/getImage'
import { reactive, toRefs, onMounted } from 'vue';
/**
* 数据部分
*/
const props = defineProps({
  name: {
    type: String,
    default: '销售量'
  },
  count: {
    type: Number,
    default: 0
  },
  chainRatio: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: 1
  },
  lineColor: {
    type: String,
    default: ''
  },
  percent: {
    type: String,
    default: '0%'
  },
  showChainRatio: {
    type: Boolean,
    default: true
  }
})
</script>
<style scoped lang='less'>
.rank-stat-item {
  .info {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .rank-market {
      display: flex;
      align-items: center;
      gap: 8px;

      .rank {
        width: 30px;
        line-height: 20px;
        border-radius: 2px;
        font-size: 16px;
        text-align: center;
        background: rgba(217, 231, 255, 0.10);
        border: 0.5px solid rgba(69, 133, 244, 0.80);
        border-radius: 2px;
        font-family: Roboto, Roboto-Medium;
        color: #cfd7ea;

        &.rank-1 {
          border-color: rgba(237, 73, 73, 0.5)
        }
      }

      .market {
        font-size: 17px;
        font-family: Source Han Sans CN, Source Han Sans CN-Medium;
        font-weight: Medium;
        text-align: left;
        color: #a5b6da;
        line-height: 17px;
      }
    }

    .rank-value {

      gap: 4px;
      display: flex;

      .value {
        font-size: 22px;
        font-family: D-DIN, D-DIN-Regular;
        font-weight: bold;
        text-align: left;
        color: #d2e0fd;
      }

      .unit {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 13px;
        font-family: Source Han Sans CN, Source Han Sans CN-Regular;
        font-weight: Regular;
        text-align: center;
        color: #899ba9;
        margin-top: 2.5px;

        img {
          width: 7px;
          height: 9px;
        }

        .chainRatio {
          font-size: 13px;
          font-family: Roboto, Roboto-Regular;
          font-weight: Regular;
          text-align: center;
          color: #19d9a9;

          &.up {
            color: #f14545;
          }
       
        }
      }
    }

  }

  .progress {
    width: 100%;
    height: 9px;
    margin-top: 10px;
    background: rgba(217, 231, 255, 0.1);
    border-radius: 0px 0px 0px 0px;
    display: flex;
    align-items: center;

    .progress-line {
      height: 100%;
      width: 0;
      background: linear-gradient(63deg, rgba(97, 148, 247, 0.14) 0%, rgba(148, 186, 249, 1) 100%);
      opacity: 1;
      transition: all 2s ease 1s;

      &.line-color-1 {
        background: linear-gradient(63deg, rgba(223, 85, 85, 0.14) 0%, #df5555 100%);
      }

      &.line-color-2 {
        background: linear-gradient(63deg, rgba(213, 144, 72, 0.14) 0%, #e19953 100%);
      }

      &.line-color-3 {
        background: linear-gradient(63deg, rgba(197, 171, 99, 0.14) 0%, #c5ab63 100%);
      }
    }

    .progress-dot {
      width: 24px;
      height: 24px;
      opacity: 1;
      border-radius: 50%;
      position: relative;
      background: rgba(97, 148, 247, 0.4);

      &::before {
        content: "";
        display: block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #edf4ff;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
      }
    }
  }
}
</style>