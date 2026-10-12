<template>
  <div class="w-full bg-white py-[3.125vw]">
    <div class="max-w-[120rem] mx-auto px-[4.6875vw]">
      <!-- 标题区域 -->
      <div v-if="title" class="flex flex-col items-center mb-[2vw] lg:mb-[3vw]">
        <h2 class="text-[5.3333vw] lg:text-[1.875vw] font-bold text-[#07101c] mb-[2vw] lg:mb-[0.7292vw]">{{ title }}</h2>
        <div class="w-[8vw] lg:w-[3.125vw] h-[1vw] lg:h-[0.3125vw] bg-primary rounded-full mb-[3vw] lg:mb-[2.0833vw]"></div>
        <p v-if="subtitle" class="text-[3.2vw] lg:text-[0.8333vw] text-[#585c60]">{{ subtitle }}</p>
      </div>

      <!-- PC端: 第一排2个大卡片 + 第二排3个小卡片 -->
      <div class="hidden lg:block">
        <!-- 第一排: 2个大卡片 -->
        <div class="flex justify-center gap-[2.0833vw] mb-[2.0833vw]">
          <component
            :is="tech.href ? 'a' : 'div'"
            v-for="(tech, index) in technologies.slice(0, 2)"
            :key="'top-' + index"
            :href="tech.href || undefined"
            class="group relative flex rounded-[0.9375vw] overflow-hidden hover:shadow-lg transition-all duration-300"
            :style="{
              width: '33.125vw',
              height: '17.7083vw',
              background: tech.bgColor || '#f3f6ff',
            }"
          >
            <!-- 左侧文字区域 -->
            <div class="absolute left-[2.6042vw] top-[4.0625vw] flex flex-col items-start z-10">
              <h3 class="text-[1.3542vw] font-bold text-[#182b44] mb-[1.0417vw]">{{ tech.name }}</h3>
              <p class="text-[0.8333vw] text-[#585c60] leading-relaxed mb-[2.0833vw] w-[15.625vw]">{{ tech.description }}</p>
              <div
                class="inline-flex items-center justify-center w-[7.0833vw] h-[2.0833vw] bg-primary rounded-[1.0417vw] text-[0.9375vw] text-white"
              >
                {{ tech.linkText || "了解更多" }}
              </div>
            </div>

            <!-- 右侧图片区域 -->
            <div class="absolute right-[0] top-[5.2604vw] w-[20.2083vw] h-[12.4479vw]">
              <img v-if="tech.icon" :src="tech.icon" :alt="tech.name" class="w-full h-full object-cover rounded-[0.7292vw]" />
            </div>
          </component>
        </div>

        <!-- 第二排: 3个小卡片 -->
        <div class="flex justify-center gap-[2.0833vw]">
          <component
            :is="tech.href ? 'a' : 'div'"
            v-for="(tech, index) in technologies.slice(2, 5)"
            :key="'bottom-' + index"
            :href="tech.href || undefined"
            class="group relative flex rounded-[0.9375vw] overflow-hidden hover:shadow-lg transition-all duration-300"
            :style="{
              width: '21.3542vw',
              height: '16.3542vw',
              backgroundColor: tech.bgColor || '#f3f6ff',
            }"
          >
            <!-- 左下文字区域 -->
            <div class="absolute left-[2.6042vw] top-[3.0729vw] flex flex-col items-start z-10">
              <h3 class="text-[1.3542vw] font-bold text-[#182b44] mb-[1.0417vw]">{{ tech.name }}</h3>
              <p class="text-[0.8333vw] text-[#585c60] leading-relaxed mb-[2.0833vw] w-[15.625vw] line-clamp-2">{{ tech.description }}</p>
              <div
                class="inline-flex items-center justify-center w-[7.0833vw] h-[2.0833vw] bg-primary rounded-[1.0417vw] text-[0.9375vw] text-white"
              >
                {{ tech.linkText || "了解更多" }}
              </div>
            </div>
          </component>
        </div>
      </div>

      <!-- 移动端: 单列 -->
      <div class="lg:hidden flex flex-col gap-[3.2vw]">
        <component
          :is="tech.href ? 'a' : 'div'"
          v-for="(tech, index) in technologies"
          :key="index"
          :href="tech.href || undefined"
          class="flex items-center gap-[3.2vw] p-[4vw] rounded-xl border border-gray-200"
          :style="{ backgroundColor: tech.bgColor || '#f3f6ff' }"
        >
          <div class="w-[20vw] h-[20vw] flex-shrink-0 flex items-center justify-center hidden">
            <img :src="tech.icon" :alt="tech.name" class="w-full h-full object-contain" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-[4vw] font-bold text-[#07101c] mb-[1vw]">{{ tech.name }}</h3>
            <p class="text-[2.8vw] text-[#585c60] leading-relaxed mb-[1vw] line-clamp-2">{{ tech.description }}</p>
            <span class="text-[3.2vw] text-primary flex items-center gap-[0.5vw]">
              {{ tech.linkText || "了解更多" }}
              <svg class="w-[3.2vw] h-[3.2vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </span>
          </div>
        </component>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TechItem {
  name: string;
  icon: string;
  description: string;
  href?: string;
  linkText?: string;
  bgColor?: string;
  bgGradient?: string;
  iconBgColor?: string;
}

interface Props {
  title?: string;
  subtitle?: string;
  technologies: TechItem[];
}

const props = defineProps<Props>();

function getGradient(color: string): string {
  return `linear-gradient(135deg, ${color} 0%, #ffffff 100%)`;
}
</script>
