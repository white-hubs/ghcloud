<template>
  <section class="w-full bg-[#f7f9ff]">
    <div class="px-[5vw] lg:px-[15.625vw] pt-[4.5833vw] pb-[3.125vw]">
      <!-- 面包屑 -->
      <nav v-if="breadcrumbs && breadcrumbs.length" class="hidden lg:block mb-[2.0833vw]">
        <ol class="flex items-center text-[0.7292vw] text-[#585c60]">
          <li v-for="(item, index) in breadcrumbs" :key="index" class="flex items-center">
            <component :is="item.href ? 'a' : 'div'" :href="item.href || undefined" class="hover:text-primary transition-colors">{{
              item.name
            }}</component>
            <span v-if="index < breadcrumbs.length - 1" class="mx-[0.5208vw] text-[#b1b5ba]">></span>
          </li>
        </ol>
      </nav>

      <!-- 产品信息区 -->
      <div class="flex flex-col lg:flex-row gap-[4vw] lg:gap-[3.125vw]">
        <!-- 产品图片 -->
        <div class="w-full lg:w-[12.5vw] h-[50vw] lg:h-[12.5vw] flex-shrink-0">
          <img :src="productImage" :alt="productName" class="w-full h-full object-contain" />
        </div>

        <!-- 产品信息 -->
        <div class="flex-1 flex flex-col justify-center">
          <!-- 产品名称 - 38px -->
          <h1 class="text-[5vw] lg:text-[1.9792vw] font-bold text-[#182b44] mb-[1vw] lg:mb-[0.5208vw]">
            {{ productName }}
          </h1>

          <!-- 产品型号 - 24px -->
          <p v-if="productModel" class="text-[3vw] lg:text-[1.25vw] text-[#67717d] mb-[3vw] lg:mb-[1.5625vw]">
            {{ productModel }}
          </p>

          <!-- 产品描述 -->
          <p class="text-[2.8vw] lg:text-[0.8333vw] text-[#67717d] leading-relaxed mb-[4vw] lg:mb-[2.0833vw] line-clamp-4">
            {{ productDescription }}
          </p>

          <!-- 按钮 -->
          <div class="flex gap-[2vw] lg:gap-[1.0417vw]">
            <a
              :href="contactHref"
              class="inline-flex items-center justify-center px-[4vw] py-[2vw] lg:px-[1.1979vw] lg:py-[0.625vw] bg-primary text-white text-[2.8vw] lg:text-[0.8333vw] rounded hover:bg-primary/90 transition-colors"
            >
              立即咨询
            </a>
            <component
              :is="backHref ? 'a' : 'div'"
              :href="backHref || undefined"
              class="inline-flex items-center justify-center px-[4vw] py-[2vw] lg:px-[1.1979vw] lg:py-[0.625vw] bg-white border border-[#d1d5db] text-[#4c5867] text-[2.8vw] lg:text-[0.8333vw] rounded hover:border-primary hover:text-primary transition-colors"
            >
              返回列表
            </component>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Breadcrumb {
  name: string;
  href?: string;
}

interface Props {
  productImage: string;
  productName: string;
  productModel?: string;
  productDescription: string;
  tags?: string[];
  breadcrumbs?: Breadcrumb[];
  contactHref?: string;
  backHref?: string;
}

withDefaults(defineProps<Props>(), {
  contactHref: "/consultation.html",
});
</script>
