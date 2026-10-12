<template>
  <div class="w-full py-[4.1667vw] scenario-carousel-section">
    <!-- 背景图 -->
    <div class="absolute inset-0 z-0">
      <img :src="backgroundImage" alt="" class="w-full h-full object-cover">
    </div>

    <!-- PC端 -->
    <div class="hidden lg:block px-[11.5vw] relative z-10">
      <!-- 标题 -->
      <div v-if="title" class="text-center mb-[2.0833vw]">
        <h2 class="text-[1.5625vw] font-bold text-white" style="font-family: 'SOURCEHANSANSSC-BOLD', system-ui, -apple-system, sans-serif;">
          {{ title }}
        </h2>
      </div>

      <!-- 轮播容器 -->
      <div class="relative">
        <!-- 场景列表 -->
        <div>
          <div
            class="flex gap-[1.5vw] justify-center"
          >
            <div
              v-for="(item, index) in scenarios"
              :key="index"
              class="flex-shrink-0 w-[19.5vw] h-[13vw] relative rounded-lg overflow-hidden group transition-all duration-500 cursor-pointer"
              :class="currentIndex === index ? 'scale-[1.05] z-10 brightness-110 shadow-[0_0_1vw_rgba(255,255,255,0.4)]' : 'opacity-80 hover:opacity-100'
"
              @click="currentIndex = index"
            >
              <img
                :src="item.image"
                :alt="item.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              >
              <!-- 底部渐变遮罩 + 标题 -->
              <div class="absolute inset-x-0 bottom-0 h-[3.75vw] bg-gradient-to-t from-[#182b44]/80 to-transparent flex items-end justify-center pb-[0.8vw]">
                <span class="text-[1.0417vw] font-medium text-white" style="font-family: 'SourceHanSansCN-Medium-2', system-ui, -apple-system, sans-serif;">
                  {{ item.title }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 指示器 -->
      <div v-if="showDots && scenarios.length > 1" class="flex justify-center gap-[0.625vw] mt-[1.5625vw]">
        <button
          v-for="index in scenarios.length"
          :key="index - 1"
          @click="currentIndex = index - 1"
          class="w-[0.625vw] h-[0.625vw] rounded-full transition-colors duration-300"
          :class="currentIndex === index - 1 ? 'bg-white' : 'bg-white/40'"
          :aria-label="`切换到第${index}项`"
        />
      </div>
    </div>

    <!-- 移动端 -->
    <div class="lg:hidden px-[4.2667vw] py-[8vw] relative z-10">
      <!-- 标题 -->
      <div v-if="title" class="text-center mb-[4vw]">
        <h2 class="text-[5vw] font-bold text-white" style="font-family: 'SOURCEHANSANSSC-BOLD', system-ui, -apple-system, sans-serif;">
          {{ title }}
        </h2>
      </div>

      <!-- 横向滚动列表 -->
      <div class="flex gap-[3.2vw] overflow-x-auto pb-[2vw] snap-x snap-mandatory scrollbar-hide">
        <div
          v-for="(item, index) in scenarios"
          :key="index"
          class="flex-shrink-0 w-[42vw] h-[28vw] relative rounded-lg overflow-hidden snap-start"
        >
          <img
            :src="item.image"
            :alt="item.title"
            class="w-full h-full object-cover"
          >
          <!-- 底部渐变遮罩 + 标题 -->
          <div class="absolute inset-x-0 bottom-0 h-[8vw] bg-gradient-to-t from-[#182b44]/80 to-transparent flex items-end justify-center pb-[1.5vw]">
            <span class="text-[3.2vw] font-medium text-white" style="font-family: 'SourceHanSansCN-Medium-2', system-ui, -apple-system, sans-serif;">
              {{ item.title }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface ScenarioItem {
  image: string
  title: string
}

interface Props {
  title?: string
  scenarios: ScenarioItem[]
  showArrows?: boolean
  showDots?: boolean
  backgroundImage?: string
  autoPlay?: boolean
  autoPlayInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '应用场景',
  showArrows: true,
  showDots: true,
  backgroundImage: 'https://qiniu.guhecloud.com/imgs/pages/twin/math-background.png',
  autoPlay: true,
  autoPlayInterval: 3000,
})

const currentIndex = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function nextSlide() {
  if (currentIndex.value < props.scenarios.length - 1) {
    currentIndex.value++
  } else {
    currentIndex.value = 0
  }
}

function prevSlide() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    currentIndex.value = props.scenarios.length - 1
  }
}

function startAutoPlay() {
  if (props.autoPlay && props.scenarios.length > 1) {
    timer = setInterval(() => {
      nextSlide()
    }, props.autoPlayInterval)
  }
}

function stopAutoPlay() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<style scoped>
.scenario-carousel-section {
  position: relative;
}

/* 隐藏滚动条 */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
