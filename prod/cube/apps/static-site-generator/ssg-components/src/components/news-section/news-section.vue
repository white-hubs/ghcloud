<template>
  <div id="news-list" class="w-full bg-white py-[4.17vw]">
    <!-- PC端标题区域 -->
    <div v-if="title || subtitle" class="hidden lg:block text-center mb-[2.0833vw]">
      <h2 v-if="title" class="text-[1.5625vw] font-bold text-[#182b44] mb-[1.04vw]">
        {{ title }}
      </h2>
      <p v-if="subtitle" class="text-[0.729vw] text-[#585c60]">{{ subtitle }}</p>
    </div>
    <!-- 移动端标题区域 -->
    <div v-if="title || subtitle" class="lg:hidden text-center mb-[4vw] px-[4vw]">
      <h2 v-if="title" class="text-[4.5333vw] font-bold text-[#182b44] mb-[2vw]">
        {{ title }}
      </h2>
      <p v-if="subtitle" class="text-[3.4667vw] text-[#585c60]">{{ subtitle }}</p>
    </div>

    <!-- PC端: 2列网格 (grid) -->
    <div v-if="layout === 'grid'" class="hidden lg:grid lg:grid-cols-2 gap-x-[2vw] gap-y-[1.5vw] px-[15.6vw]">
      <component
        :is="item.href ? 'a' : 'div'"
        v-for="(item, index) in news"
        :key="index"
        v-show="visibleIndices.has(index)"
        :href="item.href || undefined"
        class="group flex gap-[1vw] items-start"
      >
        <div class="w-[10vw] h-[7.8vw] rounded-lg overflow-hidden flex-shrink-0">
          <img
            :src="item.image"
            :alt="item.title"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div class="flex-1 min-w-0">
          <span class="text-[0.625vw] text-[#585c60]">{{ item.category }}｜{{ item.date }}</span>
          <h3 class="text-[0.833vw] font-medium text-gray-900 mt-[0.3vw] mb-[0.5vw] line-clamp-1">
            {{ item.title }}
          </h3>
          <p class="text-[0.729vw] text-gray-500 line-clamp-2">{{ item.summary }}</p>
        </div>
      </component>
    </div>

    <!-- PC端: 单列列表 (list) -->
    <div v-else class="hidden lg:flex lg:flex-col gap-[1.5vw] px-[15.6vw]">
      <component
        :is="item.href ? 'a' : 'div'"
        v-for="(item, index) in news"
        :key="index"
        v-show="visibleIndices.has(index)"
        :href="item.href || undefined"
        class="group flex gap-[1.5vw] items-start py-[1.5vw] border-b border-gray-100 last:border-b-0"
      >
        <div class="w-[15vw] h-[10vw] rounded-lg overflow-hidden flex-shrink-0">
          <img
            :src="item.image"
            :alt="item.title"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div class="flex-1 min-w-0">
          <span class="text-[0.729vw] text-[#585c60]">{{ item.category }}｜{{ item.date }}</span>
          <h3 class="text-[0.9375vw] font-medium text-gray-900 mt-[0.5vw] mb-[0.8vw] line-clamp-1">
            {{ item.title }}
          </h3>
          <p class="text-[0.833vw] text-gray-500 line-clamp-2">{{ item.summary }}</p>
        </div>
      </component>
    </div>

    <!-- 查看更多按钮 -->
    <div v-if="viewMoreLink && visibleCount > 0" class="hidden lg:flex justify-center mt-[2vw]">
      <a
        :href="viewMoreLink"
        class="inline-flex items-center gap-[0.5vw] px-[2vw] py-[0.8vw] border border-gray-300 rounded text-[0.729vw] text-gray-600 hover:border-primary hover:text-primary transition-colors"
      >
        {{ viewMoreText || "查看更多" }}
        <svg class="w-[0.6vw] h-[0.6vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </a>
    </div>

    <!-- 移动端: 单列 -->
    <div class="lg:hidden flex flex-col gap-[3.2vw] px-[4vw]">
      <component
        :is="item.href ? 'a' : 'div'"
        v-for="(item, index) in news"
        :key="index"
        v-show="visibleIndices.has(index)"
        :href="item.href || undefined"
        class="flex gap-[3vw] p-[3vw] bg-white rounded-lg border border-gray-100"
      >
        <div class="w-[25vw] h-[20vw] flex-shrink-0 rounded overflow-hidden">
          <img :src="item.image" :alt="item.title" class="w-full h-full object-cover" />
        </div>
        <div class="flex-1 min-w-0">
          <span class="text-xs text-gray-400">{{ item.category }}｜{{ item.date }}</span>
          <h3 class="text-sm font-medium text-gray-900 mt-[1vw] line-clamp-2">
            {{ item.title }}
          </h3>
          <p class="text-xs text-gray-500 mt-[1vw] line-clamp-2">{{ item.summary }}</p>
        </div>
      </component>
    </div>

    <!-- 移动端查看更多 -->
    <div v-if="viewMoreLink && visibleCount > 0" class="lg:hidden flex justify-center mt-[4vw] px-[4vw]">
      <a
        :href="viewMoreLink"
        class="inline-flex items-center gap-[1vw] px-[4vw] py-[2vw] border border-gray-300 rounded text-sm text-gray-600 hover:border-primary hover:text-primary transition-colors"
      >
        {{ viewMoreText || "查看更多" }}
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </a>
    </div>

    <!-- 分页 -->
    <Pagination
      v-if="totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      mode="link"
      :page-url-template="pageUrlTemplate"
      anchor="news-list"
    />

    <!-- 空状态 -->
    <div v-if="visibleCount === 0" class="text-center py-[4vw] text-gray-400">
      <p class="text-fluid-base">暂无相关文章</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";

import Pagination from "../pagination/pagination.vue";

interface NewsItem {
  title: string;
  date: string;
  summary: string;
  category: string;
  href?: string;
  image: string;
}

interface Props {
  title?: string;
  subtitle?: string;
  news: NewsItem[];
  viewMoreLink?: string;
  viewMoreText?: string;
  limit?: number;
  enableCategoryFilter?: boolean;
  layout?: "grid" | "list";
  currentPage?: number;
  totalPages?: number;
  pageUrlTemplate?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  subtitle: "",
  viewMoreLink: "",
  viewMoreText: "查看更多",
  limit: 4,
  enableCategoryFilter: false,
  layout: "grid",
  currentPage: 1,
  totalPages: 1,
  pageUrlTemplate: "/information/page/{page}.html",
});

const urlCategory = ref("");

onMounted(() => {
  if (typeof window !== "undefined" && props.enableCategoryFilter) {
    urlCategory.value = new URLSearchParams(window.location.search).get("category") || "";
  }
});

const visibleIndices = computed(() => {
  // 构建时分页模式：news 已经是当前页切片数据，只需分类筛选
  if (props.totalPages > 1) {
    const indices: number[] = [];
    for (let i = 0; i < props.news.length; i++) {
      if (!props.enableCategoryFilter || !urlCategory.value || props.news[i].category === urlCategory.value) {
        indices.push(i);
      }
    }
    return new Set(indices);
  }

  // 原有逻辑
  if (!props.enableCategoryFilter) {
    const end = props.limit <= 0 ? props.news.length : Math.min(props.limit, props.news.length);
    return new Set(Array.from({ length: end }, (_, i) => i));
  }

  const indices: number[] = [];
  for (let i = 0; i < props.news.length; i++) {
    if (!urlCategory.value || props.news[i].category === urlCategory.value) {
      indices.push(i);
      if (props.limit > 0 && indices.length >= props.limit) break;
    }
  }
  return new Set(indices);
});

const visibleCount = computed(() => visibleIndices.value.size);
</script>
