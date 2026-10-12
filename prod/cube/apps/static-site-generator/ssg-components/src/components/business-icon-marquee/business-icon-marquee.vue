<template>
  <div class="w-full h-[61vw] lg:h-[31.7708vw] bg-[#F9FCFF] relative overflow-hidden">
    <div class="absolute left-[4vw] lg:left-1/2 lg:-translate-x-1/2 top-[8vw] lg:top-[4.1667vw] text-left lg:text-center">
      <div class="text-[4.5333vw] lg:text-[1.5625vw] font-bold text-[#182b44] font-['SOURCEHANSANSSC-BOLD'] leading-tight mb-[2vw] lg:mb-[1.04vw]">{{ title }}</div>
      <div class="text-[3.4667vw] lg:text-[0.7292vw] text-[#585c60] font-['SOURCEHANSANSSC-REGULAR'] leading-tight lg:whitespace-nowrap">{{ subtitle }}</div>
    </div>
    <div class="absolute top-[18vw] lg:top-[9.375vw] left-1/2 -translate-x-1/2 overflow-hidden flex w-[134vw] lg:w-[69.7917vw]">
      <div class="marquee-track">
        <div v-for="src in logos" :key="src" class="logo-item">
          <img :src="src" class="w-full block" />
        </div>
      </div>
      <div class="marquee-track" aria-hidden="true">
        <div v-for="src in logos" :key="'dup-' + src" class="logo-item">
          <img :src="src" class="w-full block" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
  logos: string[]
}>()
</script>

<style scoped>
.marquee-track {
  display: flex;
  flex-wrap: wrap;
  flex-shrink: 0;
  flex-direction: column;
  height: 36vw;
  animation: marqueeScroll 30s linear infinite;
}
@media (min-width: 1024px) {
  .marquee-track {
    height: 18.75vw;
  }
}
.logo-item {
  width: 24.8vw;
  height: 9.4vw;
  background: #ffffff;
  box-shadow: 0 0 16px 0 rgba(2, 9, 21, 0.06);
  border-radius: 2px;
  margin-left: 2vw;
  margin-top: 2.4vw;
  display: flex;
  align-items: center;
  justify-content: center;
}
@media (min-width: 1024px) {
  .logo-item {
    width: 12.9167vw;
    height: 4.8958vw;
    margin-left: 1.0417vw;
    margin-top: 1.25vw;
  }
}
@keyframes marqueeScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}
</style>
