<template>
  <div :id="sectionId" class="w-full" :class="theme === 'dark' ? 'bg-[#070e24]' : 'bg-white'">
    <!-- 标题区域 -->
    <div v-if="title" class="flex flex-col items-center mb-[3vw] pt-[4vw]">
      <h2 class="text-[1.875vw] font-bold mb-[0.7vw]" :class="theme === 'dark' ? 'text-white' : 'text-[#07101c]'">
        {{ title }}
      </h2>
      <div class="w-[3.125vw] h-[0.3125vw] bg-primary rounded-full"></div>
    </div>

    <!-- PC端: 左右交替布局 -->
    <div class="hidden lg:block pb-[4.375vw]">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="flex items-start gap-[4.17vw] max-w-[68.33vw] mx-auto py-[2.08vw]"
        :class="index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'"
      >
        <!-- 图片 -->
        <div class="flex-shrink-0 w-[30.21vw] aspect-[580/306] rounded-lg overflow-hidden bg-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          <img :src="item.image" alt="" class="w-full h-full object-cover" />
        </div>
        <!-- 内容 -->
        <div class="flex-1 pt-[0.5vw]">
          <h3 class="text-[1.25vw] font-bold mb-[1.04vw]" :class="theme === 'dark' ? 'text-white' : 'text-[#182b44]'">
            {{ item.title }}
          </h3>
          <p
            v-if="item.subtitle"
            class="text-[0.833vw] mb-[1.56vw] leading-relaxed font-light"
            :class="theme === 'dark' ? 'text-white' : 'text-gray-500'"
          >
            {{ item.subtitle }}
          </p>
          <!-- 特性列表 - label:value 格式 -->
          <ul v-if="item.features?.length" class="space-y-[0.73vw]">
            <li
              v-for="(feature, fIndex) in item.features"
              :key="fIndex"
              class="text-[0.729vw] leading-relaxed"
              :class="theme === 'dark' ? 'text-white' : 'text-gray-600'"
            >
              <span class="font-medium" :class="theme === 'dark' ? 'text-white' : 'text-[#182b44]'">{{ feature.label }}</span>
              <span class="font-light">{{ feature.value }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 移动端: 垂直布局 -->
    <div class="lg:hidden pb-[6vw] px-[4.2667vw]">
      <div v-for="(item, index) in items" :key="index" class="flex flex-col gap-[3vw] py-[4vw]">
        <!-- 图片 -->
        <div class="w-full aspect-[16/9] rounded-lg overflow-hidden bg-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          <img :src="item.image" alt="" class="w-full h-full object-cover" />
        </div>
        <!-- 内容 -->
        <div>
          <h3 class="text-[4.5vw] font-bold mb-[2vw]" :class="theme === 'dark' ? 'text-white' : 'text-[#182b44]'">
            {{ item.title }}
          </h3>
          <p
            v-if="item.subtitle"
            class="text-[3vw] mb-[3vw] leading-relaxed font-light"
            :class="theme === 'dark' ? 'text-white' : 'text-gray-500'"
          >
            {{ item.subtitle }}
          </p>
          <!-- 特性列表 - label:value 格式 -->
          <ul v-if="item.features?.length" class="space-y-[2vw]">
            <li
              v-for="(feature, fIndex) in item.features"
              :key="fIndex"
              class="text-[2.8vw] leading-relaxed"
              :class="theme === 'dark' ? 'text-white' : 'text-gray-600'"
            >
              <span class="font-medium" :class="theme === 'dark' ? 'text-white' : 'text-[#182b44]'">{{ feature.label }}</span>
              <span class="font-light">{{ feature.value }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Feature {
  label: string;
  value: string;
}

interface CapabilityItem {
  image: string;
  title: string;
  subtitle?: string;
  features: Feature[];
}

interface Props {
  title?: string;
  items: CapabilityItem[];
  theme?: "light" | "dark";
  sectionId?: string;
}

withDefaults(defineProps<Props>(), {
  theme: "light",
  sectionId: "",
});
</script>
