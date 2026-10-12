<template>
  <div class="eventItem">
    <div class="top">
      <div>
        <div class="left">
          <div class="name" :style="piniaStoreMarket.currentMarketName==props.name?'color:#6194f7':''">{{ props.name }}
          </div>
        </div>
      </div>
      <div class="right">
        <div class="count" :class="{ up_count: props.sort > 3 }">{{ props.count }}</div>
        <div class="modes">{{ props.modes }}</div>
        <template v-if="props.radio">
          <!-- uptriangle 向上三角根据Prop改变 -->
          <div>
            <img :src="props.radio > 0?getSnImage('up.png'):getSnImage('down.png')" alt="">
          </div>
          <div :class="[props.radio > 0 ? 'up' : 'down']">
            {{ (props.linkRatio || 0)+ "%" }}
          </div>
        </template>
      </div>
    </div>
    <div class="line">
      <div class="progress" :style="proStyle(props)"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 事件报警列表组件
import { getSnImage } from '@/utils/getImage'
import { storeMarket } from "@/piniaStore/other";
const piniaStoreMarket = storeMarket();


type items = {
  sort: number;
  name: string;
  count: number;
  modes?: string;
  linkRatio?: number ;
  code?:number
  sn?:boolean
  width:number
  lineColor?:string[]
};

const props = withDefaults(defineProps<items>(), {
  sort: 1,
  name: "事件",
  count: 33,
  modes: "",
  radio: 0,
  lineColor:()=>['rgba(247,160,59,0)','rgba(247,160,59,1)'],
  width:0.2
});
const proStyle=(style)=>{
return `width:${style.width*100}%;background: linear-gradient(63deg, ${style.lineColor?.[0]} 0%, ${style.lineColor?.[1]} 100%);`
}
</script>

<style lang="less" scoped>
.eventItem {
  margin-bottom: 20px;
  padding: 6px;
  background: linear-gradient(296deg, rgba(77, 115, 197, 0.21) 9%, rgba(82, 120, 203, 0.01) 81%);
  border: 1px solid;
  border-image: linear-gradient(284deg, rgba(127, 158, 226, 0.26) 8%, rgba(118, 160, 252, 0.25) 89%, rgba(117, 161, 255, 0.00) 91%);
  border-left: none;
  cursor: pointer;

  .top {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    .left {
      display: flex;
      align-items: center;

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

    .right {
      display: flex;
      align-items: flex-end;
      font-size: 16px;

      .count {
        font-size: 22px;
        font-family: D-DIN, D-DIN-Regular;
        font-weight: bold;
        color: rgba(210, 224, 253, 1);
        margin-right: 6px;
        line-height: 26px;

        &.up_count {
          color: #ffffff;
        }
      }

      .modes {
        font-size: 14px;
        font-family: Source Han Sans CN, Source Han Sans CN-Regular;
        font-weight: Regular;
        color: #899ba9;
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
    height: 10px;
    margin-top: 5px;
    background: rgba(217, 231, 255, 0.1);
    border-radius: 0px 0px 0px 0px;
    display: flex;
    align-items: center;
    position: relative;
    clip-path: polygon(0% 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);

    .progress {
      height: 100%;
      width: 0;
      background: linear-gradient(63deg, rgba(97, 148, 247, 0.14) 0%, rgba(148, 186, 249, 1) 100%);
      opacity: 1;
      transition: all 2s ease 1s;
      clip-path: polygon(0% 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
    }
  }
}
</style>
