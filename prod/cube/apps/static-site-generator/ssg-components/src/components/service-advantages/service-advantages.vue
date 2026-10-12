<template>
  <section class="w-full bg-[#F9FCFF]">
    <!-- Desktop -->
    <div class="hidden lg:block pt-[4.1667vw] pb-[4.1667vw]">
      <h2 class="text-[1.875vw] font-bold text-[#182B44] text-center">{{ title }}</h2>
      <p v-if="subtitle" class="text-[0.7292vw] text-[#585C60] text-center mt-[1.3542vw]">{{ subtitle }}</p>
      <div class="flex flex-wrap justify-center gap-[1.5625vw] mt-[2.6042vw]">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="w-[21.875vw] h-[7.7083vw] bg-gradient-to-b from-[#F5F9FF] to-[#FEFEFF] shadow-[0px_0px_20px_rgba(86,118,162,0.1)] rounded border border-white p-[1.5625vw]"
        >
          <div class="flex items-center">
            <img :src="item.icon" alt="" class="w-[1.875vw] h-[1.875vw]" />
            <h3 class="text-[1.0417vw] font-medium text-[#182B44] ml-[0.4167vw]">{{ item.title }}</h3>
          </div>
          <p class="text-[0.7292vw] text-[#999EA2] mt-[0.7292vw] ml-[2.2917vw]">{{ item.description }}</p>
        </div>
      </div>
    </div>

    <!-- Mobile -->
    <div class="lg:hidden pt-10 pb-10 px-4">
      <h2 class="text-[24px] font-bold text-[#182B44] text-center">{{ title }}</h2>
      <p v-if="subtitle" class="text-sm text-[#585C60] text-center mt-4">{{ subtitle }}</p>
      <div class="flex flex-col gap-4 mt-6">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="w-full h-auto bg-gradient-to-b from-[#F5F9FF] to-[#FEFEFF] shadow-[0px_0px_20px_rgba(86,118,162,0.1)] rounded border border-white p-5"
        >
          <div class="flex items-center">
            <img :src="item.icon" alt="" class="w-8 h-8" />
            <h3 class="text-base font-medium text-[#182B44] ml-2">{{ item.title }}</h3>
          </div>
          <p class="text-sm text-[#999EA2] mt-3 ml-10">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface AdvantageItem {
  icon: string
  title: string
  description: string
}

interface Props {
  title: string
  subtitle?: string
  items: AdvantageItem[]
}

defineProps<Props>()
</script>
