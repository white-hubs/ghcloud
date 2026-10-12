<template>
  <div class="w-full relative h-[1240px] bg-[#f9fcff]">
    <h2 class="absolute left-1/2 -translate-x-1/2 top-[80px] text-[30px] font-bold text-[#182b44] font-['SOURCEHANSANSSC-BOLD']">
      荣誉资质
    </h2>
    <p class="absolute left-1/2 -translate-x-1/2 top-[136px] text-[14px] text-[#585c60] whitespace-nowrap font-['SOURCEHANSANSSC-REGULAR']">
      荣获多项权威资质证书，取得多项软件著作，并积极申请专利保护
    </p>

    <!-- Stats -->
    <div
      class="absolute left-1/2 -translate-x-1/2 top-[200px] flex items-center w-[1320px] h-[106px] bg-gradient-to-r from-[#f2f7fd] to-[#fafdff] rounded-lg border border-white shadow-[0_0_22px_rgba(132,132,132,0.06)]"
    >
      <div
        v-for="(stat, i) in stats"
        :key="i"
        class="w-1/3 h-full flex items-center justify-center relative font-['SOURCEHANSANSSC-REGULAR']"
      >
        <img :src="stat.img" class="w-[50px] h-[50px] mr-[33px]" />
        <div class="flex flex-col">
          <span class="text-[30px] font-bold text-primary ml-[6px] font-['SOURCEHANSANSSC-BOLD']">{{ stat.value }}</span>
          <span class="text-[14px] text-[#585c60] font-['SOURCEHANSANSSC-REGULAR']">{{ stat.label }}</span>
        </div>
        <div v-if="i === 1" class="absolute left-0 top-1/2 -translate-y-1/2 h-[40px] border-l border-[#c9d9ee]"></div>
        <div v-if="i === 1" class="absolute right-0 top-1/2 -translate-y-1/2 h-[40px] border-l border-[#c9d9ee]"></div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="absolute left-1/2 -translate-x-1/2 top-[336px] flex items-center w-[1320px] h-[58px] bg-[#ecf4fc] rounded">
      <div
        v-for="(btn, i) in tabs"
        :key="i"
        @click="activeIndex = i"
        class="h-[58px] text-center leading-[58px] text-[20px] font-medium cursor-pointer transition-all w-[440px] font-['SourceHanSansCN-Medium-2']"
        :class="activeIndex === i ? 'text-white bg-primary' : 'text-[#182b44] bg-[#ecf4fc]'"
      >
        {{ btn }}
      </div>
    </div>

    <!-- Images -->
    <div class="absolute top-[444px] left-1/2 -translate-x-1/2 flex flex-wrap w-[1320px] justify-between">
      <div v-for="(item, i) in filteredImages" :key="i" class="w-[240px] text-center flex flex-col items-center cursor-pointer">
        <div
          class="w-[240px] mt-[20px] p-[20px] box-border overflow-hidden bg-gradient-to-r from-[#f2f7fd] to-[#fafdff] shadow-[0_0_22px_rgba(132,132,132,0.06)] rounded-md border border-white"
        >
          <img :src="item.src" class="w-full h-full block" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface HonorImage {
  src: string;
  desc?: string;
  tabIndex: number;
}

interface HonorStat {
  img: string;
  value: string;
  label: string;
}

const props = defineProps<{
  stats: HonorStat[];
  tabs: string[];
  images: HonorImage[];
}>();

const activeIndex = ref(0);

const filteredImages = computed(() => {
  return props.images.filter((img) => img.tabIndex === activeIndex.value);
});
</script>
