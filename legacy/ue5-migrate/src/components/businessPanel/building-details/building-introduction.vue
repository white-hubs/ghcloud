<template>
  <SubPanelTemplate :title="props.title">
    <div class="building-box">
      <div class="building-title" v-if="buildingDetailsData.videoFiles[0]?.path">
        <img width="12" :src="getAssetsImage('overView93.png')" />
        <div class="building-text">楼栋宣传片</div>
      </div>
      <div class="video-box" @mouseenter="playHover = true" @mouseleave="playHover = false"
        v-if="buildingDetailsData.videoFiles[0]?.path">
        <video ref="videoRef" :controls="playStatus" style="width: 100%;height: 100%; object-fit: fill">
          <source :src="buildingDetailsData.videoFiles[0].path" type="video/mp4" />
        </video>
        <play-circle-outlined v-show="!playStatus" @click="playVideo" class="play-icon"
          style="color:white;font-size: 38px;" />
        <pause-circle-outlined v-show="playStatus && playHover" @click="pauseVideo" class="pause-icon"
          style="color:white;font-size: 38px;" />
      </div>
      <div class="building-title">
        <img width="12" :src="getAssetsImage('overView93.png')" />
        <div class="building-text">楼栋介绍</div>
      </div>
      <div class="swiper-box">
        <img :src="getAssetsImage('overView96.png')" class="swiper-left-btn" @click="slidePrev" />
        <img :src="getAssetsImage('overView95.png')" class="swiper-right-btn" @click="slideNext" />
        <div class="swiper outSwiper-box">
          <div class="swiper-wrapper swiper-img">
            <div class="swiper-slide" v-for="(item, i) in buildingDetailsData.pictureFiles" :key="i">
              <a-image @click="clickImage(i)" :preview="{ visible: false }"  :width="'80%'" height="100" :src="item.path" />
            </div>
          </div>
        </div>
      </div>
      <div class="building-content">
        <div :class="['scroll-text',buildingDetailsData.introduce.length<600 && 'disable-animation']"
          ref='scrollTextRef' :style="{'animation-duration':animationTime+'s'}">
          {{ buildingDetailsData.introduce }}
        </div>
      </div>
    </div>
  </SubPanelTemplate>
  <div class="preview-box" >
    <a-image-preview-group :preview="{ visible,current:current, onVisibleChange: vis => (visible = vis) }">
      <a-image class="preview-box" v-for="(item, i) in buildingDetailsData.pictureFiles" :key="i" :src="item.path"   />
    </a-image-preview-group>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted, nextTick, computed} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { getAssetsImage } from "@/utils/getImage";
import { cubeMdataService } from '@/api/service'
import { storeArea } from "@/piniaStore/area";
import { PlayCircleOutlined , PauseCircleOutlined} from "@ant-design/icons-vue";
import "swiper/swiper.min.css"
import Swiper from 'swiper';
import { useStateStore } from '@/pages/state/use-state-store';

const props = withDefaults(defineProps<{
  title?: string;
}>(), {
  title: '楼栋简介'
})
const current = ref(0)
const { globalState } = useStateStore();
const videoRef = ref()
const buildingDetailsData = ref<any>({
  videoFiles:[{path:''}],
  pictureFiles:[{path:''}],
  introduce:''
})
const visible = ref(false)
const playStatus = ref(false)
const playHover = ref(false)
const swiperRef = ref()
const scrollTextRef = ref()
const animationTime = ref(0)
const getBuildingDetails = async ()=>{
  const areaId = globalState.business.currentAreaId || globalState.business.area[0]?.id 
 const res = await cubeMdataService.getAreaById(areaId)
 buildingDetailsData.value = res.areaExtend
 nextTick(() => {
    swiperRef.value = new Swiper('.outSwiper-box', {
      loop: true,
      slidesPerView: buildingDetailsData.value.pictureFiles.length>=2?2:1,
      observer: true,
      observeSlideChildren: true,
      observeParents: true,
    })
    animationTime.value = calcAnimationTime()
  })
}
const calcAnimationTime = ()=>{
  const SPEED = 10
  const clientHeight =  scrollTextRef.value?.clientHeight ?? 0;
  const time =  clientHeight / SPEED
  return time
}
const clickImage = (i)=>{
  current.value = i
  visible.value = true
}
const playVideo = ()=>{
  videoRef.value.play()
  playStatus.value = true
}
const pauseVideo = ()=>{
  videoRef.value.pause()
  playStatus.value = false
}
const slidePrev = ()=>{
  swiperRef.value.slidePrev()
}
const slideNext = ()=>{
  swiperRef.value.slideNext()
}
onMounted(()=>{  
  getBuildingDetails()
})
</script>
<style lang="less" scoped>
.building-box {
  padding: 10px 20px;

  .building-title {
    width: 164px;
    height: 40px;
    background-image: url("/resource/v1/ue5-migrate/assets//images/overView94.png");
    background-size: 100%;
    background-repeat: no-repeat;
    display: flex;
    padding-left: 6px;
    align-items: center;
    font-size: 16px;
    color: #e3eeff;

    .building-text {
      margin-left: 4px;
      font-weight: bold;
    }
  }

  .video-box {
    position: relative;
    padding: 6px;
    border: 1px solid #2989FF;
    margin: 14px 0 20px 0;
    height: 184px;

    .play-icon,
    .pause-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
      cursor: pointer;
    }
  }

  .swiper-box {
    position: relative;

    .swiper-left-btn,
    .swiper-right-btn {
      position: absolute;
      width: 22px;
      height: 36px;
      top: 50%;
      cursor: pointer;
      z-index: 99;
    }

    .swiper-right-btn {
      right: 0;
    }

    .swiper-img {
      width: 90%;
      margin: auto;

      :deep(.swiper-wrapper) {
        justify-content: center;
      }
    }
  }

  .building-content {
    height: calc(100vh - 500px);
    font-size: 14px;
    color: #dfe3e8;
    margin-top: 10px;
    text-align: left;
    overflow: hidden;

    .scroll-text {
      animation: scroll 10s linear infinite;
      color: #D9E7FF;
      font-size: 12px;
    }

    .disable-animation {
      animation: unset;
    }
  }
}

@keyframes scroll {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(-100%);
  }
}

video::-webkit-media-controls-play-button {
  display: none;
}
</style>
<style>
.ant-image-preview-switch-left{
 left:100px
}
.ant-image-preview-switch-right{
 right:100px
}
.ant-image-preview-switch-left,.ant-image-preview-switch-right {
  width: 100px;
  height: 100px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
}
.preview-box{
  position: relative;
  top: 1000px;
}
</style>