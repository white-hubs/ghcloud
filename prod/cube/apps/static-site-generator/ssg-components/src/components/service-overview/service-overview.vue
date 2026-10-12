<template>
  <section class="w-full bg-[#F9FCFF]">
    <!-- Desktop -->
    <div class="hidden lg:block pt-[4.1667vw] pb-[4.1667vw]">
      <h2 class="text-[1.875vw] font-bold text-[#182B44] text-center">{{ title }}</h2>
      <div class="flex justify-center gap-[3.125vw] mt-[2.6042vw]">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="w-[31.7708vw] bg-gradient-to-b from-[#F5F9FF] to-[#FEFEFF] shadow-[0px_0px_20px_rgba(86,118,162,0.1)] rounded border border-white p-[1.5625vw]"
        >
          <div class="flex items-center">
            <img :src="item.icon" alt="" class="w-[2.6042vw] h-[2.6042vw]" />
            <h3 class="text-[1.0417vw] font-bold text-[#182B44] ml-[1.0417vw]">{{ item.title }}</h3>
          </div>
          <p class="text-[1.0417vw] font-medium text-[#182B44] mt-[1.0417vw]">{{ item.subtitle }}</p>
          <p class="text-[0.7292vw] text-[#585C60] mt-[0.4167vw]">{{ item.description }}</p>
        </div>
      </div>
    </div>

    <!-- Mobile -->
    <div class="lg:hidden pt-10 pb-10 px-4">
      <h2 class="text-[24px] font-bold text-[#182B44] text-center">{{ title }}</h2>
      <div class="flex flex-col gap-4 mt-6">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="w-full bg-gradient-to-b from-[#F5F9FF] to-[#FEFEFF] shadow-[0px_0px_20px_rgba(86,118,162,0.1)] rounded border border-white p-5"
        >
          <div class="flex items-center">
            <img :src="item.icon" alt="" class="w-10 h-10" />
            <h3 class="text-base font-bold text-[#182B44] ml-3">{{ item.title }}</h3>
          </div>
          <p class="text-base font-medium text-[#182B44] mt-3">{{ item.subtitle }}</p>
          <p class="text-sm text-[#585C60] mt-1">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface ServiceItem {
  icon: string
  title: string
  subtitle: string
  description: string
}

interface Props {
  title: string
  items: ServiceItem[]
}

defineProps<Props>()
</script>
