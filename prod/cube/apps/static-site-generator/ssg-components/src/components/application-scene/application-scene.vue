<template>
  <div class="w-full" :class="theme === 'dark' ? 'bg-[#070e24]' : 'bg-[#F9FCFF]'">
    <!-- PC 端 -->
    <div class="hidden lg:block h-[41.1458vw] pt-[4.1667vw]">
      <!-- 标题 -->
      <div class="text-center h-[1.6667vw]">
        <h2
          class="text-[1.5625vw] font-bold leading-[1.6667vw]"
          :class="theme === 'dark' ? 'text-white' : 'text-[#182B44]'"
          style="
            font-family:
              &quot;SourceHanSansCN-Bold&quot;,
              system-ui,
              -apple-system,
              sans-serif;
          "
        >
          {{ title }}
        </h2>
      </div>

      <!-- Tabs -->
      <div class="flex justify-center items-center mr-[9.6354vw]">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="h-[3.125vw] ml-[9.6354vw] mt-[3.6979vw] text-[0.9375vw] font-medium leading-[1.3542vw] cursor-pointer relative whitespace-nowrap transition-colors duration-300 after:content-[''] after:absolute after:w-full after:h-[0.1042vw] after:left-0 after:top-[3.125vw] after:transition-opacity after:duration-300"
          :class="{
            'after:opacity-100': activeIndex === index,
            'after:opacity-0': activeIndex !== index,
            'text-primary after:bg-[#1a7bff]': activeIndex === index && theme !== 'dark',
            'text-[#4a9eff] after:bg-[#4a9eff]': activeIndex === index && theme === 'dark',
            'text-[#182B44]': activeIndex !== index && theme !== 'dark',
            'text-gray-300': activeIndex !== index && theme === 'dark',
          }"
          style="
            font-family:
              &quot;SourceHanSansCN-Medium-2&quot;,
              system-ui,
              -apple-system,
              sans-serif;
          "
          :style="
            activeIndex === index
              ? {
                  backgroundImage: `url(${activeTabIcon})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.25vw',
                  backgroundPosition: 'center 1.6667vw',
                }
              : {}
          "
          @click="handleTabClick(index)"
          @mouseenter="pauseAutoPlay"
          @mouseleave="resumeAutoPlay"
        >
          {{ item.label }}
        </div>
      </div>

      <!-- 内容区：全量渲染所有 item，通过 opacity 切换，保证 SEO -->
      <div
        class="w-[68.75vw] h-[25vw] mx-auto relative"
        :class="theme === 'dark' ? 'bg-gradient-to-b from-[#0f1a35] to-[#070e24]' : 'bg-gradient-to-b from-[#F5F9FF] to-[#FEFEFF]'"
        @mouseenter="pauseAutoPlay"
        @mouseleave="resumeAutoPlay"
      >
        <div
          v-for="(item, index) in items"
          :key="index"
          class="absolute inset-0 flex transition-opacity duration-500"
          :class="activeIndex === index ? 'opacity-100 z-10' : 'opacity-0 z-0'"
        >
          <!-- 左侧图片 -->
          <div
            class="w-[36.4583vw] h-[19.7917vw] shadow-[0_0_1.0417vw_0_rgba(86,118,162,0.1)] rounded-[0.3125vw] border-[0.1042vw] mt-[2.0833vw] ml-[1.3021vw] flex-shrink-0"
            :class="theme === 'dark' ? 'bg-[#1a2540] border-gray-700' : 'bg-[#F5F9FF] border-white'"
          >
            <img :src="item.image" :alt="item.label" class="w-[35.4167vw] h-[18.75vw] m-[0.5208vw] block rounded-[0.2083vw]" />
          </div>
          <!-- 右侧文字 -->
          <div>
            <div
              class="text-[1.25vw] font-medium leading-[1.8229vw] ml-[3.6458vw] mt-[5.4167vw]"
              :class="theme === 'dark' ? 'text-white' : 'text-[#3D3D3D]'"
              style="
                font-family:
                  &quot;SourceHanSansCN-Medium-2&quot;,
                  system-ui,
                  -apple-system,
                  sans-serif;
              "
            >
              {{ item.label }}
            </div>
            <div
              class="w-[23.4375vw] text-[0.7292vw] leading-[1.3542vw] ml-[3.6458vw] mt-[1.3542vw] whitespace-pre-wrap"
              :class="theme === 'dark' ? 'text-white' : 'text-[#999EA2]'"
              style="
                font-family:
                  &quot;SourceHanSansCN-Regular&quot;,
                  system-ui,
                  -apple-system,
                  sans-serif;
              "
            >
              {{ item.content }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端 -->
    <div class="lg:hidden w-full relative box-border px-[5.3333vw] pt-[20.8vw] pb-[2.6667vw]">
      <!-- 标题 -->
      <div class="absolute top-[6.9333vw] left-[5.3333vw] h-[8vw]">
        <h2
          class="text-[4.5333vw] font-bold leading-[8.5333vw] whitespace-nowrap"
          :class="theme === 'dark' ? 'text-white' : 'text-[#182B44]'"
          style="
            font-family:
              &quot;SourceHanSansCN-Medium-2&quot;,
              system-ui,
              -apple-system,
              sans-serif;
          "
        >
          {{ title }}
        </h2>
      </div>

      <!-- Tabs -->
      <div class="flex gap-[3.7333vw] overflow-x-auto pb-[2vw] scrollbar-hide mb-[4vw] h-[8vw] leading-[8vw]">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="flex-shrink-0 h-[6.4vw] text-[3.7333vw] font-medium whitespace-nowrap transition-all duration-300 relative"
          :class="{
            'text-primary': activeIndex === index && theme !== 'dark',
            'text-[#4a9eff]': activeIndex === index && theme === 'dark',
            'text-[#182B44]': activeIndex !== index && theme !== 'dark',
            'text-gray-300': activeIndex !== index && theme === 'dark',
          }"
          style="
            font-family:
              &quot;SourceHanSansCN-Medium-2&quot;,
              system-ui,
              -apple-system,
              sans-serif;
          "
          @click="handleTabClick(index)"
          @mouseenter="pauseAutoPlay"
          @mouseleave="resumeAutoPlay"
        >
          {{ item.label }}
          <div
            v-if="activeIndex === index"
            class="absolute left-1/2 -translate-x-1/2 -bottom-[1vw] w-[5.8667vw] h-[0.7vw] rounded-full"
            :class="theme === 'dark' ? 'bg-[#4a9eff]' : 'bg-primary'"
          ></div>
        </div>
      </div>

      <!-- 内容区 -->
      <div v-for="(item, index) in items" :key="index" :class="activeIndex === index ? 'block' : 'hidden'">
        <div
          class="text-[3.2vw] font-medium mt-[2.6667vw] mb-[2.6667vw]"
          :class="theme === 'dark' ? 'text-white' : 'text-[#182B44]'"
          style="
            font-family:
              &quot;SourceHanSansCN-Medium-2&quot;,
              system-ui,
              -apple-system,
              sans-serif;
          "
        >
          {{ item.label }}
        </div>
        <div
          class="text-[3.2vw] leading-[1.6] mb-[4vw] whitespace-pre-line"
          :class="theme === 'dark' ? 'text-white' : 'text-[#9DA3AC]'"
          style="
            font-family:
              &quot;SourceHanSansCN-Regular&quot;,
              system-ui,
              -apple-system,
              sans-serif;
          "
        >
          {{ item.content }}
        </div>
        <img :src="item.image" :alt="item.label" class="w-full h-auto object-cover rounded-lg" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

import activeTabIcon from "./active-tab-icon.webp?url";

interface SceneItem {
  label: string;
  content: string;
  image: string;
}

interface Props {
  title?: string;
  items: SceneItem[];
  theme?: "light" | "dark";
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const props = withDefaults(defineProps<Props>(), {
  title: "应用场景",
  theme: "light",
  autoPlay: true,
  autoPlayInterval: 3000,
});

const activeIndex = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

function next() {
  activeIndex.value = props.items.length > 0 ? (activeIndex.value + 1) % props.items.length : 0;
}

function startAutoPlay() {
  if (!props.autoPlay || props.items.length <= 1) return;
  stopAutoPlay();
  timer = setInterval(next, props.autoPlayInterval);
}

function stopAutoPlay() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function pauseAutoPlay() {
  stopAutoPlay();
}

function resumeAutoPlay() {
  startAutoPlay();
}

function handleTabClick(index: number) {
  activeIndex.value = index;
  stopAutoPlay();
  startAutoPlay();
}

onMounted(() => {
  startAutoPlay();
});

onUnmounted(() => {
  stopAutoPlay();
});
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
