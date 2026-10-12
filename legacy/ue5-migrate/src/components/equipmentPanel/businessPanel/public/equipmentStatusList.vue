<template>
  <div class="list">
    <div class="listHead">
      共检测 <span style="color: #09ebfa">{{ props.check }}</span> 项，有
      <span style="color: #ff2500">{{ props.question }}</span> 项有问题！
    </div>
    <div class="listContent">
      <vue3-seamless-scroll
        :list="props.statusList"
        :step="step"
        hover
        :singleHeight="52"
        :waitTime="waitTime"
      >
        <div class="listBody" v-for="item in props.statusList">
          <img style="width: 16px; height: 16px" :src="getAssetsImage('police.png')" />
          <div class="statusContent">{{ item }}</div>
        </div>
      </vue3-seamless-scroll>
    </div>
    <div class="detectionTime">检测时间：{{ props.detectionTime }}</div>
  </div>
</template>
<script lang="ts" setup>
import { withDefaults, defineProps, onMounted } from "vue";
import { getAssetsImage } from "../../../../utils/getImage";
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";
import scrollParmas from "../../../businessPanel/public/rollTable/scrollParmas";

interface Props {
  check: number;
  question: number;
  detectionTime: string;
  statusList: any;
}
const props = withDefaults(defineProps<Props>(), {
  check: 56,
  question: 10,
  statusList: ["近3日内，发生了离线问题"],
  detectionTime: "2022-12-12 12:12:12",
});
const { step, singleHeight, waitTime } = scrollParmas();
</script>
<style lang="less" scoped>
.list {
  .listHead {
    width: 212px;
    height: 24px;
    background: linear-gradient(
      180deg,
      rgba(161, 196, 235, 0.89) 0%,
      rgba(145, 182, 223, 0) 100%
    );
    border-radius: 0px 0px 0px 0px;
    text-align: center;
    line-height: 20px;
    color: #fff;
    font-size: 12px;
  }

  .listBody {
    width: 210px;
    height: 26px;
    background: #353e48;
    display: flex;
    align-items: center;
    color: #fff;
    font-size: 12px;
    padding: 0 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);

    .statusContent {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-left: 12px;
    }
  }

  .listContent {
    overflow: hidden;
    height: 104px;

    .listContent .listBody:last-child {
      border-bottom: none;
    }
  }

  .detectionTime {
    margin-top: 15px;
    width: 210px;
    height: 17px;
    font-size: 12px;
    font-weight: 400;
    color: #ffffff;
    line-height: 17px;
    text-align: right;
  }
}
</style>
