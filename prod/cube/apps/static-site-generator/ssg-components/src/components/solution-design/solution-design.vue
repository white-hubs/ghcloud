<template>
  <div class="w-full bg-[#F9FCFF]">
    <!-- PC 端 -->
    <div class="hidden lg:block h-[37.7083vw] pt-[4.1667vw]">
      <!-- 标题 -->
      <div class="text-center h-[1.6667vw]">
        <h2
          class="text-[1.5625vw] font-bold text-[#182B44] leading-[1.6667vw]"
          style="
            font-family:
              &quot;SOURCEHANSANSSC-BOLD&quot;,
              system-ui,
              -apple-system,
              sans-serif;
          "
        >
          {{ title }}
        </h2>
      </div>
      <!-- 副标题 -->
      <div v-if="subtitle" class="w-[35.7292vw] mx-auto text-center pt-[1.25vw] h-[2.2917vw]">
        <p
          class="text-[0.7292vw] leading-[1.1458vw] text-[#585C60]"
          style="
            font-family:
              &quot;SOURCEHANSANSSC-REGULAR&quot;,
              system-ui,
              -apple-system,
              sans-serif;
          "
        >
          {{ subtitle }}
        </p>
      </div>

      <!-- 内容区 -->
      <div class="flex">
        <!-- 左侧图片 -->
        <div
          class="w-[39.0625vw] h-[21.5625vw] mt-[4.5833vw] ml-[17.7083vw] rounded-[0.3125vw] border-[0.1042vw] border-white shadow-[0_0_1.0417vw_0_rgba(86,118,162,0.1)] overflow-hidden flex-shrink-0"
        >
          <!-- macOS 窗口头 -->
          <div class="bg-[#1a1a2e] flex">
            <div class="w-[0.4167vw] h-[0.4167vw] rounded-full bg-[#EE4646] ml-[0.7813vw] mt-[0.625vw] mb-[0.3125vw]"></div>
            <div class="w-[0.4167vw] h-[0.4167vw] rounded-full bg-[#FFC233] ml-[0.3125vw] mt-[0.625vw] mb-[0.3125vw]"></div>
            <div class="w-[0.4167vw] h-[0.4167vw] rounded-full bg-[#5EDF47] ml-[0.3125vw] mt-[0.625vw] mb-[0.3125vw]"></div>
          </div>
          <img :src="activeItem.image" :alt="activeItem.topic" class="block w-[37.8125vw] h-[19.6354vw] ml-[0.625vw] mt-[0.3125vw]" />
        </div>

        <!-- 右侧列表 -->
        <div class="mt-[4.8958vw] ml-[1.5625vw] h-[20.625vw] overflow-y-scroll scrollbar-custom">
          <div
            v-for="(item, index) in items"
            :key="index"
            class="w-[28.125vw] mb-[1.0417vw] group cursor-pointer"
            @mouseenter="activeIndex = index"
          >
            <div
              class="h-[4.4792vw] rounded-[0.2083vw] border-[0.1042vw] border-white pl-[1.0417vw] flex items-center text-[0.9375vw] font-medium leading-[1.3542vw] text-[#182B44] whitespace-pre-wrap transition-all duration-300"
              :class="
                activeIndex === index
                  ? 'shadow-[0_0_1.0417vw_0_rgba(86,118,162,0.1)] text-primary'
                  : 'hover:shadow-[0_0_1.0417vw_0_rgba(86,118,162,0.1)]'
              "
              style="
                font-family:
                  &quot;SourceHanSansCN-Medium-2&quot;,
                  system-ui,
                  -apple-system,
                  sans-serif;
                background: linear-gradient(180deg, #f5f9ff 0%, #ffffff 100%);
              "
            >
              {{ item.topic }}
            </div>
            <div
              v-show="activeIndex === index"
              class="w-[26.7708vw] text-[0.7292vw] leading-[1.4583vw] text-[#999EA2] mt-[1.0417vw] mb-[1.0417vw] whitespace-pre-wrap"
              style="
                font-family:
                  &quot;SOURCEHANSANSSC-REGULAR&quot;,
                  system-ui,
                  -apple-system,
                  sans-serif;
              "
            >
              {{ item.title }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端 -->
    <div class="lg:hidden w-full relative box-border pl-[5.3333vw] pr-[6.9333vw] pt-[20vw] pb-[1.6vw]">
      <!-- 标题 -->
      <div class="absolute top-[6.9333vw] left-[5.3333vw] h-[8vw]">
        <h2
          class="text-[4.5333vw] font-bold text-[#182B44] leading-[8.5333vw] whitespace-nowrap"
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
      <!-- 副标题 -->
      <div v-if="subtitle" class="mb-[4vw]">
        <p
          class="text-[3.2vw] leading-[1.6] text-[#9DA3AC]"
          style="
            font-family:
              &quot;SOURCEHANSANSSC-REGULAR&quot;,
              system-ui,
              -apple-system,
              sans-serif;
          "
        >
          {{ subtitle }}
        </p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-[3.7333vw] overflow-x-auto pb-[2vw] scrollbar-hide mb-[4vw] h-[8vw] leading-[8vw]">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="flex-shrink-0 h-[6.4vw] text-[3.7333vw] font-medium text-[#182B44] whitespace-nowrap transition-all duration-300 relative"
          style="
            font-family:
              &quot;SourceHanSansCN-Medium-2&quot;,
              system-ui,
              -apple-system,
              sans-serif;
          "
          @click="activeIndex = index"
        >
          {{ item.topic }}
          <div
            v-if="activeIndex === index"
            class="absolute left-1/2 -translate-x-1/2 -bottom-[1vw] w-[5.8667vw] h-[0.7vw] bg-primary rounded-full"
          ></div>
        </div>
      </div>

      <!-- 内容区 -->
      <div v-for="(item, index) in items" :key="index" :class="activeIndex === index ? 'block' : 'hidden'">
        <div
          class="text-[3.2vw] font-medium text-[#182B44] mt-[2.6667vw] mb-[2.6667vw]"
          style="
            font-family:
              &quot;SourceHanSansCN-Medium-2&quot;,
              system-ui,
              -apple-system,
              sans-serif;
          "
        >
          {{ item.topic }}
        </div>
        <div
          class="text-[3.2vw] leading-[1.6] text-[#9DA3AC] mb-[4vw] whitespace-pre-line"
          style="
            font-family:
              &quot;SOURCEHANSANSSC-REGULAR&quot;,
              system-ui,
              -apple-system,
              sans-serif;
          "
        >
          {{ item.title }}
        </div>
        <img :src="item.image" :alt="item.topic" class="w-full h-auto object-cover rounded-lg" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface DesignItem {
  topic: string;
  title: string;
  image: string;
}

interface Props {
  title?: string;
  subtitle?: string;
  items: DesignItem[];
}

const props = withDefaults(defineProps<Props>(), {
  title: "概要设计",
});

const activeIndex = ref(0);
const activeItem = computed(() => props.items[activeIndex.value] || props.items[0]);
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-custom::-webkit-scrollbar {
  width: 5px;
}
.scrollbar-custom::-webkit-scrollbar-thumb {
  background: #f0f0f0;
  border-radius: 37px;
}
</style>
