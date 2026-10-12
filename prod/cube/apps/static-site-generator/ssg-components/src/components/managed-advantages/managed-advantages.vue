<template>
  <section class="w-full bg-[#f1f6ff]">
    <div class="w-full py-[6vw] lg:py-[3.3333vw] px-[5vw] lg:px-[15.625vw]">
      <!-- 标题区 -->
      <div class="flex flex-col items-center mb-[6vw] lg:mb-[3.125vw]">
        <div class="relative mb-[3vw] lg:mb-[1.25vw]">
          <h2 class="text-[4.8vw] lg:text-[1.875vw] font-bold text-[#182b44]">{{ title }}</h2>
          <div class="absolute -bottom-[2vw] lg:-bottom-[0.8333vw] left-1/2 -translate-x-1/2 w-[12vw] lg:w-[3.125vw] h-[0.8vw] lg:h-[0.3125vw] bg-primary rounded-full"></div>
        </div>
        <p v-if="subtitle" class="text-[2.8vw] lg:text-[0.8333vw] text-[#585c60] mt-[4vw] lg:mt-[1.5vw]">{{ subtitle }}</p>
      </div>

      <!-- PC端: 4列网格 -->
      <div class="hidden lg:grid lg:grid-cols-4 gap-[1.25vw]">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="bg-white overflow-hidden rounded-[0.4167vw]"
        >
          <!-- 图片区 -->
          <div class="w-full h-[11.9271vw] bg-[#d8d8d8]">
            <img
              :src="item.image"
              :alt="item.title"
              class="w-full h-full object-cover"
            />
          </div>
          <!-- 标题区 -->
          <div class="h-[4.2708vw] flex items-center justify-center bg-white">
            <h3 class="text-[1.0417vw] font-medium text-[#182b44]">{{ item.title }}</h3>
          </div>
        </div>
      </div>

      <!-- 移动端: 2列网格 -->
      <div class="lg:hidden grid grid-cols-2 gap-[3.2vw]">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="bg-white overflow-hidden rounded-[1vw]"
        >
          <!-- 图片区 -->
          <div class="w-full h-[30vw] bg-[#d8d8d8]">
            <img
              :src="item.image"
              :alt="item.title"
              class="w-full h-full object-cover"
            />
          </div>
          <!-- 标题区 -->
          <div class="h-[10vw] flex items-center justify-center bg-white px-[2vw]">
            <h3 class="text-[3.2vw] font-medium text-[#182b44] text-center">{{ item.title }}</h3>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface AdvantageItem {
  image: string
  title: string
}

interface Props {
  title: string
  subtitle?: string
  items: AdvantageItem[]
}

defineProps<Props>()
</script>
