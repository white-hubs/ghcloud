<template>
  <div class="w-full relative py-[4.1667vw] case-showcase-section">
    <!-- 背景图 - 使用内置背景 -->
    <div class="absolute inset-0 z-0">
      <img :src="defaultBgImage" alt="" class="w-full h-full object-cover" />
    </div>

    <div class="relative z-10 lg:px-[15.625vw]">
      <!-- PC端标题区域 -->
      <div v-if="title || subtitle" class="hidden lg:block text-center mb-[2.0833vw]">
        <h2 class="case-title-pc">{{ title }}</h2>
        <p class="case-subtitle-pc">{{ subtitle }}</p>
      </div>
      <!-- 移动端标题区域 -->
      <div v-if="title || subtitle" class="lg:hidden text-left mb-[4vw] px-[4vw]">
        <h2 class="case-title-mobile">{{ title }}</h2>
        <p class="case-subtitle-mobile">{{ subtitle }}</p>
      </div>

      <!-- PC端: 轮播容器 -->
      <div class="hidden lg:block">
        <div class="overflow-hidden">
          <div
            class="flex gap-[1.0417vw] transition-transform duration-500 ease-out"
            :style="{ transform: `translateX(-${startIndex * (15.625 + 1.0417)}vw)` }"
          >
            <component
              :is="item.href ? 'a' : 'div'"
              v-for="(item, index) in cases"
              :key="index"
              :href="item.href || undefined"
              class="group relative block overflow-hidden rounded-lg flex-shrink-0 case-card-pc"
              :class="{ 'is-active': activeIndex === index }"
              @mouseenter="activeIndex = index"
              @mouseleave="activeIndex = 0"
            >
              <img
                :src="item.image"
                :alt="item.title"
                class="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
                :class="{ 'scale-110': activeIndex === index, 'group-hover:scale-110': true }"
              />

              <!-- 默认状态：黑色毛玻璃遮罩 -->
              <div class="case-card-overlay default-overlay">
                <!-- 标题 -->
                <h3 class="case-card-title">{{ item.title }}</h3>
                <!-- 副标题 -->
                <p class="case-card-subtitle">{{ item.subtitle }}</p>
                <!-- 查看详情 -->
                <div v-if="item.href" class="case-card-link">
                  <span>查看详情</span>
                  <svg class="case-card-arrow" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M1 5h8M5 1l4 4-4 4" />
                  </svg>
                </div>
              </div>

              <!-- Hover/Active状态：蓝色渐变遮罩 -->
              <div class="case-card-overlay hover-overlay">
                <h3 class="case-card-title">{{ item.title }}</h3>
                <p class="case-card-subtitle">{{ item.subtitle }}</p>
                <div v-if="item.href" class="case-card-link">
                  <span>查看详情</span>
                  <svg class="case-card-arrow" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M1 5h8M5 1l4 4-4 4" />
                  </svg>
                </div>
              </div>
            </component>
          </div>
        </div>
      </div>

      <!-- 移动端: 单列横向滚动 -->
      <div class="lg:hidden flex gap-[3.2vw] overflow-x-auto pb-[2vw] px-[4vw]">
        <component
          :is="item.href ? 'a' : 'div'"
          v-for="(item, index) in cases"
          :key="index"
          :href="item.href || undefined"
          class="flex-shrink-0 w-[42vw] relative block overflow-hidden rounded-lg case-card-mobile"
        >
          <img :src="item.image" :alt="item.title" class="absolute inset-0 w-full h-full object-cover" />
          <!-- 默认状态：黑色毛玻璃遮罩 -->
          <div class="case-card-overlay-mobile">
            <h3 class="text-[3.7333vw] font-medium text-white text-center mb-[1vw]">{{ item.title }}</h3>
            <p class="text-[3.2vw] text-white/80 text-center">{{ item.subtitle }}</p>
          </div>
        </component>
      </div>

      <!-- 轮播指示器 - 仅PC端显示 -->
      <div v-if="showIndicators && cases.length > 1" class="hidden lg:flex justify-center gap-[0.625vw] mt-[2.0833vw]">
        <button
          v-for="(item, index) in cases"
          :key="index"
          @click="handleIndicatorClick(index)"
          class="p-[0.3125vw] cursor-pointer"
          :aria-label="`查看 ${item.title}`"
        >
          <span
            class="block w-[0.625vw] h-[0.625vw] rounded-full transition-colors duration-300"
            :class="activeIndex === index ? 'bg-white' : 'bg-white/50'"
          ></span>
        </button>
      </div>

      <!-- 查看更多按钮 - 仅PC端显示 -->
      <div v-if="viewMoreLink" class="hidden lg:block text-center mt-[2.0833vw]">
        <a
          :href="viewMoreLink"
          class="inline-flex items-center gap-[0.5208vw] text-fluid-sm text-white border border-white/30 px-[1.5625vw] py-[0.5208vw] rounded hover:bg-white/10 transition-colors"
        >
          {{ viewMoreText || "查看更多" }}
          <svg class="w-[0.8333vw] h-[0.8333vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

import defaultBgImage from "./group.webp?url";

interface CaseItem {
  image: string;
  title: string;
  subtitle: string;
  href?: string;
}

interface Props {
  title?: string;
  subtitle?: string;
  cases: CaseItem[];
  showIndicators?: boolean;
  viewMoreLink?: string;
  viewMoreText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  subtitle: "",
  showIndicators: false,
  viewMoreLink: "",
  viewMoreText: "",
});

const activeIndex = ref<number | null>(0);
const startIndex = ref(0);

const maxStartIndex = computed(() => {
  const lastIndex = props.cases.length - 1;
  const maxIndexForFullVisibility = lastIndex - 3;
  return Math.max(0, maxIndexForFullVisibility);
});

function handleIndicatorClick(index: number) {
  activeIndex.value = index;
  let targetStartIndex = Math.max(0, index - 3);
  targetStartIndex = Math.min(targetStartIndex, maxStartIndex.value);
  startIndex.value = targetStartIndex;
}
</script>

<style scoped>
/* PC端标题 */
.case-title-pc {
  font-size: 1.6667vw;
  font-weight: 700;
  color: white;
  margin-bottom: 1.04vw;
  line-height: 1.2;
}

.case-subtitle-pc {
  font-size: 0.7292vw;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

/* 移动端标题 */
.case-title-mobile {
  font-size: 4.5333vw;
  font-weight: 700;
  color: white;
  margin-bottom: 2vw;
  line-height: 1.2;
}

.case-subtitle-mobile {
  font-size: 3.4667vw;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

/* PC端卡片 */
.case-card-pc {
  width: 15.625vw;
  height: 23.3333vw;
}

/* 移动端卡片 */
.case-card-mobile {
  aspect-ratio: 156/230;
}

/* 卡片遮罩基础 */
.case-card-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 6.0417vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 1.1979vw;
  transition: all 0.3s;
}

/* 默认遮罩 */
.default-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Hover遮罩 */
.hover-overlay {
  background: linear-gradient(to top, rgba(67, 147, 255, 1) 0%, rgba(79, 154, 255, 0.55) 100%);
  opacity: 0;
}

/* 卡片标题 */
.case-card-title {
  font-size: 1.0417vw;
  font-weight: 500;
  color: white;
  text-align: center;
  line-height: 1.25;
  margin-bottom: 0.3125vw;
}

/* 卡片副标题 */
.case-card-subtitle {
  font-size: 0.7292vw;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  line-height: 1.25;
  margin-bottom: 0.5208vw;
}

/* 卡片链接 */
.case-card-link {
  display: flex;
  align-items: center;
  gap: 0.3125vw;
  font-size: 0.7292vw;
  color: white;
}

/* 卡片箭头 */
.case-card-arrow {
  width: 0.5208vw;
  height: 0.5208vw;
}

/* 移动端遮罩 */
.case-card-overlay-mobile {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 24vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 3vw;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Hover效果 */
.case-card-pc:hover .default-overlay,
.case-card-pc.is-active .default-overlay {
  opacity: 0;
}

.case-card-pc:hover .hover-overlay,
.case-card-pc.is-active .hover-overlay {
  opacity: 1 !important;
}
</style>
