<template>
  <div class="relative w-full rounded-lg overflow-hidden bg-black">
    <!-- 视频元素 -->
    <video
      ref="videoRef"
      class="w-full h-full object-contain"
      :poster="poster || thumbnail"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      @ended="isPlaying = false"
    >
      <source :src="videoUrl" type="video/mp4">
      您的浏览器不支持视频播放
    </video>

    <!-- 播放按钮遮罩 -->
    <div
      v-if="!isPlaying"
      class="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
      @click="play"
    >
      <div class="flex items-center justify-center w-[4.4792vw] h-[4.4792vw] bg-primary/90 rounded-full hover:bg-primary transition-colors">
        <svg class="w-[1.5vw] h-[1.5vw] text-white ml-[0.3vw]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
    </div>

    <!-- 控制栏 -->
    <div
      v-if="isPlaying"
      class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-[1.0417vw]"
    >
      <div class="flex items-center gap-[0.8333vw]">
        <!-- 暂停/播放 -->
        <button
          class="text-white hover:text-primary transition-colors"
          @click="togglePlay"
        >
          <svg v-if="isPlaying" class="w-[1.25vw] h-[1.25vw]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
          <svg v-else class="w-[1.25vw] h-[1.25vw]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>

        <!-- 进度条 -->
        <div class="flex-1 h-[0.2083vw] bg-white/30 rounded-full cursor-pointer" @click="seek">
          <div
            class="h-full bg-primary rounded-full"
            :style="{ width: `${progress}%` }"
          />
        </div>

        <!-- 时间 -->
        <span class="text-fluid-xs text-white">{{ formattedTime }}</span>

        <!-- 全屏 -->
        <button
          class="text-white hover:text-primary transition-colors"
          @click="toggleFullscreen"
        >
          <svg class="w-[1.25vw] h-[1.25vw]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  videoUrl: string
  thumbnail?: string
  poster?: string
}

withDefaults(defineProps<Props>(), {
  thumbnail: '',
  poster: '',
})

const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

const progress = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

const formattedTime = computed(() => {
  const format = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  return `${format(currentTime.value)} / ${format(duration.value)}`
})

const play = () => {
  videoRef.value?.play()
}

const togglePlay = () => {
  if (videoRef.value) {
    if (isPlaying.value) {
      videoRef.value.pause()
    } else {
      videoRef.value.play()
    }
  }
}

const seek = (e: MouseEvent) => {
  if (videoRef.value) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    videoRef.value.currentTime = percent * videoRef.value.duration
  }
}

const toggleFullscreen = () => {
  if (videoRef.value) {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      videoRef.value.requestFullscreen()
    }
  }
}

// 监听视频时间更新
const onTimeUpdate = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
    duration.value = videoRef.value.duration
  }
}

// 组件挂载后添加事件监听
onMounted(() => {
  videoRef.value?.addEventListener('timeupdate', onTimeUpdate)
})

onUnmounted(() => {
  videoRef.value?.removeEventListener('timeupdate', onTimeUpdate)
})
</script>

<script lang="ts">
import { onMounted, onUnmounted } from 'vue'
</script>
