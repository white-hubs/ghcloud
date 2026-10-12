<template>
    <div class="business-name" @click="handleFullScreen"> {{ state.fullscreen ? '退出全屏':'全屏'}}</div>
</template>
<script lang="ts" setup>
import { onMounted, reactive } from "vue";

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
            if(explorer.indexOf('chrome')>0){//webkit
                if (document.body.scrollHeight === window.screen.height && document.body.scrollWidth === window.screen.width) {
                    element.requestFullscreen();
                    state.fullscreen=true
                } else {
                    state.fullscreen=false
                }
            }else{//IE 9+  fireFox
                if (window.outerHeight === window.screen.height && window.outerWidth === window.screen.width) {
                    state.fullscreen=true
                } else {
                    state.fullscreen=false
                }
            }
        }
onMounted(() => {
     //监听退出全屏
     window.onresize = ()=> {
      isFullscreenForNoScroll()
    }
})
defineExpose({
  handleFullScreen
});
</script>
<style lang="less" scoped></style>
