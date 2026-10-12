<template>
  <div class="situation-analysis flex-between">
    <div class="left">
      <div class="bg">
        <img :src="getAssetsImage('overView4.png')" alt="" />
        <img class="rotate aniamtion-electric-fan" :src="getAssetsImage(imgPath)" alt="" />
      </div>
    </div>
    <div class="right">
      <div class="total flex-between" @click="handelClick">
        <div class="title">{{ statistic.title }}</div>
        <div class="count" >
          <count-to v-if="typeof statistic.total == 'number'" :startVal="0" :endVal="statistic.total" separator=""
            :duration="4000" class="scroll-number" />
          <span v-else>
            {{ statistic.total }}
          </span>
        </div>
      </div>
      <div class="list">
        <div class="list-item" v-for="item in props.statistic.itemize">
          <span class="label">{{ item.label }}</span>
          <div class="value">
            <count-to :startVal="0" :endVal="item.value" :duration="4000"></count-to>
            <span class="rate">{{ item.name }} {{ props.statistic.total ? (item.value / props.statistic.total *
              100).toFixed(2) : '0'
            }}%</span>
            <a-progress stroke-linecap="square" type="circle"
              :percent="props.statistic.total ? (item.value / props.statistic.total * 100) : 0" :strokeWidth="20"
              :width="14" :showInfo="false" strokeColor="#2989FF" trailColor="rgba(255, 255, 255, 0.20)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { getAssetsImage } from "@/utils/getImage";
import CountTo from "../../public/count-to/count-to.vue";
interface Item {
  label: string;
  value: number;
  name?: string;
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
  font-size: 12px;

  .left {
    .bg {
      position: relative;
      width: 114px;
      height: 96px;
      perspective: 200;

      img {
        width: 100%;
        height: 100%;
      }

      .rotate {
        position: absolute;
        width: 44px;
        height: 44px;
        left: 35px;
        top: 8px;
        transform: rotateY(45deg);
      }
    }
  }

  .right {
    flex: 1;

    .total {
      width: 100%;
      height: 26px;
      background-image: url("/resource/v1/ue5-migrate/assets/images/overView6.png");
      color: #d0deee;
      cursor: pointer;

      .count {
        font-size: 24px;
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
        justify-content: space-between;
        align-items: center;
        color: #D0DEEE;
        margin-top: 8px;
        font-size: 12px;

        .label {
          color: "#ABB8CB"
        }

        .value {
          display: flex;
          align-items: center;

          .ant-progress {
            height: 14px;
            display: flex;
          }
        }

        .rate {
          box-sizing: border-box;
          padding-left: 14px;
          padding-right: 5px;
          border-left: 1px dashed rgba(255, 255, 255, 0.2);
          margin-left: 12px;
        }
      }
    }
  }
}
</style>
