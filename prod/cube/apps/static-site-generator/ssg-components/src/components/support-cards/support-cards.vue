<template>
  <section :class="['w-full', 'pt-[4.1667vw]', 'pb-[4.1667vw]', background === 'white' ? 'bg-white' : 'bg-[#F9FCFF]']">
    <!-- Desktop -->
    <div class="hidden lg:block">
      <h2 class="text-[1.875vw] font-bold text-[#182B44] text-center">{{ title }}</h2>
      <div class="flex justify-center gap-[1.5625vw] mt-[2.6042vw]">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="w-[16.0417vw]"
        >
          <div class="h-[3.5417vw] bg-gradient-to-b from-[#EBF3FF] to-[#F5F9FF] shadow-[0px_0px_20px_rgba(86,118,162,0.1)] border border-white relative flex items-center px-[1.5625vw]">
            <img :src="item.icon" alt="" class="w-[1.5625vw] h-[1.5625vw]" />
            <h3 class="text-[0.9375vw] font-bold text-[#182B44] ml-[0.625vw]">{{ item.title }}</h3>
            <img v-if="item.decoration" :src="item.decoration" alt="" class="absolute right-[0.5208vw] w-[2.5521vw] h-auto" />
          </div>
          <div class="w-full h-[8.6979vw] bg-[#FCFEFF] border border-[#EBEEF4] p-[1.3542vw] text-[0.7292vw] text-[#182B44] leading-[1.6667vw]">
            {{ item.description }}
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile -->
    <div class="lg:hidden pt-10 pb-10">
      <h2 class="text-[24px] font-bold text-[#182B44] text-center">{{ title }}</h2>
      <div class="flex flex-wrap gap-4 mt-6 px-4">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="w-full"
        >
          <div class="h-[60px] bg-gradient-to-b from-[#EBF3FF] to-[#F5F9FF] shadow-[0px_0px_20px_rgba(86,118,162,0.1)] border border-white relative flex items-center px-4">
            <img :src="item.icon" alt="" class="w-6 h-6" />
            <h3 class="text-base font-bold text-[#182B44] ml-2">{{ item.title }}</h3>
            <img v-if="item.decoration" :src="item.decoration" alt="" class="absolute right-2 w-8 h-auto" />
          </div>
          <div class="w-full min-h-[100px] bg-[#FCFEFF] border border-[#EBEEF4] p-4 text-[14px] text-[#182B44] leading-relaxed">
            {{ item.description }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface SupportItem {
  icon: string
  title: string
  description: string
  decoration?: string
}

interface Props {
  title: string
  background?: 'white' | 'gray'
  items: SupportItem[]
}

withDefaults(defineProps<Props>(), {
  background: 'gray',
})
</script>
