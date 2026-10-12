<template>
    <div class="business-name" @click="handleFullScreen"> {{ state.fullscreen ? '退出全屏':'全屏'}}</div>
</template>
<script lang="ts" setup>
import { computed, onUnmounted, onMounted, reactive, ref } from "vue";
import { closeStack } from '@/components/hooks/useEscClose';

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
  key: 'f',
});

// 监听浏览器快捷键全屏事件
const isFullscreenForNoScroll = ()=>{
    var explorer = window.navigator.userAgent.toLowerCase();
    let element = document.documentElement;
    if (disableEscExit.value) {
        lockEscKey();
    }
    if(explorer.indexOf('chrome')>0){//webkit
        if (document.body.scrollHeight === window.screen.height && document.body.scrollWidth === window.screen.width) {
            element.requestFullscreen();
            state.fullscreen=true
        } else {
            // state.fullscreen=false
        }
    }else{//IE 9+  fireFox
        if (window.outerHeight === window.screen.height && window.outerWidth === window.screen.width) {
            state.fullscreen=true
        } else {
            state.fullscreen=false
        }
    }
}
const disableEscExit = computed(() => {
    return closeStack.length > 0;
});
// 在setup函数中添加：
const handleKeyDown = (event) => {
  if (event.key === 'Escape' && disableEscExit.value) {
    event.preventDefault();
  }
};
const lockEscKey = async () => {
  if ('keyboard' in navigator && navigator.keyboard.lock) {
    try {
      await navigator.keyboard.lock(['Escape']);
    } catch (err) {
    }
  }
};

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
    window.onresize = ()=> {
        isFullscreenForNoScroll()
    }
})

defineExpose({
  handleFullScreen
});
</script>
<style lang="less" scoped></style>