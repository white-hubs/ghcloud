<template>
  <section class="w-full bg-white">
    <!-- Desktop -->
    <div class="hidden lg:block pt-[4.1667vw]">
      <h2 class="text-[1.875vw] font-bold text-[#182B44] text-center">{{ title }}</h2>
      <div class="flex justify-center gap-[1.6146vw] mt-[2.6042vw]">
        <img
          v-for="(img, index) in images"
          :key="index"
          :src="img"
          alt=""
          class="w-[15.9375vw] h-[10vw] object-cover"
        />
      </div>
      <div class="flex justify-center gap-[1.6146vw] mt-[1.0417vw]">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="w-[15.9375vw] h-[10vw] bg-[#FCFEFF] shadow-[0px_4px_20px_0px_rgba(86,118,162,0.06)] border border-white p-[1.0417vw]"
        >
          <h3 class="text-[0.9375vw] font-medium text-[#182B44] leading-[1.6667vw]">{{ item.title }}</h3>
          <p class="text-[0.7292vw] font-light text-[#585C60] leading-[1.25vw] mt-[0.625vw]">{{ item.description }}</p>
        </div>
      </div>
    </div>

    <!-- Mobile -->
    <div class="lg:hidden pt-10 pb-10">
      <h2 class="text-[24px] font-bold text-[#182B44] text-center">{{ title }}</h2>
      <div class="flex flex-wrap justify-center gap-4 mt-6">
        <img
          v-for="(img, index) in images"
          :key="index"
          :src="img"
          alt=""
          class="w-[45%] h-auto object-cover"
        />
      </div>
      <div class="flex flex-col gap-4 mt-4 px-4">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="w-full bg-[#FCFEFF] shadow-lg border border-white p-5"
        >
          <h3 class="text-base font-medium text-[#182B44]">{{ item.title }}</h3>
          <p class="text-sm font-light text-[#585C60] mt-2">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface CooperationItem {
  title: string
  description: string
}

interface Props {
  title?: string
  images: string[]
  items: CooperationItem[]
}

withDefaults(defineProps<Props>(), {
  title: '合作方式',
})
</script>
