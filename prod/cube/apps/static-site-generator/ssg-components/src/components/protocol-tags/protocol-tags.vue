<template>
  <div class="w-full py-[3.5vw]" :style="{ backgroundColor: backgroundColor || '#ebf2ff' }">
    <div class="max-w-[120rem] mx-auto px-[15.625vw]">
      <!-- 标题区域 - 居中 -->
      <div v-if="title" class="flex flex-col items-center mb-[2.5vw]">
        <h2 class="text-[1.875vw] font-bold text-[#07101c] mb-[0.7vw]">
          {{ title }}
        </h2>
        <div class="w-[3.125vw] h-[0.3125vw] bg-primary rounded-full"></div>
      </div>

      <!-- 副标题 -->
      <p v-if="subtitle" class="text-[0.9375vw] text-gray-600 leading-relaxed max-w-[50vw] mx-auto text-center mb-[2.5vw]">
        {{ subtitle }}
      </p>

      <!-- PC端: 标签网格 - 两行 -->
      <div class="hidden lg:flex lg:flex-col gap-[1vw]">
        <div class="flex gap-[1vw]">
          <div
            v-for="(tag, index) in tags.slice(0, 6)"
            :key="index"
            class="flex-1 flex items-center justify-center bg-white rounded-lg hover:border-primary hover:shadow-sm transition-all duration-200 border border-gray-100"
          >
            <img :src="tag.image" :alt="tag.name" class="h-[3.5vw] object-contain">
          </div>
        </div>
        <div class="flex gap-[1vw] justify-center">
          <div
            v-for="(tag, index) in tags.slice(6)"
            :key="index + 6"
            class="flex items-center justify-center bg-white rounded-lg hover:border-primary hover:shadow-sm transition-all duration-200 border border-gray-100"
            style="width: calc((100% - 5vw) / 6);"
          >
            <img :src="tag.image" :alt="tag.name" class="h-[3.5vw] object-contain">
          </div>
        </div>
      </div>

      <!-- 移动端: 标签网格 -->
      <div class="lg:hidden flex flex-wrap gap-[2.6667vw] justify-center">
        <div
          v-for="(tag, index) in tags"
          :key="index"
          class="flex items-center justify-center bg-white rounded-lg border border-gray-100"
        >
          <img :src="tag.image" :alt="tag.name" class="h-[8vw] object-contain">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ProtocolTag {
  name: string
  image: string
}

interface Props {
  title?: string
  subtitle?: string
  backgroundColor?: string
  tags: ProtocolTag[]
}

defineProps<Props>()
</script>
