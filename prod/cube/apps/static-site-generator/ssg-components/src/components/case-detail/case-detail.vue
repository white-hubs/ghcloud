<template>
  <div class="w-full bg-white pb-[4.17vw]">
    <!-- 面包屑 -->
    <nav v-if="breadcrumbs && breadcrumbs.length" class="px-[4vw] lg:px-[15.625vw] py-[1.0417vw]">
      <ol class="flex items-center text-[2.8vw] lg:text-[0.7292vw] text-[#585c60]">
        <li v-for="(item, index) in breadcrumbs" :key="index" class="flex items-center">
          <component :is="item.href ? 'a' : 'div'" :href="item.href || undefined" class="hover:text-primary transition-colors">{{
            item.name
          }}</component>
          <span v-if="index < breadcrumbs.length - 1" class="mx-[1vw] lg:mx-[0.5208vw] text-[#b1b5ba]">></span>
        </li>
      </ol>
    </nav>

    <!-- 建设概况 -->
    <section id="overview" class="px-[4vw] lg:px-[15.625vw] mb-[6vw] lg:mb-[3.125vw]">
      <h2 class="text-[5vw] lg:text-[1.25vw] font-bold text-[#182b44] mb-[3vw] lg:mb-[2.0833vw]">{{ overviewTitle }}</h2>
      <p class="text-[2.8vw] lg:text-[0.8333vw] text-[#4c5867] leading-[1.8] lg:leading-[2] mb-[4vw] lg:mb-[2.0833vw]">
        {{ overviewDescription }}
      </p>
      <!-- 大图/视频 -->
      <div class="relative w-full aspect-[1320/770] rounded-lg overflow-hidden bg-gray-100">
        <img :src="overviewImage" :alt="overviewTitle" class="w-full h-full object-cover" />
        <!-- 播放按钮 -->
        <div
          v-if="overviewVideo"
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[12vw] h-[12vw] lg:w-[4.1667vw] lg:h-[4.1667vw] rounded-full bg-black/60 flex items-center justify-center z-10 cursor-pointer hover:bg-black/70 transition-colors"
          @click="showVideo(overviewVideo)"
        >
          <svg class="w-[3vw] h-[3vw] lg:w-[1.3vw] lg:h-[1.3vw]" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </section>

    <!-- 项目痛点 -->
    <section id="pain-points" class="px-[4vw] lg:px-[15.625vw] mb-[6vw] lg:mb-[3.125vw]">
      <h2 class="text-[5vw] lg:text-[1.5625vw] font-bold text-[#182b44] mb-[3vw] lg:mb-[2.0833vw]">{{ painPointsTitle }}</h2>
      <p class="text-[2.8vw] lg:text-[0.8333vw] text-[#4c5867] leading-[1.8] lg:leading-[2]">{{ painPointsDescription }}</p>
    </section>

    <!-- 建设价值 -->
    <section id="value" class="px-[4vw] lg:px-[15.625vw] mb-[6vw] lg:mb-[3.125vw]">
      <h2 class="text-[5vw] lg:text-[1.5625vw] font-bold text-[#182b44] mb-[3vw] lg:mb-[2.0833vw]">{{ valueTitle }}</h2>
      <p class="text-[2.8vw] lg:text-[0.8333vw] text-[#4c5867] leading-[1.8] lg:leading-[2]">{{ valueDescription }}</p>
    </section>

    <!-- 相关案例 -->
    <section id="related-cases" class="px-[4vw] lg:px-[15.625vw]">
      <h2 class="text-[5vw] lg:text-[1.5625vw] font-medium text-[#182b44] mb-[4vw] lg:mb-[2.0833vw]">{{ relatedCasesTitle }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[4vw] lg:gap-[1.5625vw]">
        <component
          :is="item.href ? 'a' : 'div'"
          v-for="(item, index) in relatedCases"
          :key="index"
          :href="item.href || undefined"
          class="group block rounded-lg overflow-hidden bg-white"
          style="box-shadow: 0 0 0.5208vw 0 rgba(24, 43, 68, 0.04)"
        >
          <div class="relative w-full aspect-[413/220] overflow-hidden bg-gray-100">
            <img
              :src="item.image"
              :alt="item.title"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div class="py-[3vw] lg:py-[1.0417vw] text-center">
            <span
              class="text-[3vw] lg:text-[0.9375vw] text-[#182B44] font-medium group-hover:text-primary group-hover:underline transition-colors"
              >{{ item.title }}</span
            >
          </div>
        </component>
      </div>
    </section>

    <!-- 视频弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="videoVisible"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-[4vw] lg:p-[2vw]"
          @click.self="closeVideo"
        >
          <div class="relative w-full max-w-[90vw] lg:max-w-[60vw] aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
            <!-- 关闭按钮 -->
            <button
              type="button"
              class="absolute top-[2vw] right-[2vw] lg:top-[1vw] lg:right-[1vw] z-10 flex items-center justify-center w-[8vw] h-[8vw] lg:w-[2.5vw] lg:h-[2.5vw] rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
              @click="closeVideo"
            >
              <svg class="w-[4vw] h-[4vw] lg:w-[1.2vw] lg:h-[1.2vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <!-- DPlayer 容器 -->
            <div ref="dplayerRef" class="w-full h-full" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, nextTick } from "vue";

interface Breadcrumb {
  name: string;
  href?: string;
}

interface RelatedCase {
  image: string;
  title: string;
  href?: string;
}

interface Props {
  breadcrumbs?: Breadcrumb[];
  overviewTitle?: string;
  overviewDescription?: string;
  overviewImage?: string;
  overviewVideo?: string;
  painPointsTitle?: string;
  painPointsDescription?: string;
  valueTitle?: string;
  valueDescription?: string;
  relatedCasesTitle?: string;
  relatedCases?: RelatedCase[];
}

withDefaults(defineProps<Props>(), {
  overviewTitle: "建设概况",
  painPointsTitle: "项目痛点",
  valueTitle: "建设价值",
  relatedCasesTitle: "相关案例",
  relatedCases: () => [],
});

const videoVisible = ref(false);
const dplayerRef = ref<HTMLDivElement | null>(null);
let dp: any = null;

async function showVideo(url: string) {
  if (!url || typeof window === "undefined") return;
  videoVisible.value = true;
  await nextTick();
  //@ts-ignore
  const DPlayer = (await import("dplayer")).default;
  destroyPlayer();
  dp = new DPlayer({
    container: dplayerRef.value,
    video: { url },
    autoplay: true,
    theme: "#1578FF",
    loop: false,
    screenshot: false,
    hotkey: true,
    preload: "auto",
    mutex: true,
  });
}

function closeVideo() {
  videoVisible.value = false;
  destroyPlayer();
}

function destroyPlayer() {
  if (dp && typeof dp.destroy === "function") {
    dp.destroy();
    dp = null;
  }
}

onUnmounted(() => {
  destroyPlayer();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
