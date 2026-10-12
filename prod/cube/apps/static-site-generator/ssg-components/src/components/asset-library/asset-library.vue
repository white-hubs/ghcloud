<template>
  <div class="w-full" style="background: linear-gradient(180deg, #0a1628 0%, #0d1f3c 100%);">
    <!-- PC端 -->
    <div class="hidden lg:block px-[15.625vw] py-[4.6875vw]">
      <!-- 标题区域 -->
      <div class="text-center mb-[2.0833vw]">
        <h2 class="text-[1.875vw] font-bold text-white mb-[1.04vw]">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="text-[0.9375vw] text-gray-400 leading-relaxed max-w-[50vw] mx-auto">
          {{ subtitle }}
        </p>
      </div>
      
      <!-- 资源网格 - 2列布局 -->
      <div class="grid grid-cols-2 gap-[1.5625vw]" style="max-width: 68.75vw; margin: 0 auto;">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="flex flex-col"
        >
          <!-- 图片外层容器 -->
          <div 
            class="w-full rounded-[0.8333vw] overflow-hidden flex items-center justify-center"
            style="height: 19.2708vw; background: rgba(255, 255, 255, 0.10); border: 1px solid rgba(255, 255, 255, 0.10);"
          >
            <img
              :src="item.image"
              :alt="item.label || ''"
              class="max-w-full max-h-full"
            />
          </div>
          <!-- 标题区域 -->
          <div v-if="item.label" class="mt-[1.04vw] text-center">
            <span class="text-[0.9375vw] text-gray-300">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端 -->
    <div class="lg:hidden px-[4.2667vw] py-[8vw]">
      <!-- 标题区域 -->
      <div class="text-center mb-[4vw]">
        <h2 class="text-[5vw] font-bold text-white mb-[2vw]">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="text-[3.2vw] text-gray-400 leading-relaxed">
          {{ subtitle }}
        </p>
      </div>
      
      <!-- 资源网格 - 2列布局 -->
      <div class="grid grid-cols-2 gap-[3.2vw]">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="flex flex-col"
        >
          <!-- 图片外层容器 -->
          <div 
            class="w-full rounded-[2.1333vw] overflow-hidden flex items-center justify-center"
            style="height: 48vw; background: rgba(255, 255, 255, 0.10); border: 1px solid rgba(255, 255, 255, 0.10);"
          >
            <img
              :src="item.image"
              :alt="item.label || ''"
              class="max-w-full max-h-full"
            />
          </div>
          <!-- 标题区域 -->
          <div v-if="item.label" class="mt-[2vw] text-center">
            <span class="text-[3vw] text-gray-300">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AssetItem {
  image: string
  label?: string
}

interface Props {
  title: string
  subtitle?: string
  items: AssetItem[]
}

defineProps<Props>()
</script>
