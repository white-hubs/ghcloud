<template>
  <div class="w-full bg-white">
    <!-- PC端 -->
    <div class="hidden lg:block px-[15.625vw] py-[4.6875vw]">
      <!-- 标题区域 -->
      <div class="text-center mb-[2.0833vw]">
        <h2 class="text-[1.875vw] font-bold text-[#182b44] mb-[1.04vw]">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="text-[0.9375vw] text-gray-500 leading-relaxed max-w-[50vw] mx-auto">
          {{ subtitle }}
        </p>
      </div>
      
      <!-- 应用卡片网格 - 4列 -->
      <div class="grid grid-cols-4 gap-[1.5625vw]" style="max-width: 68.75vw; margin: 0 auto;">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="flex flex-col"
          style="width: 15.625vw;"
        >
          <!-- 图片区域 -->
          <div 
            class="w-full overflow-hidden rounded-lg"
            style="height: 9.792vw;"
          >
            <img
              :src="item.image"
              :alt="item.title"
              class="w-full h-full object-cover"
            />
          </div>
          <!-- 标题区域 -->
          <div class="mt-[1.042vw] text-center">
            <h3 class="text-[1.042vw] font-medium text-[#182b44]">
              {{ item.title }}
            </h3>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端 -->
    <div class="lg:hidden px-[4.2667vw] py-[8vw]">
      <!-- 标题区域 -->
      <div class="text-center mb-[4vw]">
        <h2 class="text-[5vw] font-bold text-[#182b44] mb-[2vw]">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="text-[3.2vw] text-gray-500 leading-relaxed">
          {{ subtitle }}
        </p>
      </div>
      
      <!-- 应用卡片网格 - 2列 -->
      <div class="grid grid-cols-2 gap-[3.2vw]">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="flex flex-col"
        >
          <!-- 图片区域 -->
          <div 
            class="w-full overflow-hidden rounded-lg"
            style="aspect-ratio: 300/188;"
          >
            <img
              :src="item.image"
              :alt="item.title"
              class="w-full h-full object-cover"
            />
          </div>
          <!-- 标题区域 -->
          <div class="mt-[2vw] text-center">
            <h3 class="text-[3.5vw] font-medium text-[#182b44]">
              {{ item.title }}
            </h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ApplicationItem {
  image: string
  title: string
}

interface Props {
  title: string
  subtitle?: string
  items: ApplicationItem[]
}

defineProps<Props>()
</script>
