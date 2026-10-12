<template>
  <div class="eventAlarmItem">
    <div class="top">
      <div>
        <div class="left">
        <div class="sort" :class="{ up_sort: props.sort > 3 }">{{ props.sort }}</div>
        <div class="name">
          <div :title="props.name">{{ props.name }}</div>
          <div :title="props.other">{{ props.other }}</div>
        </div>
      </div>
          <!-- <div class="name">{{ props.code }}</div> -->
      </div>
      <!-- <div class="middle">
        {{ props.code }}
      </div> -->
      <div class="right">
        <div class="count" :class="{ up_count: props.sort > 3 }">{{ props.count || '' }}</div>
        <div class="modes"  v-if="props.sn">{{ props.modes }}</div>
        <!-- uptriangle 向上三角根据Prop改变 -->
        <div :class="['downtriangle', props.linkRatio > 0 && 'uptriangle']" v-if="props.sn"></div>
        <div :class="[props.linkRatio > 0 ? 'up' : 'down']" v-if="props.sn">
          {{ (props.linkRatio || 0)+ "%" }}
        </div>
      </div>
    </div>
    <div class="line">
      <!-- up_proress 前三个一个颜色，后面一个颜色 -->
      <div class="progress" :class="{ up_proress: props.sort > 3 }" :style="proStyle(props.ratio)"></div>
      <div class="light_dot"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 事件报警列表组件
import {  computed } from "vue";
type items = {
  sort: number;
  name: string;
  count: number;
  modes: string;
  ratio: string;
  linkRatio: number;
  code?:number;
  sn?:boolean;
  other?:string;
};
const props = withDefaults(defineProps<items>(), {
  sort: 1,
  name: "事件",
  count: 0,
  modes: "环比",
  ratio: "3%",
  linkRatio: 0,
  sn:true,
});
const proStyle = computed(() => (width) => {
  return {
    width: width,
  };
});
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
      color: #e6f7ff;
      font-size: 14px;
      width: 150px;
      display: flex;
      div{
        overflow: hidden; //超出的文本隐藏
        text-overflow: ellipsis; //溢出用省略号显示
        white-space: nowrap; // 默认不换行；
        // width: 50%;
      }
    }
   .middle{
    color: #fff;
    font-size: 14px;
   }
    .right {
      display: flex;
      align-items: center;
      font-size: 16px;
      padding-right: 6px;
      .count {
        font-size: 18px;
        font-family: Roboto-Medium, Roboto;
        font-weight: 500;
        color: #2f8dff;
        line-height: 19px;
        margin-right: 6px;
        text-shadow: 0px 0px 10px #2989ff;

        &.up_count {
          color: #ffffff;
        }
      }

      .modes {
        font-size: 12px;
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
        color: #f14545;
      }

      .down {
        color: #2ae8bd;
      }
    }
  }

  .line {
    width: 332px;
    height: 3px;
    margin-top: 10px;
    background: rgba(217, 231, 255, 0.1);
    border-radius: 0px 0px 0px 0px;
    display: flex;
    align-items: center;

    .progress {
      height: 100%;
      width: 0;
      background: linear-gradient(63deg, #053570 0%, #2f8dff 100%);
      opacity: 1;
      transition: all 2s ease 1s;

      &.up_proress {
        background: linear-gradient(63deg, rgba(217, 231, 255, 0.2) 0%, #d9e7ff 100%);
      }
    }

    .light_dot {
      width: 13px;
      height: 13px;
      box-shadow: 0px 0px 2px 0px #2f8dff;
      opacity: 1;
      border-radius: 50%;
      position: relative;
      border: 1px solid #edf4ff;

      &::before {
        content: "";
        display: block;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background-color: #edf4ff;
        box-shadow: 0px 0px 4px 0px #2f8dff;
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
  color: #E6F7FF;
  background: rgba(21, 58, 105, 0.3);
  border: 1px solid #79A0D0;
}

.eventAlarmItem:nth-child(1) .top .left .sort {
  background: rgba(241, 69, 69, 0.302);
  border: 1px solid #F14545;
  color: #fff;
}

.eventAlarmItem:nth-child(2) .top .left .sort {
  background: rgba(255, 171, 16, 0.3);
  border: 1px solid #FFAB10;
  color: #fff;
}

.eventAlarmItem:nth-child(3) .top .left .sort {
  color: #fff;
  background: rgba(50, 142, 255, 0.2);
  border: 1px solid #2989FF;
}
</style>
