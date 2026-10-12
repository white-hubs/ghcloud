<template>
  <div id="category-filter" class="w-full bg-white scroll-mt-16">
    <!-- PC端 -->
    <div class="hidden lg:flex items-center justify-center h-[4.4792vw]">
      <div class="flex items-center w-[68.75vw] mx-auto gap-[0.8854vw]">
        <component
          :is="getTag(category)"
          v-for="category in allCategories"
          :key="category.id"
          :href="getTag(category) === 'a' ? category.href : undefined"
          type="button"
          :class="[
            'flex-1 flex items-center justify-center gap-[0.5208vw] h-[2.8125vw] rounded-[0.5208vw] text-[0.9375vw] transition-all duration-200 no-underline cursor-pointer',
            currentCategoryId === category.id
              ? 'bg-primary text-white px-[1.25vw]'
              : 'bg-transparent text-[#67717d] px-[24px] hover:text-[#182b44]',
          ]"
        >
          <!-- 全部内置图标 -->
          <svg
            v-if="category.id === 'all'"
            class="w-[0.8333vw] h-[0.8333vw] flex-shrink-0 category-icon"
            :class="{ 'category-icon--active': currentCategoryId === category.id }"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"
            />
          </svg>
          <!-- SVG 图标 -->
          <img
            v-else-if="category.icon && category.icon.endsWith('.svg')"
            :src="category.icon"
            :alt="category.name"
            class="w-[0.8333vw] h-[0.8333vw] flex-shrink-0 object-contain category-icon"
            :class="{ 'category-icon--active': currentCategoryId === category.id }"
          />
          <!-- 普通图片 -->
          <img
            v-else-if="category.icon"
            :src="category.icon"
            :alt="category.name"
            class="w-[0.8333vw] h-[0.8333vw] flex-shrink-0 object-contain"
          />
          <span class="whitespace-nowrap">{{ category.name }}</span>
        </component>
      </div>
    </div>

    <!-- 移动端 -->
    <div class="lg:hidden flex items-center h-[14vw] px-[4vw]">
      <div class="flex items-center gap-[2vw] w-full overflow-x-auto hide-scrollbar">
        <component
          :is="getTag(category)"
          v-for="category in allCategories"
          :key="category.id"
          :href="getTag(category) === 'a' ? category.href : undefined"
          type="button"
          :class="[
            'flex items-center justify-center gap-[1vw] h-[8vw] rounded-[2vw] text-[3vw] transition-all duration-200 no-underline cursor-pointer',
            currentCategoryId === category.id ? 'bg-primary text-white px-[3vw]' : 'bg-transparent text-[#67717d] px-[3vw]',
          ]"
        >
          <!-- 全部内置图标 -->
          <svg
            v-if="category.id === 'all'"
            class="w-[3vw] h-[3vw] flex-shrink-0 category-icon"
            :class="{ 'category-icon--active': currentCategoryId === category.id }"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"
            />
          </svg>
          <!-- SVG 图标 -->
          <img
            v-else-if="category.icon && category.icon.endsWith('.svg')"
            :src="category.icon"
            :alt="category.name"
            class="w-[3vw] h-[3vw] flex-shrink-0 object-contain category-icon"
            :class="{ 'category-icon--active': currentCategoryId === category.id }"
          />
          <!-- 普通图片 -->
          <img v-else-if="category.icon" :src="category.icon" :alt="category.name" class="w-[3vw] h-[3vw] flex-shrink-0 object-contain" />
          <span class="whitespace-nowrap">{{ category.name }}</span>
        </component>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";

interface Category {
  id: string;
  name: string;
  icon?: string;
  href?: string;
}

interface Props {
  categories: Category[];
  activeId?: string;
  allText?: string;
  allHref?: string;
  urlAware?: boolean;
  wrapMobile?: boolean;
}

const props = defineProps<Props>();

const urlCategory = ref("");

function updateUrlCategory(): void {
  if (props.urlAware && typeof window !== "undefined") {
    urlCategory.value = new URLSearchParams(window.location.search).get("category") || "";
  }
}

onMounted(() => {
  updateUrlCategory();
});

const currentCategoryId = computed(() => {
  if (props.urlAware && urlCategory.value) {
    return urlCategory.value;
  }
  return props.activeId || "all";
});

function getTag(category: Category): string {
  return category.href ? "a" : "button";
}

const allCategories = computed(() => {
  const categories = Array.isArray(props.categories) ? props.categories : [];
  const all: Category = { id: "all", name: props.allText || "全部", href: props.allHref };
  return [all, ...categories];
});
</script>

<style scoped>
/* 未选中状态：图标显示为灰色 #7a838e */
.category-icon {
  filter: brightness(0) saturate(100%) invert(52%) sepia(9%) saturate(527%) hue-rotate(174deg) brightness(91%) contrast(86%);
}

/* 选中状态：图标显示为白色 */
.category-icon--active {
  filter: brightness(0) invert(1);
}

/* 隐藏滚动条 */
.hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
