<template>
  <div class="sub-panel flex-column">
    <div class="sub-panel-header flex-start">
      <div class="make"></div>
      <span>{{ title }}</span>
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
    height: 34px;
    border-bottom: 1px solid var(--dispatch-border, #dbe4ef);
    margin-bottom: 10px;
    padding-left: 10px;
    background: var(--dispatch-panel-title-bg, linear-gradient(90deg, #1478d4 0%, #78b8ef 62%, rgba(255, 255, 255, 0) 100%));
    position: relative;
    font-family: PingFang SC-Semibold;
    border-radius: 3px 3px 0 0;
    .make {
      width: 14px;
      height: 14px;
      border: 1px solid rgba(255, 255, 255, 0.88);
      position: relative;
      &::after {
        content: "";
        width: 6px;
        height: 6px;
        background: #ffffff;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
    span {
      font-size: 15px;
      color: #ffffff;
      margin-left: 6px;
      text-shadow: none;
    }
    .extra {
      position: absolute;
      top: 10px;
      right: 10px;
    }
  }
  &-content {
    flex: 1;
    overflow: hidden;
    color: var(--dispatch-text, #26384d);
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
      background: var(--dispatch-map-blue, #216cc3);
      margin-right: 6px;
      width: 24px;
    }
    .line2 {
      position: absolute;
      bottom: -1px;
      right: 0;
      background: var(--dispatch-map-blue-border, #cfe0f3);
    }
  }
  .top-line {
    position: absolute;
    right: 0;
    top: 0;
    .line {
      background: var(--dispatch-map-blue-border, #cfe0f3);
    }
  }
}
</style>
