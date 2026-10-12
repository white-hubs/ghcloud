<template>
  <Teleport to="body">
    <div :class="isFullScreen?'full-video-pop-up':'video-pop-up'" v-if="visible">
      <div class="video-head">
        <div>视频监控</div>
        <div class="video-operation">
          <FullscreenOutlined style="margin-right: 10px;cursor: pointer;" @click="fullVideo" v-if="!isFullScreen" />
          <FullscreenExitOutlined style="margin-right: 10px;cursor: pointer;" @click="fullVideo" v-else/>
          <CloseOutlined @click="closeModal" />
        </div>
      </div>
      <div class="xian"></div>
      <div class="video-body">
        <div class="camera-item" v-for="item in props.cameraList" :key="item.id">
          <H5Video :control="true" :cameraItem="item" v-if="item.id" ></H5Video>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  CloseOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined
} from '@ant-design/icons-vue';
import { ref } from 'vue'
import H5Video from "@/components/businessPanel/public/H5Video.vue";
import { storeMarket } from '@/piniaStore/other'


const props = withDefaults(defineProps<{
  visible:boolean,
  cameraList:{id:string}[]
}>(), {
  visible:false
});
const emits =defineEmits(['update:visible'])

/** 是否全屏 */
const isFullScreen = ref(false)

/** 全屏/退出全屏 */
const fullVideo = ()=> {
  isFullScreen.value = !isFullScreen.value
}

/** 关闭弹窗 */
const closeModal=()=> {
  emits('update:visible',false)
  isFullScreen.value = false
}
</script>

<style scoped lang="less">
.full-alarmDetail-wrap {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
}

.no-alarmDetail-wrap {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}


.video-pop-up, .full-video-pop-up {
  width: 940px;
  height: 710px;
  background: rgba(4, 17, 32, 0.80);
  border: 1px solid #2989ff;
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 1000;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease-in-out;
  .video-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #fff;
    font-size: 18px;
    height: 48px;
    width: 100%;
    margin: auto;
    box-sizing: border-box;
    padding: 0 20px;

    .video-operation {
      display: flex;
      align-items: center;
    }
  }

  .xian {
    border-bottom: 1px solid #2989ff;
    height: 1px;
  }

  .video-body {
    height: calc(100% - 49px);
    padding: 10px 10px;
    box-sizing: border-box;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    grid-gap: 10px 10px;
    .camera-item{
      overflow: hidden;
    }
  }
}

.full-video-pop-up {
  width: 100vw;
  height: 100vh;
}
</style>