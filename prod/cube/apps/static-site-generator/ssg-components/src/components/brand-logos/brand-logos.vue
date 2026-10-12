<template>
  <div class="w-full py-[3.5vw]" :style="{ backgroundColor: backgroundColor || '#ffffff' }">
    <div class="max-w-[120rem] mx-auto px-[15.625vw]">
      <!-- 标题区域 - 居中 -->
      <div v-if="title" class="flex flex-col items-center mb-[2.5vw]">
        <h2 class="text-[1.875vw] font-bold text-[#07101c] mb-[0.7vw]">
          {{ title }}
        </h2>
        <div class="w-[3.125vw] h-[0.3125vw] bg-primary rounded-full mb-[1vw]"></div>
        <div
          v-if="subtitle"
          class="w-full lg:w-[68.3333vw] h-auto lg:h-[8.4375vw] bg-[linear-gradient(155deg,#f0f6ff_16%,#f1f6ff_98%)] border lg:border-[0.1042vw] border-white rounded-lg lg:rounded-[0.5208vw] flex items-center px-[4vw] py-[3vw] lg:px-[2.5vw] lg:py-0 mx-auto"
        >
          <p class="text-[3vw] lg:text-[1vw] text-[#758296] text-left leading-relaxed" v-html="subtitle"></p>
        </div>
      </div>

      <!-- PC端: 自动换行6列网格 -->
      <div class="hidden lg:grid lg:grid-cols-6 gap-[1vw]">
        <div
          v-for="(logo, index) in logos"
          :key="index"
          class="flex items-center justify-center bg-white rounded-lg hover:border-primary hover:shadow-sm transition-all duration-200 border border-gray-100"
        >
          <img
            :src="logo.image"
            :alt="logo.name || 'Brand logo'"
            class="h-[3.5vw] object-contain"
          >
        </div>
      </div>

      <!-- 移动端: 网格布局 -->
      <div class="lg:hidden grid grid-cols-4 gap-[2.6667vw]">
        <div
          v-for="(logo, index) in logos"
          :key="index"
          class="flex items-center justify-center bg-white rounded-lg border border-gray-100"
        >
          <img
            :src="logo.image"
            :alt="logo.name || 'Brand logo'"
            class="h-[8vw] object-contain"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Logo {
  image: string
  name?: string
  href?: string
}

interface Props {
  title?: string
  subtitle?: string
  backgroundColor?: string
  logos: Logo[]
}

defineProps<Props>()
</script>
