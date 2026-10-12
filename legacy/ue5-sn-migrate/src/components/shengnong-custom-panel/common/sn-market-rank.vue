<template>
  <div class="eventAlarmItem">
    <div class="top">
      <div>
        <div class="left">
          <div class="sort" :class="{ up_sort: props.item.sort > 3 }">{{ props.item.sort }}</div>
          <div class="name" :style="piniaStoreMarket.currentMarketName==props.item.name?'color:#6194f7':''">{{
            props.item.name }}
          </div>
        </div>
        <div class="name">{{ props.item.code }}</div>
      </div>
      <div class="right">
        <div class="count" :class="{ up_count: props.item.sort > 3 }">
          <count-to :startVal="0" :endVal="Number(props.item.count)" :duration="2000" separator="" class="count" />
        </div>
        <div class="modes" v-if="props.showRatio">{{ props.item.modes }}</div>
        <!-- uptriangle 向上三角根据Prop改变 -->
        <div v-if="props.showRatio">
          <img :src="props.item.linkRatio > 0?getSnImage('up.png'):getSnImage('down.png')" alt="">
        </div>
        <div :class="[props.item.linkRatio > 0 ? 'up' : 'down']" v-if="props.showRatio">
          <!-- {{ (props.item.linkRatio || 0)+ "%" }} -->
          <count-to :startVal="0" :endVal="Number(props.item.linkRatio)" :duration="2000" separator="" class="count" />%
        </div>
      </div>
    </div>
    <div class="line">
      <!-- up_proress 前三个一个颜色，后面一个颜色 -->
      <div class="progress" :class="{ up_proress: props.item.sort > 3 }" :style="proStyle(props.item.ratio)"></div>
      <div class="light_dot"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 事件报警列表组件
import { getSnImage } from '@/utils/getImage'
import { storeMarket } from "@/piniaStore/other";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue"

const piniaStoreMarket = storeMarket();
type items = {
  sort: number;
  code?:number
  name: string;
  count: number;
  modes?: string;
  ratio?: string;
  linkRatio?: number ;
  width:number
};

const props = withDefaults(defineProps<{
  item: items
  showRatio?: boolean
}>(), {
  item: () => ({
    sort: 1,
    name: "事件名称",
    count: 1,
    modes: "模式",
    ratio: "0.5",
    linkRatio: 0,
    width:0.5
  }),
  showRatio: true
});
const proStyle=(width)=>{
return `width:${width*100}%`
}
</script>

<style lang="less" scoped>
.eventAlarmItem {
  margin-bottom: 20px;

  .top {
    display: flex;
    justify-content: space-between;

    .left {
      display: flex;
      align-items: center;

      .sort {
        width: 30px;
        line-height: 18px;
        border-radius: 2px;
        font-size: 16px;
        text-align: center;
        line-height: 18px;
        margin-right: 11px;
        background: rgba(50, 142, 255, 0.2);
        border: 1px solid #2989ff;
        color: #2f8dff;

        &.up_sort {
          background: rgba(21, 58, 105, 0.3);
          border: 1px solid #79a0d0;
          color: #e6f7ff;
        }
      }

    }

    .name {
      color: #A5B6DA;
      font-size: 17px;
      font-weight: medium;
      width: 100%;
      overflow: hidden; //超出的文本隐藏
      text-overflow: ellipsis; //溢出用省略号显示
      white-space: nowrap; // 默认不换行；
    }

    .middle {
      color: #fff;
      font-size: 14px;
    }

    .right {
      display: flex;
      align-items: flex-end;
      font-size: 16px;

      .count {
        font-size: 22px;
        font-family: Roboto-Medium, Roboto;
        font-weight: 500;
        color: rgba(210, 224, 253, 1);
        line-height: 19px;
        margin-right: 6px;

        &.up_count {
          color: #ffffff;
        }
      }

      .modes {
        font-size: 13px;
        font-family: Source Han Sans CN-Regular, Source Han Sans CN;
        font-weight: 400;
        color: #d9e7ff;
        line-height: 21px;
        margin-right: 3px;
      }

      .downtriangle {
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 8px solid #d2fff3;
        margin-right: 3px;
        transform: rotate(180deg);
      }

      .uptriangle {
        border-bottom: 8px solid #ffcece;
        transform: rotate(0deg);
      }

      .up {
        font-size: 13px;
        color: #f14545;
      }

      .down {
        font-size: 13px;
        color: #2ae8bd;
      }
    }
  }

  .line {
    width: 100%;
    height: 9px;
    margin-top: 10px;
    background: rgba(217, 231, 255, 0.1);
    border-radius: 0px 0px 0px 0px;
    display: flex;
    align-items: center;

    .progress {
      height: 100%;
      width: 0;
      background: linear-gradient(63deg, rgba(97, 148, 247, 0.14) 0%, rgba(148, 186, 249, 1) 100%);
      opacity: 1;
      transition: all 2s ease 1s;

      &.up_proress {
        background: linear-gradient(63deg, rgba(217, 231, 255, 0.2) 0%, #d9e7ff 100%);
      }
    }

    .light_dot {
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

.eventAlarmItem .top .left .sort {
  color: #CFD7EA;
  border: 0.5px solid rgba(69, 133, 244, 0.80);
  border-radius: 2px;
  font-size: 16px !important;
}

.eventAlarmItem:nth-child(1) .top .left .sort {
  background: rgba(237, 73, 73, 0.10);
  border: 0.5px solid rgba(237, 73, 73, 0.50);
  border-radius: 2px;
  color: #CFD7EA;
}

.eventAlarmItem:nth-child(2) .top .left .sort {
  color: #CFD7EA;
  background: rgba(255, 170, 0, 0.10);
  border: 0.5px solid rgba(255, 170, 0, 0.50);
  border-radius: 2px;
}

.eventAlarmItem:nth-child(3) .top .left .sort {
  color: #CFD7EA;
  background: rgba(217, 231, 255, 0.10);
  border: 0.5px solid rgba(69, 133, 244, 0.80);
  border-radius: 2px;
}
</style>
