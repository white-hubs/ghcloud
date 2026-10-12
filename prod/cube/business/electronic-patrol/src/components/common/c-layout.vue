<template>
  <div class="container_la">
    <div class="layout-header">
      <div class="header-name">
        <g-vertical-line :title="props.title" />
      </div>
      <div class="header-btn">
        <slot name="header-btn" />
      </div>
    </div>
    <div class="content">
      <slot name="content" />
    </div>
    <slot />
  </div>
</template>

<script lang="ts">
import GVerticalLine from './g-vertical-line.vue'
interface Props {
  /** 标题 */
  title?: string;
}
</script>
<script setup lang="ts">

const props = withDefaults(defineProps<Props>(), {
  title: ''

})
</script>
<style lang="less" scoped>
.container_la {

  position: relative;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  background: #ffffff;

  > div {
    width: 100%;

    &.layout-header {

      height: 46px;
      display: flex;
      padding: 0 10px;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f3f3f3;
      font-family: "SourceHanSansCN-Medium-2";
      .ant-btn {
        margin-left: 14px;
      }
    }}}
.content{
  // background-color: red;
  margin-top: 5px;
}
</style>
