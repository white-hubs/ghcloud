<template>
  <div class="business-name" @click="handleFullScreen">{{ state.fullscreen ? '退出全屏':'进入全屏'}}</div>
</template>
<script lang="ts" setup>
import { Modal } from "ant-design-vue";
import { onMounted, reactive } from "vue";

const emits = defineEmits(['fullscreen'])
const state = reactive({
  fullscreen: false // 是否全屏
});
// 全屏事件
const handleFullScreen = () => {
    let element = document.documentElement;
    // 判断是否已经是全屏
    if (state.fullscreen) {
        document.dispatchEvent(event);
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } 
    } else { 
        if (element.requestFullscreen) {
            element.requestFullscreen();
        }
    }
    state.fullscreen = !state.fullscreen;
}
// 创建一个带有F11键的新KeyboardEvent
const event = new KeyboardEvent('keydown', {
  key: 'F11',
});

onMounted(() => {    
   if(!navigator.userAgent.toLocaleLowerCase().includes('cube-app')&&(navigator.userAgent.toLocaleLowerCase().includes('android')||navigator.userAgent.toLocaleLowerCase().includes('ios')||navigator.userAgent.toLocaleLowerCase().includes('linux'))){
      Modal.confirm({
        title: '检查到正在使用移动端访问，是否进入全屏模式',
        centered:true,
        okText:'进入全屏',
        onOk() {
          handleFullScreen()
        },
        onCancel() {
        },
        class:'fullscreen-modal'
      });
   }
})
defineExpose({
  handleFullScreen
});
</script>
<style lang="less">
.fullscreen-modal {
  .ant-modal-content {
    background-color: white !important;
    border: unset !important;
  }
}
</style>
