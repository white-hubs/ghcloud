<template>
  <div class="showPanel">
    <div class="bg">
      <img width="223" height="132" :src="getAssetsImage('overView4.png')" alt="" />
      <img class="rotate" :src="getAssetsImage(bgImg)" alt="" v-if="showimg" />
    </div>
    <div
      class="blister"
      :class="classList[index]"
      v-for="(item, index) in props.contentList"
      @click="emitEvent(item)"
    >
      <div class="ball">
        <img style="width: 100%" :src="getAssetsImage('overView15.png')" alt="" />
        <count-to
          :startVal="0"
          :endVal="item.value"
          :duration="2000"
          separator=""
        ></count-to>
      </div>
      <div class="blisterTitle">{{ item.name }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { getAssetsImage } from "../../../utils/getImage";
import CountTo from "./count-to/count-to.vue";
const classList = ["top", "right", "left", "bottom", "mid"];

interface list {
  name: string;
  value: number;
}
interface Props {
  contentList: list[];
  bgImg: string;
  showimg: boolean;
}
const emit = defineEmits(["itemClick"]);
const props = withDefaults(defineProps<Props>(), {
  showimg: true,
});
const emitEvent = (item)=>{
  emit("itemClick",item);
}
</script>
<style lang="less" scoped>
.showPanel {
  position: relative;
  height: 200px;

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
    cursor: pointer;
    width: 70px;
    animation-name: floating;
    animation-duration: 3s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;

    .ball {
      width: 100%;
      height: 70px;
      position: relative;

      :deep(.gh-count-to) {
        font-size: 20px;
        font-family: "YouSheBiaoTiHei";
        font-weight: 400;
        color: #ffffff;
        position: absolute;
        top: 50%;

        left: 50%;
        transform: translate(-50%, -50%);
      }

      div {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        position: absolute;
        font-size: 18px;
        color: #fff;
        font-family: YouSheBiaoTiHei-Bold, YouSheBiaoTiHei;
      }
    }

    .blisterTitle {
      height: 24px;
      background: linear-gradient(
        270deg,
        rgba(41, 112, 255, 0) 0%,
        rgba(41, 112, 255, 0.7) 54%,
        rgba(41, 112, 255, 0) 100%
      );
      font-size: 12px;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      text-align: center;
      line-height: 24px;
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
  top: 10px;
}

.left {
  top: 50px;
  left: 250px;
}

.right {
  left: 50px;
  top: 100px;
}

.bottom {
  left: 150px;
  top: 100px;
}
.mid {
  left: 130px;
  top: 5px;
}
</style>
