<template>
  <div class="situation-analysis flex-between">
    <div class="left">
      <div class="bg">
        <img :src="getAssetsImage('overView4.png')" alt="" />
        <img class="rotate aniamtion-electric-fan" :src="getAssetsImage(imgPath)" alt="" />
      </div>
    </div>
    <div class="right">
      <div class="total flex-between">
        <div class="title">{{ statistic.title }}</div>
        <div class="count" @click="handelClick">
          <count-to
            v-if="typeof statistic.total == 'number'"
            :startVal="0"
            :endVal="statistic.total"
            separator=""
            :duration="4000"
            class="scroll-number"
          />
          <span v-else>
            {{ statistic.total }}
          </span>
        </div>
      </div>
      <div class="list">
        <div class="list-item" v-for="item in props.statistic.itemize">
          <div @click="handelClick(item.label)" style="margin-right: 4px;">
            <span class="label">{{ item.label }}</span>
            <span style="color: #2ae8bd">{{ item.value }}</span>
          </div>
          <div @click="handelClick(item.name)">
            <span class="rate">{{ item.name }}</span>
            <span style="color: #ffab10">{{ item.offline }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { getAssetsImage } from "@/utils/getImage";
import CountTo from "../public/count-to/count-to.vue";
interface Item {
  label: string;
  value: number;
  name?: string;
  offline: number;
}
interface Props {
  imgPath: string;
  statistic: {
    title: string;
    total: number;
    itemize?: Item[];
  };
}
const emit = defineEmits(["handelClickItemize"]);
const props = defineProps<Props>();
const handelClick = (item) => {
  emit("handelClickItemize", item);
};
</script>
<style lang="less" scoped>
.situation-analysis {
  font-size: calc(var(--font-size-scale) * 12px);

  .left {
    .bg {
      position: relative;
      width: calc(var(--font-size-scale) * 114px);
      height: calc(var(--font-size-scale) * 96px);
      perspective: 200;

      img {
        width: 100%;
        height: 100%;
      }

      .rotate {
        position: absolute;
        width: calc(var(--font-size-scale) * 44px);
        height: calc(var(--font-size-scale) * 44px);
        left: calc(var(--font-size-scale) * 35px);
        top: calc(var(--font-size-scale) * 8px);
        transform: rotateY(45deg);
      }
    }
  }

  .right {
    flex: 1;

    .total {
      width: 100%;
      height: calc(var(--font-size-scale) * 26px);
      background-image: url("/resource/v1/ue5-migrate/assets/images/overView6.png");
      color: #d0deee;

      .count {
        font-size: calc(var(--font-size-scale) * 24px);
        cursor: pointer;
      }
    }

    .list {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;

      .list-item {
        width: 100%;
        display: flex;
        cursor: pointer;
        justify-content: space-between;
        align-items: center;
        color: #d0deee;
        margin-top: 8px;
        font-size: calc(var(--font-size-scale) * 12px);
        div{
          min-width: 50%;
          display: flex;
          justify-content: space-around;
        }
        .label {
          color: "#2AE8BD";
        }

        .value {
          display: flex;
          align-items: center;

          .ant-progress {
            height: calc(var(--font-size-scale) * 14px);
            display: flex;
          }
        }

        .rate {
          box-sizing: border-box;
          padding-left: 14px;
          padding-right: 5px;
          border-left: 1px dashed rgba(255, 255, 255, 0.2);
        }
      }
    }
  }
}
</style>
