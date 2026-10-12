<template>
  <span class="verticalLine primary-color-before">{{ props.title }}</span>
</template>
<script setup lang="ts">
interface Props {
  /** 标题 */
  title?: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: ''
})
</script>
<style lang="less" scoped>
@import url('@/style/theme/color.less');

.verticalLine {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #000000;
  font-family: PingFang SC-Medium;
  &::before {
    content: "";
    display: inline-block;
    width: 3px;
    height: 18px;
    margin-right: 8px;
    vertical-align: middle;
    background-color: @blue;
  }
}
</style>
