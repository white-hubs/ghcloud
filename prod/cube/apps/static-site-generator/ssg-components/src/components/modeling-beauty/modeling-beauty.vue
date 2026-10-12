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

      <!-- 图片列表：上下排列 -->
      <div class="flex flex-col gap-[4vw] lg:gap-[1.875vw]">
        <div
          v-for="(src, index) in images"
          :key="index"
          class="w-full overflow-hidden rounded-[1vw] lg:rounded-[0.4167vw] bg-[#f5f7fa]"
        >
          <img
            :src="src"
            :alt="`${title}-${index + 1}`"
            class="w-full h-auto object-cover block"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  images: string[]
}

defineProps<Props>()
</script>
