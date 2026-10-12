<template>
  <div :id="sectionId" class="w-full py-[4vw]" :style="{ backgroundColor: bgColor || '#ffffff' }">
    <div class="max-w-[120rem] mx-auto px-[4vw] lg:px-[15.625vw]">
      <!-- 标题区域 - 居中 -->
      <div v-if="title" class="flex flex-col items-center mb-[3vw]">
        <h2 class="text-[5.3333vw] lg:text-[1.875vw] font-bold text-[#07101c] mb-[2vw] lg:mb-[0.7vw]">
          {{ title }}
        </h2>
        <div class="w-[8vw] lg:w-[3.125vw] h-[1vw] lg:h-[0.3125vw] bg-primary rounded-full mb-[2vw] lg:mb-[1vw]"></div>
        <p v-if="subtitle" class="text-[2.8vw] lg:text-[0.8333vw] text-[#585c60] text-center">{{ subtitle }}</p>
      </div>

      <!-- PC端: 4列网格 -->
      <div class="hidden lg:flex lg:justify-center lg:gap-[1.8vw]">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="group w-[15.625vw] rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
          style="box-shadow: 0 2px 8px rgba(0,0,0,0.06);"
        >
          <!-- 图片区域 - 上方 -->
          <div class="h-[9.167vw] overflow-hidden bg-gray-100">
            <img
              :src="item.image"
              alt=""
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <!-- 内容区域 - 下方，带渐变背景 -->
          <div class="relative px-[1.5vw] py-[1.2vw] text-center flex-1 flex flex-col justify-start">
            <h3 class="text-[0.9375vw] font-medium text-[#182b44] mb-[0.6vw] leading-tight">
              {{ item.title }}
            </h3>
            <p v-if="item.description" class="text-[0.85vw] text-gray-500 leading-relaxed inline-block text-left font-light">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- 移动端: 单列，卡片左图右文 -->
      <div class="lg:hidden flex flex-col gap-[3vw]">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="group rounded-lg overflow-hidden flex flex-row items-stretch"
          style="box-shadow: 0 2px 8px rgba(0,0,0,0.06);"
        >
          <!-- 图片 - 左侧 -->
          <div class="w-[35vw] flex-shrink-0 overflow-hidden bg-gray-100">
            <img
              :src="item.image"
              alt=""
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <!-- 内容 - 右侧 -->
          <div class="p-[3vw] flex-1 flex flex-col justify-center" style="background: linear-gradient(180deg, #f8fafc 0%, #eef2f8 100%);">
            <h3 class="text-[3.5vw] font-medium text-[#182b44] mb-[1vw] leading-tight">
              {{ item.title }}
            </h3>
            <p v-if="item.description" class="text-[2.8vw] text-gray-500">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FeatureItem {
  image: string
  title: string
  description?: string
}

interface Props {
  title?: string
  subtitle?: string
  items: FeatureItem[]
  bgColor?: string
  sectionId?: string
}

withDefaults(defineProps<Props>(), {
  sectionId: ''
})
</script>
