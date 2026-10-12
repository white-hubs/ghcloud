<template>
  <div class="sub-panel flex-column">
    <div style="border-bottom: none" class="sub-panel-header flex-between">
      <div class="title flex-between">
        <div class="mark">
          <div class="box"></div>
        </div>
        <span>{{ title }}</span>
      </div>
      <slot name="bar"></slot>
    </div>
    <div class="lineBox">
      <div></div>
      <div></div>
      <div></div>
    </div>
    <div class="sub-panel-content">
      <slot />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { withDefaults } from "vue";
interface Props {
  title?: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: "标题",
});
</script>
<style lang="less" scoped>
.sub-panel {
  width: 100%;
  &-header {
    width: 100%;
    height: 50px;

    .title {
      font-size: 18px;
      color: #ffffff;
      font-family: sourceMedium;
    }
  }

  .lineBox {
    display: flex;
    align-items: center;

    div {
      height: 0px;
      opacity: 1;
    }
  }

  .lineBox div:nth-child(1) {
    width: 24px;
    border-top: 1px solid #ffffff;
  }

  .lineBox div:nth-child(2) {
    width: 329px;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
  }

  .lineBox div:nth-child(3) {
    width: 12px;
    height: 2px;
    background: #2989ff;
    margin-left: 3px;
  }
}

.mark {
  margin-right: 10px;
  padding: 5px;
  border: 1px solid #2989ff;

  .box {
    width: 8px;
    height: 8px;
    background: #ffffff;
  }
}

.sub-panel-content {
  padding: 10px 0 0 0;
  flex: 1;
  overflow: hidden;
}

.right-bar {
  font-size: 14px;
  font-weight: 400;
  color: #74b2ff;
  line-height: 19px;
  cursor: pointer;
  user-select: none;
}
</style>
