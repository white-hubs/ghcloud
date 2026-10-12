<template>
  <component
    :is="href ? 'a' : 'div'"
    :href="href"
    class="group block w-full overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
    :class="{ 'cursor-pointer': href }"
  >
    <!-- 图片区域 -->
    <div class="relative w-full lg:w-[17.7083vw] lg:h-[9.8958vw] overflow-hidden">
      <img
        :src="image"
        :alt="title"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      >
      <!-- 标签 -->
      <div
        v-if="tags && tags.length"
        class="absolute top-[0.625vw] left-[0.625vw] flex flex-wrap gap-[0.4167vw]"
      >
        <span
          v-for="(tag, index) in tags"
          :key="index"
          class="px-[0.4167vw] py-[0.2083vw] bg-primary/90 text-white text-fluid-xs rounded"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="p-[1.0417vw]">
      <h3 class="text-fluid-base font-medium text-gray-900 line-clamp-1 mb-[0.4167vw]">
        {{ title }}
      </h3>
      <p v-if="subtitle" class="text-fluid-sm text-gray-500 line-clamp-2">
        {{ subtitle }}
      </p>
    </div>
  </component>
</template>

<script setup lang="ts">
interface Props {
  image: string
  title: string
  subtitle?: string
  href?: string
  tags?: string[]
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
  href: '',
  tags: () => [],
})
</script>
