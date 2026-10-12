<template>
  <div class="w-full bg-[#f5f8ff] py-[8vw] lg:py-[3.3333vw]">
    <div class="w-full lg:max-w-[120rem] mx-auto px-[4vw] lg:px-[4.6875vw]">
      <!-- 标题区域 -->
      <div class="flex flex-col items-center mb-[8vw] lg:mb-[5.625vw]">
        <h2 v-if="title" class="text-[5.3333vw] lg:text-[1.875vw] font-bold text-[#07101c] mb-[2vw] lg:mb-[0.5vw]">{{ title }}</h2>
        <div class="w-[8vw] lg:w-[3.125vw] h-[1vw] lg:h-[0.3125vw] bg-primary rounded-full mb-[4vw] lg:mb-[2vw]"></div>
        <p v-if="subtitle" class="text-[3.2vw] lg:text-[0.9375vw] text-[#585c60] text-center w-full lg:max-w-[49.6875vw]">{{ subtitle }}</p>
      </div>

      <!-- 3个卡片 -->
      <div class="flex flex-col lg:flex-row justify-center gap-[4vw] lg:gap-[2.6042vw] mb-[8vw] lg:mb-[5.2083vw]">
        <div
          v-for="(stat, index) in stats"
          :key="index"
          class="flex flex-col items-center bg-white rounded-xl lg:rounded-[0.9375vw] shadow-sm hover:shadow-lg transition-all duration-300 w-full lg:w-[21.3542vw] h-[30vw] lg:h-[15.625vw]"
        >
          <div class="mt-[4vw] lg:mt-[2.1875vw] mb-[2vw] lg:mb-[1.5625vw] w-[12vw] lg:w-[6.25vw] h-[12vw] lg:h-[6.25vw]">
            <img :src="stat.icon" :alt="stat.label" class="w-full h-full object-contain" />
          </div>
          <p class="text-[3.2vw] lg:text-[0.9375vw] text-[#585c60] font-medium text-center px-[4vw] lg:px-[2vw]">{{ stat.label }}</p>
        </div>
      </div>

      <!-- 中间说明文字和图片 -->
      <div class="flex flex-col items-center">
        <p v-if="description" class="text-[3.2vw] lg:text-[0.9375vw] text-[#585c60] text-center w-full lg:max-w-[40.3125vw] mb-[6vw] lg:mb-[2.9167vw]">{{ description }}</p>
        <div v-if="image" class="w-full lg:w-[68.3333vw] aspect-video lg:aspect-auto lg:h-[32.3958vw] bg-white rounded-xl lg:rounded-[1.7708vw] overflow-hidden shadow-sm">
          <img :src="image" :alt="title" class="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface StatItem {
  icon: string
  label: string
}

interface Props {
  title?: string
  subtitle?: string
  description?: string
  image?: string
  stats: StatItem[]
}

defineProps<Props>()
</script>
