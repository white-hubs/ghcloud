<template>
  <div class="toast" :style="{top:`${top}px`}" @click="handleLocate">
    <img :src="alarmIcon" alt="" />
    <span class="msg">{{message}}</span>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
const alarmIcon = '/resource/v1/command-dispatch-migrate/images/alarm-icon.png'
export default defineComponent({
  props: {
    msg: {
      type: String,
      default: 'message',
    },
    top: {
      type: Number,
      default: 200
    },
    onHide: {
      type: Function,
      default: () => { }
    },
    onLocate: {
      type: Function,
      default: () => { }
    }
  },
  setup(props, { emit }) {
    const isShow = ref(props.show)
    const message = ref(props.msg)
    const handleLocate = () => {
      props.onLocate()
      props.onHide()
    }
    return {
      isShow,
      message,
      handleLocate,
      alarmIcon
    }
  }
})
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
  background: url('/resource/v1/command-dispatch-migrate/images/toast-bg.png') no-repeat;
  background-size: 100% 100%;
  border-radius: 4px;
  color: #fff;

  .msg {
    font-size: 20px;
    font-family: YouSheBiaoTiHei-Bold, YouSheBiaoTiHei;
    font-weight: 400;
    color: #FFFFFF;
  }

  img {
    width: 40px;
    height: 40px;
  }

  .msg-button {
    font-size: 14px;
    font-family: Source Han Sans-Regular, Source Han Sans;
    font-weight: 400;
    color: #2989FF;
    margin-left: 22px;
    cursor: pointer;
  }
}
</style>
