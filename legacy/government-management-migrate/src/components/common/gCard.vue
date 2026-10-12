<template>
  <div class="g_card">
    <div class="title">{{ props.title }}</div>
    <slot></slot>
  </div>
</template>
<script setup lang="ts">
interface Props {
  /** 标题 */
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
});
</script>
<style lang="less" scoped>
.g_card {
  background: #fff;
  border-radius: 8px;
  .title {
    font-size: 16px;
    padding: 16px;
    color: #1c1f37;
    font-family:  PingFang SC-Medium;;
    font-weight: 500;
    border-bottom: 1px solid rgba(218, 218, 218, 1);
  }
}
</style>
