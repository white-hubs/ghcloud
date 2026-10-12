<template>
  <div :id="sectionId" class="w-full py-[4vw]" :class="theme === 'dark' ? 'bg-[#070e24]' : 'bg-white'">
    <div class="max-w-[120rem] mx-auto px-[5vw] lg:px-[15.625vw]">
      <!-- 标题区域 -->
      <div class="flex flex-col items-center mb-[3vw]">
        <h2 class="text-[1.875vw] font-bold mb-[0.7vw]" :class="theme === 'dark' ? 'text-white' : 'text-[#07101c]'">
          {{ title }}
        </h2>
        <div class="w-[3.125vw] h-[0.3125vw] bg-primary rounded-full"></div>
      </div>

      <!-- PC端: 3列网格 -->
      <div class="hidden lg:flex lg:justify-center lg:gap-[2.08vw]">
        <component
          :is="item.href ? 'a' : 'div'"
          v-for="(item, index) in cases"
          :key="index"
          :href="item.href || undefined"
          class="group w-[21.4vw] bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
          style="box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08)"
        >
          <!-- 图片区域 -->
          <div class="w-full h-[12vw] overflow-hidden bg-gray-100">
            <img
              :src="item.image"
              :alt="item.title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <!-- 标题栏 -->
          <div class="h-[3.54vw] bg-[#fbfcfb] flex items-center justify-center border-t border-[#f0f0f0]">
            <span class="text-[0.9375vw] font-medium text-[#182b44]">{{ item.title }}</span>
          </div>
        </component>
      </div>

      <!-- 查看更多按钮 - PC端 -->
      <div v-if="viewMoreLink" class="hidden lg:block text-center mt-[2vw]">
        <a
          :href="viewMoreLink"
          class="inline-flex items-center gap-[0.5vw] text-[0.9375vw] transition-colors"
          :class="theme === 'dark' ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-primary'"
        >
          {{ viewMoreText || "查看更多" }}
          <svg class="w-[0.8vw] h-[0.8vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      <!-- 移动端: 单列布局 -->
      <div class="lg:hidden flex flex-col gap-[4vw]">
        <component
          :is="item.href ? 'a' : 'div'"
          v-for="(item, index) in cases"
          :key="index"
          :href="item.href || undefined"
          class="group w-full bg-white rounded-lg overflow-hidden"
          style="box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08)"
        >
          <!-- 图片区域 -->
          <div class="w-full aspect-[16/9] overflow-hidden bg-gray-100">
            <img :src="item.image" :alt="item.title" class="w-full h-full object-cover" />
          </div>
          <!-- 标题栏 -->
          <div class="h-[12vw] bg-[#fbfcfb] flex items-center justify-center border-t border-[#f0f0f0]">
            <span class="text-[3.5vw] font-medium text-[#182b44]">{{ item.title }}</span>
          </div>
        </component>
      </div>

      <!-- 查看更多按钮 - 移动端 -->
      <div v-if="viewMoreLink" class="lg:hidden text-center mt-[4vw]">
        <a :href="viewMoreLink" class="inline-flex items-center gap-[1vw] text-[3vw] text-gray-600">
          {{ viewMoreText || "查看更多" }}
          <svg class="w-[3vw] h-[3vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CaseItem {
  image: string;
  title: string;
  href?: string;
}

interface Props {
  title?: string;
  cases: CaseItem[];
  viewMoreLink?: string;
  viewMoreText?: string;
  theme?: "light" | "dark";
  sectionId?: string;
}

withDefaults(defineProps<Props>(), {
  title: "客户案例",
  viewMoreLink: "",
  viewMoreText: "查看更多",
  theme: "light",
  sectionId: "",
});
</script>
