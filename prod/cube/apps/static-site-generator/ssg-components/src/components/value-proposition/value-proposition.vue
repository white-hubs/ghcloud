<template>
  <div :id="sectionId" class="w-full py-[3.5vw]" :style="{ backgroundColor: backgroundColor || '#f5f7fa' }">
    <div class="max-w-[120rem] mx-auto px-[4vw] lg:px-[15.625vw]">
      <!-- 标题区域 - 居中 -->
      <div v-if="title" class="flex flex-col items-center mb-[3vw] lg:mb-[3.125vw]">
        <h2 class="text-[5.3333vw] lg:text-[1.875vw] font-bold text-[#07101c] mb-[2vw] lg:mb-[0.7vw]">
          {{ title }}
        </h2>
        <div class="w-[8vw] lg:w-[3.125vw] h-[1vw] lg:h-[0.3125vw] bg-primary rounded-full mb-[3vw] lg:mb-[2.0833vw]"></div>
        <p v-if="subtitle" class="text-[3.2vw] lg:text-[0.8333vw] text-[#585c60]">
          {{ subtitle }}
        </p>
      </div>

      <!-- PC端: 2x2 网格 -->
      <div class="hidden lg:grid lg:grid-cols-2 lg:gap-[1.5vw]">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="group flex items-center p-[1.5vw] bg-white rounded-lg border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
        >
          <!-- 图标区域 -->
          <div class="w-[5vw] h-[5vw] flex-shrink-0 mr-[1.2vw] bg-[#f5f7fa] rounded-lg p-[0.8vw] flex items-center justify-center">
            <img
              :src="item.icon"
              :alt="item.title"
              class="w-full h-full object-contain"
            >
          </div>
          <!-- 文字区域 -->
          <div class="flex-1 min-w-0">
            <h3 class="text-[0.9375vw] font-bold text-[#182b44] mb-[0.4vw]">
              {{ item.title }}
            </h3>
            <p class="text-[0.7292vw] text-gray-500 leading-relaxed line-clamp-2">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- 移动端: 单列 -->
      <div class="lg:hidden flex flex-col gap-[3.2vw]">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="flex items-center p-[4vw] bg-white rounded-lg border border-gray-100"
        >
          <!-- 图标区域 -->
          <div class="w-[12vw] h-[12vw] flex-shrink-0 mr-[3vw] bg-[#f5f7fa] rounded-lg p-[2vw] flex items-center justify-center">
            <img
              :src="item.icon"
              :alt="item.title"
              class="w-full h-full object-contain"
            >
          </div>
          <!-- 文字区域 -->
          <div class="flex-1">
            <h3 class="text-[3.8vw] font-bold text-[#182b44] mb-[1vw]">
              {{ item.title }}
            </h3>
            <p class="text-[2.8vw] text-gray-500 leading-relaxed">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ValueItem {
  icon: string
  title: string
  description: string
}

interface Props {
  title?: string
  subtitle?: string
  items: ValueItem[]
  backgroundColor?: string
  sectionId?: string
}

withDefaults(defineProps<Props>(), {
  sectionId: ''
})
</script>
