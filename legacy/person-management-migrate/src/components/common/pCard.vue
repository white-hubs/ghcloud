<template>
  <div class="pCard">
    <div class="info">
      <div class="title">{{ props.title }}</div>
      <div class="count">{{ props.count }}</div>
    </div>
    <div class="image">
      <slot></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
interface Props {
  /** 标题 */
  title?: string;
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  count: 0,
});
</script>
<style lang="less" scoped>
.pCard {
  background: #fff;
  width: calc(33.33333% - 10.66667px);
  border-radius: 8px;
  display: flex;
  align-items: flex-end;
  padding: 38px 28px 29px 32px;
  .info {
    flex-shrink: 0;
    .title {
      font-size: 16px;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      font-weight: 400;
      color: #333333;
    }
    .count {
      font-size: 36px;
      font-family: Roboto-Medium, Roboto;
      font-weight: 500;
      color: #333333;
      margin-top: 20px;
      margin-bottom: 20px;
    }
  }
  .image {
    margin-left: 5.2vw;
    height: 100px;
    flex: 1;
  }
}
</style>
