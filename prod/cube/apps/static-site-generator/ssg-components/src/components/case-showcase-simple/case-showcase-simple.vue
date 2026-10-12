<template>
  <section class="w-full bg-white">
    <div class="w-full py-[6vw] lg:py-[3.3333vw] px-[5vw] lg:px-[15.625vw]">
      <!-- 标题区 -->
      <div class="flex flex-col items-center mb-[6vw] lg:mb-[3.125vw]">
        <div class="relative mb-[3vw] lg:mb-[1.25vw]">
          <h2 class="text-[4.8vw] lg:text-[1.875vw] font-bold text-[#182b44]">{{ title }}</h2>
          <div
            class="absolute -bottom-[2vw] lg:-bottom-[0.8333vw] left-1/2 -translate-x-1/2 w-[12vw] lg:w-[3.125vw] h-[0.8vw] lg:h-[0.3125vw] bg-primary rounded-full"
          ></div>
        </div>
        <p v-if="subtitle" class="text-[2.8vw] lg:text-[0.8333vw] text-[#585c60] mt-[4vw] lg:mt-[1.5vw]">{{ subtitle }}</p>
      </div>

      <!-- PC端: 4列网格 -->
      <div
        class="hidden lg:grid gap-[1.25vw]"
        :class="{ 'lg:grid-cols-4': cases.length >= 4, 'mx-auto': cases.length < 4 }"
        :style="
          cases.length < 4
            ? {
                gridTemplateColumns: `repeat(${cases.length}, minmax(0, 1fr))`,
                width: `calc(${cases.length} * (100% + 1.25vw) / 4 - 1.25vw)`,
              }
            : {}
        "
      >
        <component
          :is="item.link ? 'a' : 'div'"
          v-for="(item, index) in cases"
          :key="index"
          :href="item.link || undefined"
          class="group block"
        >
          <!-- 图片区 -->
          <div class="w-full h-[9.7917vw] bg-[#d8d8d8] overflow-hidden rounded-[0.4167vw] mb-[1.0417vw]">
            <img
              :src="item.image"
              :alt="item.title"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <!-- 标题 -->
          <h3 class="text-[1.0417vw] text-[#182b44] text-center">{{ item.title }}</h3>
        </component>
      </div>

      <!-- 移动端: 2列网格 -->
      <div
        class="lg:hidden grid gap-[3.2vw]"
        :class="{ 'grid-cols-2': cases.length >= 2, 'mx-auto': cases.length < 2 }"
        :style="
          cases.length < 2
            ? {
                gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
                width: 'calc((100% + 3.2vw) / 2 - 3.2vw)',
              }
            : {}
        "
      >
        <component
          :is="item.link ? 'a' : 'div'"
          v-for="(item, index) in cases"
          :key="index"
          :href="item.link || undefined"
          class="group block"
        >
          <!-- 图片区 -->
          <div class="w-full h-[25vw] bg-[#d8d8d8] overflow-hidden rounded-[1vw] mb-[2vw]">
            <img :src="item.image" :alt="item.title" class="w-full h-full object-cover" />
          </div>
          <!-- 标题 -->
          <h3 class="text-[3.2vw] text-[#182b44] text-center">{{ item.title }}</h3>
        </component>
      </div>

      <!-- 查看更多链接 -->
      <div v-if="viewMoreLink" class="mt-[6vw] lg:mt-[3.125vw] text-center">
        <a
          :href="viewMoreLink"
          class="inline-flex items-center text-[2.8vw] lg:text-[0.7292vw] text-primary hover:text-primary-dark transition-colors"
        >
          <span>查看更多</span>
          <svg
            class="w-[2.8vw] h-[2.8vw] lg:w-[0.78125vw] lg:h-[0.78125vw] ml-[1vw] lg:ml-[0.2604vw]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface CaseItem {
  image: string;
  title: string;
  link?: string;
}

interface Props {
  title: string;
  subtitle?: string;
  cases: CaseItem[];
  viewMoreLink?: string;
}

defineProps<Props>();
</script>
