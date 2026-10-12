<template>
  <div class="w-full relative pb-[3.9vw]" :style="sectionStyle">
    <!-- PC端标题区域 -->
    <div v-if="title || subtitle" class="hidden lg:block text-center pt-[4.17vw] pb-[2.0833vw]">
      <h2 v-if="title" class="text-fluid-2xl font-bold text-gray-900 mb-[1.0417vw]">
        {{ title }}
      </h2>
      <p v-if="subtitle" class="text-fluid-base text-gray-500">{{ subtitle }}</p>
    </div>
    <!-- 移动端标题区域 -->
    <div v-if="title || subtitle" class="lg:hidden text-center pt-[8vw] pb-[4vw] px-[4vw]">
      <h2 v-if="title" class="text-[4.5333vw] font-medium text-gray-900 mb-[2vw]">
        {{ title }}
      </h2>
      <p v-if="subtitle" class="text-[3.4667vw] text-gray-500">{{ subtitle }}</p>
    </div>

    <!-- PC端 -->
    <div class="hidden lg:block relative w-[69.1667vw] h-[34.4792vw] mx-auto rounded-lg overflow-hidden">
      <video
        ref="videoRef"
        class="w-full h-full object-cover"
        :poster="thumbnail"
        autoplay
        muted
        loop
        playsinline
        @play="isPlaying = true"
        @pause="isPlaying = false"
      >
        <source :src="videoUrl" type="video/mp4">
      </video>

      <!-- 播放遮罩 -->
      <div
        v-if="isMuted || !isPlaying"
        class="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
        @click="play"
      >
        <div class="flex flex-col items-center">
          <div class="w-[4.4792vw] h-[4.4792vw] bg-primary/90 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
            <svg class="w-[1.5vw] h-[1.5vw] text-white ml-[0.3vw]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <span v-if="playButtonText" class="mt-[1.0417vw] text-white text-fluid-base">{{ playButtonText }}</span>
        </div>
      </div>

      <!-- 暂停按钮 (播放时显示) -->
      <div
        v-if="isPlaying && !isMuted"
        class="absolute inset-0 flex items-center justify-center bg-black/10 cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
        @click="pause"
      >
        <div class="w-[4.4792vw] h-[4.4792vw] bg-black/50 rounded-full flex items-center justify-center">
          <svg class="w-[1.5vw] h-[1.5vw] text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- 移动端 -->
    <div class="lg:hidden relative w-full aspect-video rounded-lg overflow-hidden">
      <video
        ref="videoRefMobile"
        class="w-full h-full object-cover"
        :poster="thumbnail"
        autoplay
        muted
        loop
        playsinline
        @play="isPlaying = true"
        @pause="isPlaying = false"
      >
        <source :src="videoUrl" type="video/mp4">
      </video>

      <!-- 播放遮罩 -->
      <div
        v-if="isMuted || !isPlaying"
        class="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
        @click="play"
      >
        <div class="flex flex-col items-center">
          <div class="w-[12vw] h-[12vw] bg-primary/90 rounded-full flex items-center justify-center active:bg-primary transition-colors">
            <svg class="w-[4vw] h-[4vw] text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <span v-if="playButtonText" class="mt-[3vw] text-white text-[3.5vw]">{{ playButtonText }}</span>
        </div>
      </div>

      <!-- 暂停按钮 (播放时显示) -->
      <div
        v-if="isPlaying && !isMuted"
        class="absolute inset-0 flex items-center justify-center bg-black/10 cursor-pointer opacity-0 active:opacity-100 transition-opacity"
        @click="pause"
      >
        <div class="w-[12vw] h-[12vw] bg-black/50 rounded-full flex items-center justify-center">
          <svg class="w-[4vw] h-[4vw] text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import defaultBgImage from './bg.webp?url'

interface Props {
  title?: string
  subtitle?: string
  videoUrl: string
  thumbnail?: string
  duration?: string
  playButtonText?: string
  backgroundImage?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  thumbnail: '',
  duration: '',
  playButtonText: '播放视频',
  backgroundImage: '',
})

const sectionStyle = computed(() => {
  const bgUrl = props.backgroundImage || defaultBgImage
  return {
    backgroundImage: `url(${bgUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }
})

const videoRef = ref<HTMLVideoElement | null>(null)
const videoRefMobile = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const isMuted = ref(true)

const play = () => {
  const v = videoRef.value || videoRefMobile.value
  if (!v) return
  v.currentTime = 0
  v.muted = false
  isMuted.value = false
  v.play()
}

const pause = () => {
  videoRef.value?.pause()
  videoRefMobile.value?.pause()
}
</script>
