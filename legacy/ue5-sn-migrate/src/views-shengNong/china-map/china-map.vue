<template>
  <div class="fullscene">
    <div class="appMap" id="appMap"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, h } from 'vue'
import { Map3d } from './index.js'
import bus from "@/utils/bus"
import { storeArea } from "@/piniaStore/area"
import { LoadingOutlined } from '@ant-design/icons-vue'
import { getMarketList } from '@/api/shennong/compre'

</script>

<style lang='less' scoped >
  :deep(.ant-spin){
    max-height: none !important;
    margin-top: -50px;
  }
  :deep(.ant-spin-lg .ant-spin-dot){
    font-size: 36px !important;
    color: #fff !important;
  }
  :deep(.ant-spin-container::after){
    background-color: transparent !important;
  }
</style>
<style lang="less">
.fullscene {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.appMap {
  width: 100%;
  height: 100%;
  overflow: hidden;

  .mapLabel {
    font-size: 12px;
    color: #fff;
    text-shadow: 0.5px 0.5px #48c1ff;
  }

  .barLabel {
    font-size: 12px;
    color: #fff;
    text-shadow: 1px 1px #48c1ff;

    .sort {
      display: inline-block;
      width: 15px;
      height: 15px;
      border-radius: 50%;
      text-align: center;
      background-color: #fff;
      color: #000;
      text-shadow: none;
    }
  }

  .market-icon {
    font-size: 12px;
    color: #fff;
    position: relative;
    cursor: pointer;

    span {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top:-40px;
      white-space:nowrap;
      display: inline-block;
      background: url("/imgs/sn/location-bg-1.png") no-repeat;
      background-size: 100% 100%;
      padding: 6px 15px;
      min-width: 64px;
      
    }

    img {
      width: 75px;
      margin-top: -50px;
    }
  }

  .main-markert{
    white-space:nowrap;
    font-size: 18px;
    cursor: pointer;
    img {
      width: 95px;
      margin-top: -96px;
    }
    span{
      top:-65px;
      background: none;
      padding: 0;
    }
  }
}

.btn {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 999;
  color: #fff;
}
</style>
