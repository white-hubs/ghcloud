<template>
  <div class="toast" :style="{ top: `${top}px` }" @click="handleLocate">
    <img :src="alarmIcon" alt="" />
    <span class="msg">{{ message }}</span>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
const alarmIcon = "/resource/v1/command-dispatch-migrate/images/alarm-icon.png";
export default defineComponent({
  props: {
    msg: {
      type: String,
      default: "message",
    },
    top: {
      type: Number,
      default: 200,
    },
    onHide: {
      type: Function,
      default: () => {},
    },
    onLocate: {
      type: Function,
      default: () => {},
    },
  },
  setup(props, { emit }) {
    const isShow = ref(props.show);
    const message = ref(props.msg);
    const handleLocate = () => {
      props.onLocate();
      props.onHide();
    };
    return {
      isShow,
      message,
      handleLocate,
      alarmIcon,
    };
  },
});
</script>
<style scoped lang="less">
.toast {
  position: fixed;
  top: 200px;
  left: 50%;
  transform: translateX(-50%);
  justify-content: space-between;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 32px;
  height: 62px;
  background: var(--dispatch-modal-bg, rgba(255, 255, 255, 0.98));
  background-size: 100% 100%;
  border: 1px solid var(--dispatch-map-blue-border, #cfe0f3);
  border-radius: 4px;
  box-shadow: var(--dispatch-shadow-strong, 0 12px 32px rgba(26, 54, 93, 0.18));
  color: var(--dispatch-text, #1f2d3d);

  .msg {
    font-size: 20px;
    font-family: YouSheBiaoTiHei-Bold, YouSheBiaoTiHei;
    font-weight: 400;
    color: var(--dispatch-text, #1f2d3d);
  }

  img {
    width: 40px;
    height: 40px;
  }

  .msg-button {
    font-size: 14px;
    font-family:
      Source Han Sans-Regular,
      Source Han Sans;
    font-weight: 400;
    color: #216cc3;
    margin-left: 22px;
    cursor: pointer;
  }
}
</style>
