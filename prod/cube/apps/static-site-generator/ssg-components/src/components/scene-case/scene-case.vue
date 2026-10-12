<template>
  <div class="w-full bg-white">
    <!-- PC端 -->
    <div class="hidden lg:block px-[15.625vw] py-[4.6875vw]">
      <!-- 标题 -->
      <div v-if="title" class="text-center mb-[2.0833vw]">
        <h2 class="text-[1.875vw] font-bold text-[#182b44]">
          {{ title }}
        </h2>
      </div>

      <!-- 场景还原图片 -->
      <div v-if="image && !items?.length" class="rounded-lg overflow-hidden bg-gray-100">
        <img
          :src="image"
          :alt="title || '场景还原案例'"
          class="w-full h-auto object-cover"
        />
      </div>

      <!-- 多图片列表 -->
      <div v-if="items?.length" class="flex flex-col gap-[1.5625vw]">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="rounded-lg overflow-hidden bg-gray-100"
        >
          <img
            :src="item.image"
            :alt="item.label || title || '场景还原案例'"
            class="w-full h-auto object-cover"
          />
        </div>
      </div>
    </div>

    <!-- 移动端 -->
    <div class="lg:hidden px-[4.2667vw] py-[8vw]">
      <!-- 标题 -->
      <div v-if="title" class="text-center mb-[4vw]">
        <h2 class="text-[5vw] font-bold text-[#182b44]">
          {{ title }}
        </h2>
      </div>

      <!-- 场景还原图片 -->
      <div v-if="image && !items?.length" class="rounded-lg overflow-hidden bg-gray-100">
        <img
          :src="image"
          :alt="title || '场景还原案例'"
          class="w-full h-auto object-cover"
        />
      </div>

      <!-- 多图片网格 -->
      <div v-if="items?.length" class="flex flex-col gap-[4vw]">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="rounded-lg overflow-hidden bg-gray-100"
        >
          <img
            :src="item.image"
            :alt="item.label || title || '场景还原案例'"
            class="w-full h-auto object-cover"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SceneItem {
  image: string
  label?: string
}

interface Props {
  title?: string
  image?: string
  items?: SceneItem[]
}

defineProps<Props>()
</script>
