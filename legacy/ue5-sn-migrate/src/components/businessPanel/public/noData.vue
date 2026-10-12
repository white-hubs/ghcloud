<template>
  <div class="box">
    <div class="content">
      <img :src="getAssetsImage('noData.png')" alt="" />
      <div>暂无数据</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getAssetsImage } from "../../../utils/getImage";
</script>
<style lang="less" scoped>
.box {
  width: 100%;
  height: 100%;
  min-height: 150px;
  position: relative;

  .content {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #d0deee;
    text-align: center;

    img {
      width: 97px;
      height: 112px;
    }
    div {
      margin-top: 12px;
      font-size: 16px;
    }
  }
}
</style>
