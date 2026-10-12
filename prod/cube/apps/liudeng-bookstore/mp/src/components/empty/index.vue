<template>
  <view class="empty">
    <image class="img" src="../../static/empty.png"></image>
    <text class="text">{{ props.description ?? '暂无数据' }}</text>
  </view>
</template>

<script setup lang="ts">
 
 interface Props {
  description: string;
}
const props = defineProps<Props>();

</script>

<style lang="less" scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .img{
    display: inline-block;
    margin-bottom: 7px;
    width: 82px;
    height: 82px;
  }
  .text{
    font-size: 14px;
    font-family: Source Han Sans CN, Source Han Sans CN-Regular;
    font-weight: Regular;
    text-align: left;
    color: #666666;
    line-height: 14px;
  }
}
</style>