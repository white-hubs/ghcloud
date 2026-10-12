<template>
  <div class="patrol-window">
    <span class="custom-info-close" @click="close">
      <CloseOutlined />
    </span>
    <div class="custom-name">
      {{ state.patrolLocationName }}
    </div>
    <div class="custom-content" style="margin-top: 20px;">巡更结果：<span
        :class="[!state.patrolDate&&'not',state.patrolDate && state.result==='ABNORMAL'&&'abnormal',state.patrolDate&&state.result==='NORMAL'&&'normal']">{{
        state.patrolDate? state.resultValue:'未巡更'}}</span> </div>
    <div class="custom-content">巡更人员：{{ state.username || '--' }} </div>
    <div class="custom-content">巡更打卡时间：{{ state.patrolTime||'--' }} </div>
  </div>
</template>

<script>
import { defineComponent, toRefs } from "vue";
import {
  CloseOutlined,
} from "@ant-design/icons-vue";
export default defineComponent({
  components: { CloseOutlined },
  name: 'patrol-window',
  props: {
    state: {
      type: Object,
      default: () => { }
    }
  },
  setup(props, { emit }) {
    const close = () => {
      emit('close')
    }
    return {
      close
    }
  }
})
</script>
<style scoped lang="less">
.not {
  color: #DF6158 !important;
}

.normal {
  color: #1EC138 !important;
}

.abnormal {
  color: #EAC548 !important;
}

.patrol-window {
  padding: 40px 22px 0;
  width: 300px;
  height: 229px;
  background: url("/resource/v1/command-dispatch-migrate/commandDispatch/images/patrol-bg.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: relative;
  z-index: 100;

  .custom-info-close {
    top: 12px;
    right: 12px;
    color: white;
    cursor: pointer;
    position: absolute;
  }

  .custom-name {
    height: 62px;
    line-height: 62px;
    background-image: url("/resource/v1/command-dispatch-migrate/commandDispatch/images/contentBg.png");
    color: #fff;
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
    color: #e4e4e4;
    margin-top: 6px;

  }
}
</style>