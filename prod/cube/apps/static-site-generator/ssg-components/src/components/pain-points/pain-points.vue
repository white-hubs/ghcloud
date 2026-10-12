<template>
  <div :id="sectionId" class="w-full py-[4vw]" :style="{ backgroundColor: backgroundColor || '#ebf2ff' }">
    <div class="max-w-[120rem] mx-auto px-[5vw] lg:px-[15.625vw]">
      <!-- 标题区域 -->
      <div v-if="title" class="flex flex-col items-center mb-[3vw]">
        <h2 class="text-[1.875vw] font-bold text-[#060b1a] mb-[0.7vw]">
          {{ title }}
        </h2>
        <div class="w-[3.125vw] h-[0.3125vw] bg-primary rounded-full"></div>
      </div>

      <!-- PC端: 4列网格 -->
      <div class="hidden lg:flex lg:justify-center lg:gap-[2.08vw]">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="w-[15.52vw] h-[16.67vw] bg-white rounded-lg relative overflow-hidden"
          style="box-shadow: 0 2px 8px rgba(0,0,0,0.06);"
        >
          <!-- 灰色图标背景 -->
          <div 
            class="absolute left-[1.875vw] top-[3.125vw] w-[3.125vw] h-[3.125vw] rounded-lg"
            style="background-color: #eef2f8;"
          ></div>
          <!-- 图标 -->
          <img
            :src="item.icon"
            :alt="item.title"
            class="absolute left-[1.72vw] top-[1.25vw] w-[4.84vw] h-[6.04vw] object-contain"
          />
          <!-- 标题 -->
          <h3 class="absolute left-[1.875vw] top-[8.125vw] text-[0.9375vw] font-semibold text-[#060b1a]">
            {{ item.title }}
          </h3>
          <!-- 描述 -->
          <p class="absolute left-[1.875vw] top-[10.5vw] w-[11.875vw] text-[0.7292vw] leading-[1.6] text-[#4B5563] font-light">
            {{ item.description }}
          </p>
        </div>
      </div>

      <!-- 移动端: 单列布局 -->
      <div class="lg:hidden flex flex-col gap-[4vw]">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="w-full bg-white rounded-lg p-[4vw] relative"
          style="box-shadow: 0 2px 8px rgba(0,0,0,0.06);"
        >
          <!-- 灰色图标背景 -->
          <div 
            class="w-[12vw] h-[12vw] rounded-lg mb-[3vw] flex items-center justify-center"
            style="background-color: #eef2f8;"
          >
            <!-- 图标 -->
            <img
              :src="item.icon"
              :alt="item.title"
              class="w-[10vw] h-[12.5vw] object-contain"
            />
          </div>
          <!-- 标题 -->
          <h3 class="text-[3.8vw] font-semibold text-[#060b1a] mb-[2vw]">
            {{ item.title }}
          </h3>
          <!-- 描述 -->
          <p class="text-[3vw] leading-[1.6] text-[#4b5563] font-light">
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PainPointItem {
  icon: string
  title: string
  description: string
}

interface Props {
  title?: string
  items: PainPointItem[]
  backgroundColor?: string
  sectionId?: string
}

withDefaults(defineProps<Props>(), {
  title: '业务痛点',
  backgroundColor: '#ebf2ff',
  sectionId: ''
})
</script>
