<template>
  <div class="situation-analysis flex-between">
    <div class="left">
      <div class="bg">
        <img :src="getAssetsImage('overView4.png')" alt="" />
        <img class="rotate" :src="getAssetsImage(imgPath)" alt="" />
      </div>
    </div>
    <div class="right">
      <div class="total flex-between">
        <div class="title">{{ statistic.title }}</div>
        <div class="count" @click="clickNum">
          <count-to
            :startVal="0"
            :endVal="statistic.total"
            :duration="4000"
            class="scroll-number"
          ></count-to>
        </div>
      </div>
      <div class="list">
        <div
          class="list-item flex-between"
          v-for="item in statistic.itemize"
          @click="clickNum(item)"
        >
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
  imgPath: string;
  statistic: {
    title: string;
    total: number;
    itemize: Item[];
  };
}
const emit = defineEmits(["clickNum"]);
const props = defineProps<Props>();
const clickNum = (item?: any) => {
  emit("clickNum", item);
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
      .count {
        font-size: 24px;
        cursor: pointer;
      }
    }
    .list {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      &-item {
        width: 40%;
        height: 30px;
        cursor: pointer;
        .label {
          color: #abb8cb;
        }
      }
    }
  }
}
</style>
