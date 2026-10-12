<template>
  <Teleport to="body">
    <div :class="['modal-container', className, isMinimized && 'minimized']"
      :style="{ transformOrigin:`${transformOrigin.left} ${transformOrigin.top}` }" v-show="visible"
      ref="modalContainer" v-drag>
      <!-- 弹窗内容 -->
      <div class="modal-header">
        <div class='header-title'>
          {{ title }}
        </div>
        <slot name="header-center"></slot>
        <div class="header-operate">
          <RotateRightOutlined class="operate-btn" v-if="showOpenBtn" @click.stop="emit('open')" />
          <MinusOutlined class="operate-btn" @click.stop="handleMinimize" />
          <div class="operate-btn" @click.stop="fullscreenModal" v-if="showFullscreenBtn">
            <FullscreenOutlined v-if="!isFullscreen" />
            <FullscreenExitOutlined v-else />
          </div>
          <CloseOutlined class="operate-btn" @click.stop="emit('close')" />
        </div>
      </div>
      <slot></slot>
    </div>
  </Teleport>

</template>

<script>
import { reactive, toRefs, ref, watch,onBeforeUnmount, getCurrentInstance, onMounted } from 'vue';
import {
  CloseOutlined,
  MinusOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  RotateRightOutlined
} from "@ant-design/icons-vue";
export default {
  components: {
    CloseOutlined,
    MinusOutlined,
    FullscreenOutlined,
    FullscreenExitOutlined,
    RotateRightOutlined
  },
  props: {
    className: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false,
    },
    isMinimized: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '车辆查询'
    },
    showFullscreenBtn: {
      type: Boolean,
      default: false,
    },
    showOpenBtn: {
      type: Boolean,
      default: false,
    }
  },
  setup(props, { emit, expose }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      transformOrigin: {
        top: '50%',
        left: '50%'
      },
      isFullscreen: false,
      uuid: guid(),
    })
    const modalContainer = ref(null)
    const handleMinimize = async () => {
      const taskToolEl = document.querySelector('.task-bar-tools')
      const modalRect = modalContainer.value.getBoundingClientRect()
      const taskToolRect = taskToolEl.getBoundingClientRect()
      const cloneModal = modalContainer.value.cloneNode(true)
      // emit('changeIsMinimized', !props.isMinimized)
      // const positionDiff = {
      //   top: data.top - modalRect.top + 30 + 'px',
      //   left: data.left - modalRect.left + data.width / 2 + 'px',
      // }
      // state.transformOrigin = positionDiff
      proxy.$emitter.emit("handleMinimize", {
        dom: cloneModal,
        modalRect,
        uuid: state.uuid
      });
    }
    watch(() => props.visible, () => {
      if (props.visible) {
        proxy.$emitter.on(`custom-modal-${state.uuid}`, (data) => {
          if (data === 'close') {
            emit('close')
            emit('changeIsMinimized', false)
          } else if (data === 'open') {
            emit('changeIsMinimized', false)
          } else {
            emit('changeIsMinimized', true)
            const modalRect = modalContainer.value.getBoundingClientRect()
            const positionDiff = {
              top: data.top - modalRect.top + 30 + 'px',
              left: data.left - modalRect.left + data.width / 2 + 'px',
            }
            state.transformOrigin = positionDiff
          }
        })
      }
    })
    onMounted(() => {
      proxy.$emitter.on(`custom-modal-${state.uuid}`, (data) => {
        if (data === 'close') {
          emit('close')
          emit('changeIsMinimized', false)
        } else if (data === 'open') {
          emit('changeIsMinimized', false)
        } else {
          emit('changeIsMinimized', true)
          const modalRect = modalContainer.value.getBoundingClientRect()
          const positionDiff = {
            top: data.top - modalRect.top + 30 + 'px',
            left: data.left - modalRect.left + data.width / 2 + 'px',
          }
          state.transformOrigin = positionDiff
        }
      })
    })
    const closeCustomModal = () => {
      proxy.$emitter.off(`custom-modal-${state.uuid}`)
      proxy.$emitter.emit(`custom-modal-UnMounted-${state.uuid}`)
    }
    onBeforeUnmount(() => {
      proxy.$emitter.off(`custom-modal-${state.uuid}`)
      proxy.$emitter.emit(`custom-modal-UnMounted-${state.uuid}`)
    })

    const fullscreenModal = () => {
      state.isFullscreen = !state.isFullscreen
      const dom = modalContainer.value
      state.isFullscreen ? launchFullscreen(dom) : exitFullscreen(dom)
      emit('fullscreen')
    }

    function launchFullscreen(element) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        //不同浏览器之间需要添加前缀
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullScreen();
      }
    }
    function exitFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      modalContainer.value && modalContainer.value.setAttribute('style', `transform-origin: ${state.transformOrigin.left} ${state.transformOrigin.top}`)
    }
    function guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
          v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    expose({
      closeCustomModal
    })

    return {
      handleMinimize,
      emit,
      modalContainer,
      fullscreenModal,
      ...toRefs(state)
    };
  }
};
</script>

<style lang="less">
.modal-container {
  transition: transform 0.5s ease-in-out;

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);

    .header-title {
      font-size: 18px;
      font-family: Source Han Sans CN, Source Han Sans CN-Medium;
      font-weight: Medium;
      text-align: center;
      position: relative;
      color: #ffffff;
      text-indent: 8px;

      &::before {
        height: 70%;
        width: 3px;
        content: '';
        position: absolute;
        left: 0px;
        top: 4px;
        background: #2989ff;
        margin-right: 6px;
      }
    }

    .header-operate {
      display: flex;
      align-items: center;
      color: white;
      cursor: pointer;
      gap: 12px;
    }

    .operate-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px; /* 按钮宽度 */
      height: 32px; /* 按钮高度 */
      font-size: 20px; /* 图标大小 */
      cursor: pointer;
      transition: all 0.2s;
      border-radius: 4px;
    }
  }
}

.minimized {
  transform-origin: -100px 200px;
  transform: scale(0) !important;
  transition: all .5s ease-in-out;
}
</style>