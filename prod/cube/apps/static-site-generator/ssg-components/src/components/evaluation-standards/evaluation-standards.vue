<template>
  <section class="w-full bg-white">
    <!-- Desktop -->
    <div class="hidden lg:block pt-[4.1667vw] px-[15.625vw] pb-[4.1667vw]">
      <h2 class="text-[1.875vw] font-bold text-[#182B44] text-center">{{ title }}</h2>
      <div class="flex flex-wrap justify-center gap-[1.4583vw] mt-[3.125vw]">
        <div v-for="(item, index) in items" :key="index" class="w-[33.6458vw] h-[8.5417vw] relative overflow-hidden rounded">
          <img :src="item.image" alt="" class="w-full h-full object-cover" />
          <span
            class="absolute top-[1.6667vw] left-[1.5625vw] text-[1.4583vw] font-normal bg-gradient-to-br from-primary to-[#51B7FF] bg-clip-text text-transparent"
            >{{ item.number }}</span
          >
          <span class="absolute top-[3.4375vw] left-[1.5625vw] text-[0.9375vw] font-semibold text-[#182B44]">{{ item.description }}</span>
        </div>
      </div>
    </div>

    <!-- Mobile -->
    <div class="lg:hidden pt-10 pb-10 px-4">
      <h2 class="text-[24px] font-bold text-[#182B44] text-center">{{ title }}</h2>
      <div class="flex flex-wrap gap-4 mt-8">
        <div v-for="(item, index) in items" :key="index" class="w-full h-[120px] relative overflow-hidden rounded">
          <img :src="item.image" alt="" class="w-full h-full object-cover" />
          <span
            class="absolute top-4 left-4 text-[20px] font-normal bg-gradient-to-br from-primary to-[#51B7FF] bg-clip-text text-transparent"
            >{{ item.number }}</span
          >
          <span class="absolute top-16 left-4 text-[14px] font-semibold text-[#182B44]">{{ item.description }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface EvaluationItem {
  number: string;
  description: string;
  image: string;
}

interface Props {
  title: string;
  items: EvaluationItem[];
}

defineProps<Props>();
</script>
