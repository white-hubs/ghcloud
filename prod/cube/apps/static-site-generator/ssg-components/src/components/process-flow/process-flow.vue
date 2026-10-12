<template>
  <section class="w-full" :class="backgroundClass" :style="backgroundStyle">
    <!-- Desktop -->
    <div class="hidden lg:block pt-[4.1667vw] pb-[4.1667vw]">
      <h2 class="text-[1.875vw] font-bold text-[#182B44] text-center">{{ title }}</h2>
      <p v-if="subtitle" class="text-[0.7292vw] text-[#585C60] text-center mt-[1.3542vw]">{{ subtitle }}</p>

      <div class="flex justify-center items-start mt-[2.7604vw]">
        <template v-for="(step, index) in steps" :key="index">
          <!-- 步骤：图标+标签 垂直对齐 -->
          <div class="flex flex-col items-center">
            <div class="w-[3.2292vw] h-[3.2292vw] rounded-full bg-gradient-to-b from-[#f3f4f7] to-white shadow-[0px_4px_10px_rgba(24,43,68,0.1)] border border-white flex items-center justify-center">
              <img :src="step.icon" alt="" class="w-[1.4583vw] h-[1.4583vw]" />
            </div>
            <div class="text-[0.7292vw] text-[#182B44] text-center mt-[1.0417vw]">{{ step.label }}</div>
          </div>
          <!-- 虚线连接线 -->
          <div
            v-if="index < steps.length - 1"
            class="flex items-center h-[3.2292vw] flex-shrink-0 mx-[1.5vw]"
          >
            <div class="w-[6vw] h-[1px]" style="background-image: linear-gradient(to right, #B9BFC7 8px, transparent 8px); background-size: 16px 1px; background-repeat: repeat-x;"></div>
          </div>
        </template>
      </div>
    </div>

    <!-- Mobile -->
    <div class="lg:hidden pt-10 pb-10 px-4">
      <h2 class="text-[24px] font-bold text-[#182B44] text-center">{{ title }}</h2>
      <p v-if="subtitle" class="text-sm text-[#585C60] text-center mt-4">{{ subtitle }}</p>

      <div class="flex flex-nowrap overflow-x-auto pb-4 mt-6 items-start">
        <template v-for="(step, index) in steps" :key="index">
          <!-- 步骤：图标+标签 垂直对齐 -->
          <div class="flex flex-col items-center flex-shrink-0">
            <div class="w-[50px] h-[50px] rounded-full bg-gradient-to-b from-[#f3f4f7] to-white shadow-[0px_4px_10px_rgba(24,43,68,0.1)] border border-white flex items-center justify-center flex-shrink-0">
              <img :src="step.icon" alt="" class="w-[22px] h-[22px]" />
            </div>
            <div class="text-sm text-[#182B44] text-center mt-2 whitespace-nowrap">{{ step.label }}</div>
          </div>
          <!-- 虚线连接线 -->
          <div
            v-if="index < steps.length - 1"
            class="flex items-center h-[50px] flex-shrink-0 mx-4"
          >
            <div class="w-[72px] h-[1px]" style="background-image: linear-gradient(to right, #B9BFC7 8px, transparent 8px); background-size: 16px 1px; background-repeat: repeat-x;"></div>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Step {
  icon: string
  label: string
}

interface Props {
  title: string
  subtitle?: string
  background?: string
  steps: Step[]
}

const props = defineProps<Props>()

const backgroundClass = computed(() => {
  if (!props.background || props.background === 'gray') {
    return 'bg-[#F9FCFF]'
  }
  if (props.background === 'white') {
    return 'bg-white'
  }
  return ''
})

const backgroundStyle = computed(() => {
  if (!props.background || props.background === 'gray' || props.background === 'white') {
    return {}
  }
  return { backgroundColor: props.background }
})
</script>
