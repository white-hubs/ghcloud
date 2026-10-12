<template>
  <div class="round-wrap">
    <div class="info" :class="{'info2':index===1}" v-for="(item, index) in props.data">
      <div class="item">
        <img class="roate r1" :src="getAssetsImage('round.png')" alt="" />
        <img class="roate rotate" :style="{ animationDelay: (index + 4)/8 + 's' }" :src="getAssetsImage('round1.png')" alt="" />
        <img class="roate r3 rotate" :style="{ animationDelay: (index + 4)/8 + 's' }" :src="getAssetsImage('round1.png')" alt="" />
        <img class="roate r2 rotate" :style="{ animationDelay: (index + 4)/8 + 's' }" :src="getAssetsImage('round2.png')" alt="" />
        <img v-if="item.statistic.icon" class="icon aniamtion-pulse" :src="getAssetsImage(item.statistic.icon)" alt="" />
        <div v-else>
          <div v-if="typeof item.statistic.value == 'number'" >
            <CountTo :startVal="0" :endVal="item.statistic.value"
              :duration="2000" separator="" >
            </CountTo>
            <span class="unit">{{ item.statistic.unit }}</span>
          </div>
          <span v-else style="font-size: 0.1rem;">
            {{ item.statistic.value }}
          </span>
          <span class="value">{{ item.statistic.title }}</span>
        </div>
        <slot />
      </div>
      <monitor-list v-if="item.legendList" :customValue="true" :monitorData="item.legendList" @item-click="handelClick"></monitor-list>
    </div>
  </div>
</template>
<script setup lang="ts">
import { getAssetsImage } from "@/utils/getImage";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import monitorList from "@/components/businessPanel/public/monitor-list.vue"
interface Item {
  name: string;
  color: string;
  value: number;
}
interface List {
  statistic: {
    title?: string;
    value?: number|string;
    icon?: string;
    unit?: string;
  };
  legendList?: Item[];
}
interface Props {
  data: List[]
}
const props = defineProps<Props>();

const emit = defineEmits(["handelClickItemize"]);
const handelClick = (item) => {
  emit("handelClickItemize", item);
};
</script>
<style scoped lang="less">
.info2{
  transform: translateY(-20px) !important;
}
.delay {
  animation-delay: 0.3s;
}

.reverse {
  animation-direction: reverse;
}

.rotate45 {
  transform: rotate(45);
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
  animation: rotate 7s infinite linear;
}

.reverse {
  animation-direction: reverse;
}

.round-wrap {
  display: flex;
  flex-wrap: wrap;

  :deep(.monitorBox) {
    width: auto;
    margin-right: 10px;
  }

  :deep(.monitorList) {
    margin-right: 4px;
  }

  :deep(.monitorColor) {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .info {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    position: relative;
    transform: translateY(-10px);
    :deep(.arrow) {
      border: 1px dashed rgba(255, 255, 255, 0.2);
      margin-top: -20px;
      margin-right: 3px;
    }
    :deep(.monitorBox){
      cursor: pointer;
    }

    .roate {
      position: absolute;
      display: inline-block;
      width: 137px;
      height: 137px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .r1 {
      width: 157px;
      height: 157px;
      transform: translate(-50%, -50%);
    }

    .r2 {
      width: 130px;
      height: 130px;
    }

    .r3 {
      width: 110px;
      height: 110px;
      // background: rgba(255, 255, 255, 0.06);
      border-radius: 100%;
    }

    .icon {
      width: 40px;
      height: 40px;
    }

    .item {
      display: flex;
      flex-flow: column;
      justify-content: center;
      text-align: center;
      font-size: 20px;
      font-weight: 400;
      color: #FFFFFF;
      line-height: 18px;
      height: 200px;
      position: relative;

      .value {
        margin-top: 5px;
        height: 18px;
        font-size: 14px;
        font-family: Source Han Sans CN-Regular, Source Han Sans CN;
        font-weight: 400;
        color: #ABB8CB;
        line-height: 18px;
        display: block;
      }

      .wrap {
        position: relative;

      }
    }
  }

  
}</style>