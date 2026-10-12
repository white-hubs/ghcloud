<template>
  <div class="w-full bg-[#F9FCFF] pt-[2.0833vw] pb-[6.25vw]">
    <div class="w-full mx-auto px-[4vw] lg:px-[15.625vw]">
      <!-- PC端: 精确3列网格，还原设计稿 -->
      <div class="hidden lg:flex lg:flex-wrap lg:justify-start lg:w-[68.75vw] lg:mx-auto lg:gap-y-[2.0833vw] lg:gap-x-[1.5625vw]">
        <component
          :is="item.href ? 'a' : 'div'"
          v-for="(item, index) in filteredCases"
          :key="index"
          :href="item.href || undefined"
          class="group relative block w-[21.875vw] h-[23.6458vw] rounded-[0.2083vw] overflow-hidden flex-shrink-0"
          style="box-shadow: 0 0 0.5208vw 0 rgba(24, 43, 68, 0.04)"
        >
          <!-- 背景图 -->
          <img :src="item.image" :alt="item.title" class="absolute inset-0 w-full h-full object-cover" />

          <!-- 播放按钮（仅视频案例） -->
          <div
            v-if="item.video"
            class="absolute left-[8.8542vw] top-[4.4792vw] w-[4.1667vw] h-[4.1667vw] rounded-full bg-black/70 flex items-center justify-center z-10 cursor-pointer"
            @click.stop.prevent="showVideo(item.video)"
          >
            <div
              class="w-0 h-0 ml-[0.3vw]"
              style="border-top: 0.78vw solid transparent; border-bottom: 0.78vw solid transparent; border-left: 1.1vw solid white"
            />
          </div>

          <!-- 底部信息区 -->
          <div
            class="info-panel absolute left-0 right-0 bg-white transition-all duration-300 z-20"
            style="top: 13.125vw; height: 10.5208vw"
          >
            <div class="absolute inset-0 px-[0.7813vw] pt-[0.3125vw] pb-[0.7813vw]">
              <!-- 标题 -->
              <h3
                class="font-medium text-[#182B44] truncate transition-colors duration-300 group-hover:text-white font-cn"
                style="font-size: 1.0417vw; line-height: 1.6667vw"
              >
                {{ item.title }}
              </h3>

              <!-- 标签 -->
              <div class="flex flex-wrap gap-[0.4167vw] mt-[0.625vw]">
                <span
                  v-for="(tag, tIdx) in item.tags || [item.category]"
                  :key="tIdx"
                  class="case-tag inline-flex items-center justify-center h-[1.25vw] px-[0.2604vw] rounded-[0.1042vw] text-[0.625vw] border border-[#AAB2B9] text-[#858A90] transition-colors duration-300"
                >
                  {{ tag }}
                </span>
              </div>

              <!-- 描述 -->
              <p
                class="case-desc mt-[0.7813vw] mb-[0.4167vw] text-[#585C60] line-clamp-2 transition-all duration-300 group-hover:text-white/80"
                style="font-size: 0.7292vw; line-height: 1.3542vw"
              >
                {{ item.description }}
              </p>

              <!-- 查看详情 -->
              <div v-if="item.href" class="absolute bottom-[0.7813vw] left-[0.7813vw] flex items-center gap-[0.2083vw]">
                <span class="text-primary transition-colors duration-300 group-hover:text-white" style="font-size: 0.7292vw">
                  查看详情
                </span>
                <svg
                  class="w-[0.8333vw] h-[0.8333vw] text-primary transition-colors duration-300 group-hover:text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
          </div>
        </component>
      </div>

      <!-- 移动端: 2列网格 -->
      <div class="lg:hidden grid grid-cols-2 gap-[3.2vw]">
        <component
          :is="item.href ? 'a' : 'div'"
          v-for="(item, index) in filteredCases"
          :key="index"
          :href="item.href || undefined"
          class="group relative block rounded-lg overflow-hidden bg-white"
          style="box-shadow: 0 0 0.5208vw 0 rgba(24, 43, 68, 0.04)"
        >
          <!-- 图片 -->
          <div class="relative w-full aspect-[420/252] overflow-hidden bg-[#d8d8d8]">
            <img :src="item.image" :alt="item.title" class="w-full h-full object-cover" />
            <!-- 播放按钮（仅视频案例） -->
            <div
              v-if="item.video"
              class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[10vw] h-[10vw] rounded-full bg-black/70 flex items-center justify-center z-10 cursor-pointer"
              @click.stop.prevent="showVideo(item.video)"
            >
              <div
                class="w-0 h-0 ml-[1vw]"
                style="border-top: 2.2vw solid transparent; border-bottom: 2.2vw solid transparent; border-left: 3vw solid white"
              />
            </div>
          </div>

          <!-- 内容区 -->
          <div class="relative p-[3vw] h-[42vw] overflow-hidden">
            <h3 class="text-[3.5vw] font-medium text-[#182B44] leading-tight truncate">
              {{ item.title }}
            </h3>
            <div class="flex flex-wrap gap-[1.5vw] mt-[2vw]">
              <span
                v-for="(tag, tIdx) in item.tags || [item.category]"
                :key="tIdx"
                class="inline-flex items-center justify-center h-[5vw] px-[1.5vw] rounded text-[2.5vw] border"
                style="border-color: #aab2b9; color: #858a90"
              >
                {{ tag }}
              </span>
            </div>
            <p class="mt-[2vw] text-[2.8vw] text-[#585C60] leading-[1.5] line-clamp-2">
              {{ item.description }}
            </p>
            <div v-if="item.href" class="absolute bottom-[3vw] left-[3vw] flex items-center gap-[1vw]">
              <span class="text-[2.8vw] text-primary">查看详情</span>
              <svg class="w-[3vw] h-[3vw] text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>
        </component>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredCases.length === 0" class="text-center py-[8vw] lg:py-[4vw] text-gray-400">
        <p class="text-fluid-base">暂无相关案例</p>
      </div>
    </div>

    <!-- 视频弹窗 -->
    <div
      v-if="videoVisible"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-[4vw] lg:p-[2vw] animate-fade-in"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, nextTick } from "vue";
// Note: onMounted removed, component is fully props-driven now

interface CaseItem {
  image: string;
  title: string;
  category: string;
  description: string;
  href?: string;
  video?: string;
  tags?: string[];
}

interface Props {
  cases: CaseItem[];
}

const props = defineProps<Props>();
const videoVisible = ref(false);
const dplayerRef = ref<HTMLDivElement | null>(null);
let dp: any = null;

onUnmounted(() => {
  destroyPlayer();
});

async function showVideo(url?: string) {
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

const filteredCases = computed(() => props.cases);
</script>

<style scoped>
.group:hover .info-panel {
  top: 10vw !important;
  height: 13.6458vw !important;
  background: linear-gradient(180deg, color-mix(in srgb, var(--primary), transparent 0%) 0%, var(--primary) 100%);
}
.group:hover .case-tag {
  border-color: rgba(255, 255, 255, 0.4) !important;
  color: rgba(255, 255, 255, 0.7) !important;
}

.group:hover .case-desc {
  -webkit-line-clamp: unset;
  display: block;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
