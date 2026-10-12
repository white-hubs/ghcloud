<template>
  <div class="patrol-window">
    <span class="custom-info-close" @click="close">
      <CloseOutlined />
    </span>
    <div class="custom-name">
      {{ state.patrolLocationName }}
    </div>
    <div class="custom-content" style="margin-top: 20px">
      巡更结果：<span
        :class="[
          !state.patrolDate && 'not',
          state.patrolDate && state.result === 'ABNORMAL' && 'abnormal',
          state.patrolDate && state.result === 'NORMAL' && 'normal',
        ]"
        >{{ state.patrolDate ? state.resultValue : "未巡更" }}</span
      >
    </div>
    <div class="custom-content">巡更人员：{{ state.username || "--" }}</div>
    <div class="custom-content">巡更打卡时间：{{ state.patrolTime || "--" }}</div>
  </div>
</template>

<script>
import { CloseOutlined } from "@ant-design/icons-vue";
import { defineComponent, toRefs } from "vue";
export default defineComponent({
  components: { CloseOutlined },
  name: "patrol-window",
  props: {
    state: {
      type: Object,
      default: () => {},
    },
  },
  setup(props, { emit }) {
    const close = () => {
      emit("close");
    };
    return {
      close,
    };
  },
});
</script>
<style scoped lang="less">
.not {
  color: #df6158 !important;
}

.normal {
  color: #1ec138 !important;
}

.abnormal {
  color: #eac548 !important;
}

.patrol-window {
  padding: 40px 22px 0;
  width: 300px;
  height: 229px;
  background: var(--dispatch-modal-bg, rgba(255, 255, 255, 0.98));
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: relative;
  z-index: 100;
  border: 1px solid var(--dispatch-border, #dbe4ef);
  border-radius: 8px;
  box-shadow: var(--dispatch-shadow-strong, 0 12px 32px rgba(26, 54, 93, 0.18));

  .custom-info-close {
    top: 12px;
    right: 12px;
    color: var(--dispatch-text-secondary, #64748b);
    cursor: pointer;
    position: absolute;
  }

  .custom-name {
    height: 62px;
    line-height: 62px;
    background: var(--dispatch-panel-bg-soft, #f6f9fd);
    border: 1px solid var(--dispatch-border-soft, #e8eef6);
    border-radius: 6px;
    color: var(--dispatch-text, #1f2d3d);
    font-size: 18px;
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 16px;
  }

  .custom-content {
    padding: 0 10px;
    text-align: left;
    font-size: 14px;
    color: var(--dispatch-text-secondary, #64748b);
    margin-top: 6px;
  }
}
</style>
