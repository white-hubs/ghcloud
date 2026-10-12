<template>
  <section class="w-full bg-[#f7f9ff]">
    <div class="px-[40px] lg:px-[15.625vw] pt-[4.5833vw] pb-[3.125vw]">
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

      <!-- 应用图标与信息区 -->
      <div class="flex flex-col lg:flex-row items-center lg:items-center gap-[30px] lg:gap-[1.6667vw]">
        <div
          class="w-[60px] h-[60px] lg:w-[5.2083vw] lg:h-[5.2083vw] lg:max-w-[100px] lg:max-h-[100px] rounded-[12px] lg:rounded-[0.8333vw] flex-shrink-0 overflow-hidden"
        >
          <img :src="productImage" :alt="productName" class="w-full h-full object-cover" />
        </div>

        <div class="flex-1 min-w-0 lg:ml-[1.6667vw] flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
          <h1 class="text-[18px] lg:text-[1.6667vw] font-bold text-[#182b44] mb-[8px] lg:mb-[0.8333vw]">
            {{ productName }}
          </h1>
          <p
            class="text-[12px] lg:text-[0.8333vw] text-[#67717d] leading-[1.6] m-0 max-w-[300px] lg:max-w-[38.5417vw] text-left line-clamp-3 break-words"
          >
            {{ productDescription }}
          </p>
        </div>

        <div class="flex flex-col gap-[8px] lg:gap-[0.8333vw] items-center lg:items-start">
          <a
            :href="contactHref"
            class="w-[75px] h-[30px] lg:w-[5.7292vw] lg:h-[2.0833vw] lg:max-w-[110px] lg:max-h-[40px] bg-[#1677ff] text-white border-none rounded-[5px] lg:rounded-[0.4167vw] text-[11px] lg:text-[0.7292vw] font-medium shadow-[0_4px_12px_rgba(22,119,255,0.3)] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_6px_16px_rgba(22,119,255,0.4)] hover:bg-[#4096ff] flex items-center justify-center"
          >
            立即咨询
          </a>
          <component
            :is="backHref ? 'a' : 'div'"
            :href="backHref || undefined"
            class="w-[75px] h-[30px] lg:w-[5.7292vw] lg:h-[2.0833vw] lg:max-w-[110px] lg:max-h-[40px] bg-white text-[#666] border-none rounded-[5px] lg:rounded-[0.4167vw] text-[11px] lg:text-[0.7292vw] font-medium shadow-[0_4px_12px_rgba(129,130,132,0.3)] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_6px_16px_rgba(129,130,132,0.3)] hover:text-[#40a9ff] flex items-center justify-center"
          >
            返回列表
          </component>
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
  productDescription: string;
  contactHref?: string;
  backHref?: string;
  breadcrumbs?: Breadcrumb[];
}

withDefaults(defineProps<Props>(), {
  contactHref: "/consultation.html",
});
</script>
