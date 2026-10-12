<template>
  <section class="w-full py-[4vw] lg:py-[4.1667vw] bg-white lg:bg-[#f5f7fa]">
    <div class="w-full px-[5vw] lg:px-[15.625vw]">
      <!-- 标题区域 - 居中 -->
      <div v-if="title" class="flex flex-col items-center mb-[3.125vw]">
        <h2 class="text-[1.875vw] font-bold text-[#07101c] mb-[0.7vw]">
          {{ title }}
        </h2>
        <div class="w-[3.125vw] h-[0.3125vw] bg-primary rounded-full"></div>
      </div>

      <!-- 硬件产品卡片类型 -->
      <template v-if="cardType === 'hardware'">
        <!-- PC端: 3列网格 -->
        <div class="hidden lg:grid lg:grid-cols-3 lg:gap-[1.5625vw]">
          <component
            :is="product.href ? 'a' : 'div'"
            v-for="(product, index) in filteredAndPaginatedProducts"
            :key="index"
            :href="product.href || undefined"
            class="group flex flex-col bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <!-- 产品图片区域 -->
            <div
              class="w-full h-[45vw] lg:h-[17.7083vw] flex items-center justify-center p-[3vw] lg:p-[1.5625vw] bg-white relative overflow-hidden"
            >
              <img
                :src="product.image || product.icon"
                :alt="product.name"
                class="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <!-- 产品信息区域 -->
            <div class="w-full px-[3vw] lg:px-[1.5625vw] py-[3vw] lg:py-[1.5625vw] border-t border-gray-100">
              <h3 class="text-[3.5vw] lg:text-[1.0417vw] font-medium text-[#060b1a] mb-[1vw] lg:mb-[0.5208vw] text-center line-clamp-1">
                {{ product.name }}
              </h3>
              <p v-if="product.description" class="text-[2.8vw] lg:text-[0.7292vw] text-[#8692a1] leading-relaxed text-center line-clamp-2">
                {{ product.description }}
              </p>
              <!-- 查看详情链接 -->
              <div class="text-center mt-[1vw] lg:mt-[0.5208vw] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span v-if="product.href" class="text-[2.8vw] lg:text-[0.7292vw] text-primary">查看详情></span>
              </div>
            </div>
          </component>
        </div>

        <!-- 移动端: 单列，左图右文 -->
        <div class="lg:hidden flex flex-col gap-[3vw]">
          <component
            :is="product.href ? 'a' : 'div'"
            v-for="(product, index) in filteredAndPaginatedProducts"
            :key="index"
            :href="product.href || undefined"
            class="group flex flex-row items-stretch bg-white rounded-lg overflow-hidden"
            style="box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06)"
          >
            <!-- 产品图片 - 左侧 -->
            <div class="w-[30vw] flex-shrink-0 flex items-center justify-center p-[3vw] bg-white relative">
              <img :src="product.image || product.icon" :alt="product.name" class="max-w-full max-h-full object-contain" />
            </div>
            <!-- 产品信息 - 右侧 -->
            <div class="flex-1 flex flex-col justify-center px-[3vw] py-[3vw] border-l border-gray-100">
              <h3 class="text-[3.5vw] font-medium text-[#060b1a] mb-[1vw] line-clamp-1">
                {{ product.name }}
              </h3>
              <p v-if="product.description" class="text-[2.8vw] text-[#8692a1] leading-relaxed line-clamp-2">
                {{ product.description }}
              </p>
            </div>
          </component>
        </div>
      </template>

      <!-- 应用产品卡片类型 -->
      <template v-else-if="cardType === 'application'">
        <!-- PC端: 3列网格 -->
        <div class="hidden lg:grid lg:grid-cols-3 lg:gap-[1.5625vw]">
          <component
            :is="product.href ? 'a' : 'div'"
            v-for="(product, index) in filteredProducts"
            :key="index"
            :href="product.href || undefined"
            class="group w-full h-full min-h-[11.4583vw] bg-white rounded-lg p-[1.3542vw] flex flex-col cursor-pointer transition-all duration-300 hover:translate-y-[-0.26vw]"
            style="box-shadow: 0 0.2083vw 0.8333vw rgba(0, 0, 0, 0.12)"
          >
            <!-- 头部：图标+名称 -->
            <div class="flex flex-row items-center mb-[1.25vw]">
              <div class="w-[3.125vw] h-[3.125vw] mr-[0.8333vw] flex-shrink-0">
                <img :src="product.icon || product.image" :alt="product.name" class="w-full h-full object-contain rounded-lg" />
              </div>
              <div class="flex-1 flex flex-col justify-center min-w-0">
                <div class="flex justify-between items-start mb-[0.2083vw]">
                  <div class="text-[0.8333vw] font-medium text-[#333] truncate text-left flex-1 mr-[0.625vw]">{{ product.name }}</div>
                  <div v-if="product.href" class="text-[0.7292vw] text-primary whitespace-nowrap">查看详情 &gt;</div>
                </div>
                <div v-if="product.version" class="text-[0.625vw] text-[#666] text-left">版本号: {{ product.version }}</div>
              </div>
            </div>

            <!-- 描述 -->
            <p v-if="product.description" class="text-[0.7292vw] text-[#666] text-left leading-[2] line-clamp-3 flex-1">
              {{ product.description }}
            </p>
          </component>
        </div>

        <!-- 移动端: 单列布局 -->
        <div class="lg:hidden flex flex-col gap-[4vw]">
          <component
            :is="product.href ? 'a' : 'div'"
            v-for="(product, index) in filteredProducts"
            :key="index"
            :href="product.href || undefined"
            class="group w-full bg-white rounded-lg p-[4vw] flex flex-col"
            style="box-shadow: 0 1vw 4vw rgba(0, 0, 0, 0.12)"
          >
            <!-- 头部：图标+名称 -->
            <div class="flex flex-row items-center mb-[4vw]">
              <div class="w-[12vw] h-[12vw] mr-[3vw] flex-shrink-0">
                <img :src="product.icon || product.image" :alt="product.name" class="w-full h-full object-contain rounded-lg" />
              </div>
              <div class="flex-1 flex flex-col justify-center min-w-0">
                <div class="flex justify-between items-start mb-[1vw]">
                  <div class="text-[3.5vw] font-medium text-[#333] truncate text-left flex-1 mr-[2vw]">{{ product.name }}</div>
                  <div v-if="product.href" class="text-[3vw] text-primary whitespace-nowrap">查看详情 &gt;</div>
                </div>
                <div v-if="product.version" class="text-[2.5vw] text-[#666] text-left">版本号: {{ product.version }}</div>
              </div>
            </div>

            <!-- 描述 -->
            <p v-if="product.description" class="text-[3vw] text-[#666] text-left leading-[1.8] line-clamp-3">
              {{ product.description }}
            </p>
          </component>
        </div>
      </template>

      <!-- 空状态 -->
      <div v-if="filteredProducts.length === 0" class="py-[8vw] lg:py-[4vw] text-center">
        <svg
          class="w-[12vw] h-[12vw] lg:w-[4vw] lg:h-[4vw] mx-auto mb-[3vw] lg:mb-[1vw] text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p class="text-[3.5vw] lg:text-[1vw] text-gray-500">未找到匹配的产品</p>
        <p class="text-[2.8vw] lg:text-[0.8vw] text-gray-400 mt-[1vw]">请尝试其他关键词</p>
      </div>

      <!-- 分页 - 仅硬件产品显示 -->
      <div v-if="shouldShowPagination && filteredProducts.length > 0" class="mt-[6vw] lg:mt-[3.125vw] flex justify-center">
        <Pagination :current-page="internalCurrentPage" :total-pages="calculatedTotalPages" @change="handlePageChange" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";

import Pagination from "../pagination/pagination.vue";

interface Product {
  image?: string;
  icon?: string;
  name: string;
  description?: string;
  version?: string;
  tags?: string[];
  features?: string[];
  href?: string;
}

interface Props {
  title?: string;
  subtitle?: string;
  products: Product[];
  cardType?: "hardware" | "application";
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  searchKeyword?: string;
}

const props = withDefaults(defineProps<Props>(), {
  cardType: "hardware",
  pageSize: 9,
  currentPage: 1,
  searchKeyword: "",
});

const emit = defineEmits<{
  pageChange: [page: number];
}>();

// 内部状态
const internalCurrentPage = ref(props.currentPage || 1);
const externalSearchKeyword = ref("");

// 从 URL 读取搜索关键词和页码
const updateFromUrl = () => {
  if (typeof window === "undefined") return;

  const urlParams = new URLSearchParams(window.location.search);
  const q = urlParams.get("q");
  externalSearchKeyword.value = q || "";

  const page = urlParams.get("page");
  if (page) {
    internalCurrentPage.value = parseInt(page, 10) || 1;
  } else {
    internalCurrentPage.value = 1;
  }
};

// 监听自定义搜索事件
let searchHandler: ((e: CustomEvent) => void) | null = null;
let popStateHandler: (() => void) | null = null;

onMounted(() => {
  updateFromUrl();

  // 监听自定义搜索事件（来自 ProductSearchHero）
  searchHandler = (e: CustomEvent) => {
    externalSearchKeyword.value = e.detail?.keyword || "";
    internalCurrentPage.value = 1; // 重置到第一页
  };
  window.addEventListener("product-search" as any, searchHandler);

  // 监听浏览器历史变化（前进/后退）
  popStateHandler = () => {
    updateFromUrl();
  };
  window.addEventListener("popstate", popStateHandler);
});

onUnmounted(() => {
  if (searchHandler) {
    window.removeEventListener("product-search" as any, searchHandler);
  }
  if (popStateHandler) {
    window.removeEventListener("popstate", popStateHandler);
  }
});

// 有效的搜索关键词（props、URL 或自定义事件）
const effectiveSearchKeyword = computed(() => {
  return props.searchKeyword || externalSearchKeyword.value;
});

// 根据搜索关键词过滤产品
const filteredProducts = computed(() => {
  const keyword = effectiveSearchKeyword.value;
  if (!keyword || keyword.trim() === "") {
    return props.products;
  }

  const lowerKeyword = keyword.toLowerCase().trim();
  return props.products.filter((product) => {
    const nameMatch = product.name.toLowerCase().includes(lowerKeyword);
    const descMatch = product.description?.toLowerCase().includes(lowerKeyword) || false;
    const featureMatch = product.features?.some((f) => f.toLowerCase().includes(lowerKeyword)) || false;
    return nameMatch || descMatch || featureMatch;
  });
});

// 计算是否显示分页
const shouldShowPagination = computed(() => {
  // application 模式下不显示分页
  if (props.cardType === "application") return false;
  if (props.pageSize === 0) return false;
  if (props.showPagination) return true;
  return filteredProducts.value.length > props.pageSize;
});

// 计算总页数
const calculatedTotalPages = computed(() => {
  if (props.cardType === "application") return 1;
  if (props.pageSize === 0) return 1;
  if (props.totalPages && props.totalPages > 0) return props.totalPages;
  return Math.ceil(filteredProducts.value.length / props.pageSize);
});

// 过滤并分页后的产品列表
const filteredAndPaginatedProducts = computed(() => {
  if (props.cardType === "application") return filteredProducts.value;
  if (props.pageSize === 0) return filteredProducts.value;

  const start = (internalCurrentPage.value - 1) * props.pageSize;
  const end = start + props.pageSize;
  return filteredProducts.value.slice(start, end);
});

const handlePageChange = (page: number) => {
  internalCurrentPage.value = page;
  emit("pageChange", page);

  // 更新 URL 页码参数
  const url = new URL(window.location.href);
  if (page > 1) {
    url.searchParams.set("page", String(page));
  } else {
    url.searchParams.delete("page");
  }
  window.history.pushState({}, "", url);

  // 滚动到产品列表顶部
  window.scrollTo({ top: document.querySelector("section")?.offsetTop || 0, behavior: "smooth" });
};
</script>
