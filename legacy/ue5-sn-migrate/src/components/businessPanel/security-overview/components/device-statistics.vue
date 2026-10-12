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
        <div class="count" @click="handelClick(statistic)">
          <count-to v-if="typeof statistic.total == 'number'" :startVal="0" :endVal="statistic.total" separator=""
            :duration="4000" class="scroll-number" />
          <span v-else>
            {{ statistic.total }}
          </span>
          <span v-if="statistic.unit"> {{statistic.unit}} </span>
          <span class="ratio" v-if="statistic.ratio||statistic.ratio===0">
            环比
            <div :class="statistic.ratio ? 'triangle-up' : 'triangle-down'"></div>
            {{ statistic?.ratio }}%
          </span>
        </div>
      </div>
      <div class="list">
        <div class="list-item" v-for="item in props.statistic.itemize">
          <span class="label">{{ item.label }}</span>
          <div class="value" @click="handelClick(item)">
            <div :style="{ color: item.color, cursor: 'pointer' }">
              <count-to :startVal="0" :endVal="item.value" :duration="4000"></count-to>
            </div>
            <span class="ratio" v-if="typeof item?.ratio !== 'undefined'">
              环比
              <div :class="item.ratio ? 'triangle-up' : 'triangle-down'"></div>
              {{ item?.ratio }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { getAssetsImage, getSnImage } from "@/utils/getImage";
import CountTo from "../../public/count-to/count-to.vue";
interface Item {
  label: string;
  value: number;
  name?: string;
  ratio?: number | string;
  color?: string;
}
interface Props {
  imgPath: string;
  statistic: {
    title: string;
    total: number;
    ratio?: number | string;
    itemize?: Item[];
    unit?: string;
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
      background-image: url("/resource/v1/ue5-sn-migrate/assets/images/overView6.png");
      color: #d0deee;
      background-size: cover;

      .count {
        font-size: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
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

  .triangle-up {
    width: 0;
    height: 0;
    border-top: 5.48px solid transparent;
    border-right: 5.48px solid transparent;
    border-left: 5.48px solid transparent;
    border-bottom: 5.48px solid rgb(239, 83, 27);
    transform: translateY(-2.5px);
    margin: 0 6px;
  }

  .triangle-down {
    width: 0;
    height: 0;
    border-top: 5.48px solid #D2FFF3;
    border-right: 5.48px solid transparent;
    border-left: 5.48px solid transparent;
    border-bottom: 5.48px solid transparent;
    transform: translateY(2.5px);
    margin: 0 6px;
  }
}

.ratio {
  margin-left: 5.48px;
  font-size: 12px;
  font-family: Source Han Sans CN-Reg;
  font-weight: 400;
  color: #2AE8BD;
  display: flex;
  align-items: center;
}
</style>
