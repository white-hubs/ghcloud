<template>
  <div class="showPanel">
    <div class="bg">
      <img style="width: 1.1614583333333333rem;height: 0.6875rem;" :src="getAssetsImage('overView4.png')" alt="" />
      <img class="rotate" :src="getAssetsImage(bgImg)" alt="" v-if="showimg" />
    </div>
    <div
      class="blister"
      :class="classList[index]"
      v-for="(item, index) in props.contentList"
    >
      <div class="ball">
        <img style="width: 100%" :src="getAssetsImage('overView15.png')" alt="" />
        <span v-if="typeof item.value === 'string'" class="ball-value" >{{ item.value }}</span>
        <count-to
          v-else
          :startVal="0"
          :endVal="Number(item.value)"
          :duration="2000"
          separator=""
        ></count-to>
        <span v-if="typeof item.value == 'number'" class="percentage">%</span>
      </div>
      <div class="blisterTitle">{{ item.name }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { getAssetsImage } from "../../../utils/getImage";
import CountTo from "./count-to/count-to.vue";
const classList = ["right","mid", "left", "top",  "bottom"];

interface list {
  name: string;
  value: number | string;
}
interface Props {
  contentList: list[];
  bgImg: string;
  showimg: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  showimg: true,
});
</script>
<style lang="less" scoped>
.showPanel {
  position: relative;
  height: 250px;

  .bg {
    position: absolute;
    height: 132px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    .rotate {
      position: absolute;
      width: 68px;
      height: 68px;
      left: 35px;
      top: 8px;
      top: 20%;
      left: 50%;
      transform: translate(-50%, -50%);
      position: absolute;
    }
  }

  .blister {
    position: absolute;
    width: calc(var(--font-size-scale) * 70px);
    animation-name: floating;
    animation-duration: 3s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;

    .ball {
      width: 100%;
      height: calc(var(--font-size-scale) * 70px);
      position: relative;
      :deep(.gh-count-to),.ball-value {
        font-size: calc(var(--font-size-scale) * 16px);
        font-family: "YouSheBiaoTiHei";
        font-weight: 400;
        color: #ffffff;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-80%, -50%);
      }
      .ball-value{
        transform: translate(-50%, -50%);
      }
      div {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        position: absolute;
        font-size: calc(var(--font-size-scale) * 18px);
        color: #fff;
        font-family: YouSheBiaoTiHei-Bold, YouSheBiaoTiHei;
      }
    }

    .blisterTitle {
      height: calc(var(--font-size-scale) * 24px);
      white-space: nowrap;
      background: linear-gradient(
        270deg,
        rgba(41, 112, 255, 0) 0%,
        rgba(41, 112, 255, 0.7) 54%,
        rgba(41, 112, 255, 0) 100%
      );
      font-size: calc(var(--font-size-scale) * 12px);
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      text-align: center;
      line-height: calc(var(--font-size-scale) * 24px);
      color: #d0deee;
      margin-top: 6px;
    }
  }

  @keyframes floating {
    from {
      transform: translateY(0);
    }

    50% {
      transform: translateY(-20px);
    }

    to {
      transform: translateY(0);
    }
  }
}

.top {
  top: 30px;
  left: 10px;
}

.left {
  top: 90px;
  right: 0;
}

.right {
  left: 75px;
  top: 130px;
}

.bottom {
  left: 55%;
  top: 120px;
}
.mid {
  left: 40%;
  top: 0px;
}
.percentage {
  position: absolute;
  color: #ffff;
  top: 38%;
  right: 20%;
  font-size: calc(var(--font-size-scale) * 14px);
  font-family: "YouSheBiaoTiHei";
}
</style>
