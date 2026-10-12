<template>
  <div class="sub-panel flex-column">
    <div class="sub-panel-header flex-start">
      <div class="make"></div>
      <slot name="title">
        <span>{{ title }}</span>
      </slot>
      <div class="extra">
        <slot name="extra"></slot>
      </div>
      <div class="bottom-line flex-end">
        <div class="line line1"></div>
        <div class="line line2"></div>
      </div>
    </div>
    <div class="sub-panel-content">
      <slot />
    </div>
  </div>
</template>
<script>
import { defineComponent, reactive, toRefs } from "vue";
export default defineComponent({
  props: {
    title: {
      type: String,
      default: "",
    },
  },
  setup() {
    const state = reactive({});
    return {
      ...toRefs(state),
    };
  },
});
</script>

<style lang="less" scoped>
.flex-start {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.sub-panel {
  width: 100%;
  height: 100%;
  overflow: hidden;
  &-header {
    flex: 0 0 50px;
    box-sizing: border-box;
    height: 50px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    margin-bottom: 10px;
    padding-left: 10px;
    // background: rgba(18, 30, 30, 0.3);
    position: relative;
    font-family: PingFang SC-Semibold;
    .make {
      width: 16px;
      height: 16px;
      border: 1px solid rgba(56, 122, 242, 1);
      position: relative;
      &::after {
        content: "";
        width: 6px;
        height: 6px;
        background: white;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
    span {
      font-size: 18px;
      color: white;
      margin-left: 4px;
      text-shadow: 0 0 4px #2989ff;
    }
    .extra {
      position: absolute;
      top: 10px;
      right: 10px;
    }
  }
  &-content {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  .line {
    width: 6px;
    height: 2px;
  }
  .bottom-line {
    .line1 {
      position: absolute;
      bottom: -1px;
      left: 0;
      background: white;
      margin-right: 6px;
      width: 24px;
    }
    .line2 {
      position: absolute;
      bottom: -1px;
      right: 0;
      background: rgba(56, 122, 242, 1);
    }
  }
  .top-line {
    position: absolute;
    right: 0;
    top: 0;
    .line {
      background: rgba(56, 122, 242, 1);
    }
  }
}
</style>
