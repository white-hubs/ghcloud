<template>
  <div class="w-full bg-white">
    <!-- PC端 -->
    <div class="hidden lg:block px-[15.625vw] py-[4.6875vw]">
      <!-- 标题区域 -->
      <div class="text-center mb-[2.0833vw]">
        <h2 class="text-[1.875vw] font-bold text-[#182b44] mb-[1.04vw]">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="text-[0.9375vw] text-gray-500 leading-relaxed max-w-[60vw] mx-auto">
          {{ subtitle }}
        </p>
      </div>
      
      <!-- 图片 -->
      <div class="w-full rounded-lg overflow-hidden">
        <img
          :src="image"
          :alt="title"
          class="w-full h-auto object-cover"
        />
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
      
      <!-- 图片 -->
      <div class="w-full rounded-lg overflow-hidden">
        <img
          :src="image"
          :alt="title"
          class="w-full h-auto object-cover"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  image: string
}

defineProps<Props>()
</script>
