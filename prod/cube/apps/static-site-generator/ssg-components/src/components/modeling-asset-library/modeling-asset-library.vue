<template>
  <section class="w-full bg-white">
    <div class="w-full py-[6vw] lg:py-[3.3333vw] px-[5vw] lg:px-[15.625vw]">
      <!-- 标题区 -->
      <div class="flex flex-col items-center mb-[6vw] lg:mb-[3.125vw]">
        <div class="relative mb-[3vw] lg:mb-[1.25vw]">
          <h2 class="text-[4.8vw] lg:text-[1.875vw] font-bold text-[#182b44]">{{ title }}</h2>
          <div class="absolute -bottom-[2vw] lg:-bottom-[0.8333vw] left-1/2 -translate-x-1/2 w-[12vw] lg:w-[3.125vw] h-[0.8vw] lg:h-[0.3125vw] bg-primary rounded-full"></div>
        </div>
        <p v-if="subtitle" class="text-[2.8vw] lg:text-[0.8333vw] text-[#585c60] mt-[4vw] lg:mt-[1.5vw]">{{ subtitle }}</p>
      </div>

      <!-- PC端: 2x2网格 -->
      <div class="hidden lg:grid lg:grid-cols-2 gap-[1.25vw]">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="flex items-start gap-[1.5625vw] p-[2.0833vw] bg-[#f8fafc] rounded-[0.4167vw]"
        >
          <!-- 图标 -->
          <div class="w-[6.25vw] h-[6.25vw] flex-shrink-0">
            <img
              :src="item.icon"
              :alt="item.title"
              class="w-full h-full object-contain"
            />
          </div>
          <!-- 内容 -->
          <div class="flex-1 min-w-0">
            <h3 class="text-[0.9375vw] font-medium text-[#182b44] mb-[0.78125vw]">{{ item.title }}</h3>
            <p class="text-[0.7292vw] text-[#585c60] leading-relaxed">{{ item.description }}</p>
          </div>
        </div>
      </div>

      <!-- 移动端: 单列 -->
      <div class="lg:hidden flex flex-col gap-[3.2vw]">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="flex items-start gap-[3.2vw] p-[4vw] bg-[#f8fafc] rounded-[1vw]"
        >
          <!-- 图标 -->
          <div class="w-[16vw] h-[16vw] flex-shrink-0">
            <img
              :src="item.icon"
              :alt="item.title"
              class="w-full h-full object-contain"
            />
          </div>
          <!-- 内容 -->
          <div class="flex-1 min-w-0">
            <h3 class="text-[3.6vw] font-medium text-[#182b44] mb-[2vw]">{{ item.title }}</h3>
            <p class="text-[2.8vw] text-[#585c60] leading-relaxed">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface AssetItem {
  icon: string
  title: string
  description: string
}

interface Props {
  title: string
  subtitle?: string
  items: AssetItem[]
}

defineProps<Props>()
</script>
