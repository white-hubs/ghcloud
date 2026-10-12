<template>
  <div class="w-full relative py-[3.125vw]">
    <!-- 背景图片 -->
    <div class="absolute inset-0 z-0">
      <img :src="derivBg" alt="background" class="w-full h-full object-cover" />
    </div>

    <div class="w-full lg:max-w-[120rem] mx-auto px-[4vw] relative z-10 flex flex-col items-center">
      <!-- 标题区域 -->
      <div class="flex flex-col items-center mb-[8vw] lg:mb-[3vw]">
        <h2 v-if="title" class="text-[5.3333vw] lg:text-[1.875vw] font-bold text-white mb-[0.7292vw]">{{ title }}</h2>
        <div class="w-[8vw] lg:w-[3.125vw] h-[1vw] lg:h-[0.3125vw] bg-primary rounded-full"></div>
      </div>

      <!-- PC端: 3列网格 -->
      <div class="hidden lg:grid lg:grid-cols-3 gap-x-[2.0833vw] gap-y-[2.0833vw]">
        <component
          :is="product.href ? 'a' : 'div'"
          v-for="(product, index) in products"
          :key="index"
          :href="product.href || undefined"
          class="group block relative w-[21.3542vw] h-[18.2292vw] rounded-[0.8333vw] overflow-hidden transition-all duration-300"
        >
          <!-- 卡片外框 (矩形14: rgba(255,255,255,0.1)) -->
          <div
            class="absolute inset-0 bg-white/10 border border-white/10 rounded-[0.8333vw] pointer-events-none group-hover:border-primary/50 transition-colors"
          ></div>

          <!-- 卡片背景图 (矩形13) -->
          <div class="absolute w-[20.1042vw] h-[8.5938vw] left-[0.625vw] top-[0.6771vw] rounded-[0.7292vw] overflow-hidden bg-[#d8d8d8]">
            <img
              :src="product.image"
              :alt="product.name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>

          <!-- 文本内容 -->
          <div class="absolute top-[10.9375vw] left-[0.9375vw] right-[0.9375vw] flex flex-col pointer-events-none">
            <h3 class="text-[1.0417vw] font-medium text-white mb-[0.7292vw] truncate">{{ product.name }}</h3>
            <p class="text-[0.7292vw] text-[#758296] leading-relaxed line-clamp-2">{{ product.description }}</p>
          </div>

          <div v-if="product.href" class="absolute bottom-[1vw] left-[0.9375vw] flex items-center pointer-events-auto">
            <div
              class="w-[4.2708vw] h-[1.6667vw] flex items-center justify-center rounded-[0.4167vw] cursor-pointer hover:bg-blue-600 transition-colors"
            >
              <span class="text-[0.7292vw] text-white">立即查看 &gt;</span>
            </div>
          </div>
        </component>
      </div>

      <!-- 移动端: 单列 -->
      <div class="lg:hidden flex flex-col gap-[4vw] w-full">
        <component
          :is="product.href ? 'a' : 'div'"
          v-for="(product, index) in products"
          :key="index"
          :href="product.href || undefined"
          class="block w-full rounded-xl overflow-hidden bg-white/10 border border-white/10"
        >
          <div class="p-[3vw] pb-0">
            <div class="w-full aspect-[16/9] rounded-lg overflow-hidden bg-[#d8d8d8]">
              <img :src="product.image" :alt="product.name" class="w-full h-full object-cover" />
            </div>
          </div>
          <div class="p-[4vw]">
            <h3 class="text-[4.5vw] font-medium text-white mb-[2vw] truncate">{{ product.name }}</h3>
            <p class="text-[3.2vw] text-[#758296] leading-relaxed line-clamp-2 mb-[4vw]">{{ product.description }}</p>
            <div v-if="product.href" class="inline-flex items-center justify-center bg-primary rounded px-[3vw] py-[1vw]">
              <span class="text-[3vw] text-white">立即查看 ></span>
            </div>
          </div>
        </component>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import derivBg from "./deriv-bg.webp?url";

interface ProductItem {
  image: string;
  name: string;
  description: string;
  href?: string;
}

interface Props {
  title?: string;
  products: ProductItem[];
}

defineProps<Props>();
</script>
