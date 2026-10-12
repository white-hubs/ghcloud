<template>
  <div class="patrol-situation flex-between">
    <div class="left">
      <div class="bg">
        <img :src="getAssetsImage('overView7.png')" />
        <div class="statistic">
          <div class="title">{{ statistic.title }}</div>
          <div class="count">
            <count-to
              :startVal="0"
              :endVal="statistic.total"
              :duration="4000"
              class="scroll-number"
            ></count-to>
          </div>
        </div>
      </div>
    </div>
    <div class="right">
      <div class="list">
        <div class="list-item flex-between" v-for="item in statistic.itemize">
          <div class="label">{{ item.label }}</div>
          <div class="value" :style="{ color: item.color }">
            <count-to
              :startVal="0"
              :endVal="item.value"
              :duration="4000"
              class="scroll-number"
            ></count-to>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { getAssetsImage } from "../../../utils/getImage";
import { CountTo } from "vue3-count-to";
interface Item {
  label: string;
  value: number;
  color: string;
}
interface Props {
  statistic: {
    title: string;
    total: number;
    itemize: Item[];
  };
}
const props = defineProps<Props>();
</script>
<style lang="less" scoped>
.patrol-situation {
  font-size: 12px;
  margin: 10px 0;
  .left {
    .bg {
      position: relative;
      width: 114px;
      height: 96px;
      .statistic {
        width: 100%;
        position: absolute;
        top: 10px;
        left: 0;
        .title {
          width: 100%;
          height: 24px;
          color: #ffffff;
          text-align: center;
          background: linear-gradient(
            92deg,
            rgba(41, 137, 255, 0) 0%,
            rgba(41, 137, 255, 0.92) 54%,
            rgba(41, 137, 255, 0) 99%,
            rgba(216, 216, 216, 0) 100%
          );
          border-image: linear-gradient(
              270deg,
              rgba(41.00399874150753, 137.00221091508865, 255, 0),
              rgba(135.04800617694855, 189.02640491724014, 255, 1),
              rgba(135.00000715255737, 189.00000393390656, 255, 0)
            )
            1 1;
        }
        .count {
          font-size: 24px;
          color: #ffffff;
          width: 100%;
          text-align: center;
        }
      }
    }
  }
  .right {
    margin-left: 10px;
    flex: 1;
    .list {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      &-item {
        width: 40%;
        height: 30px;
        .label {
          color: #abb8cb;
        }
      }
    }
  }
}
</style>
