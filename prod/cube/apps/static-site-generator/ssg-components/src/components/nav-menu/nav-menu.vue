<template>
  <!-- PC端导航 - 固定定位 -->
  <header
    class="hidden lg:block fixed top-0 left-0 right-0 z-50 max-w-[100vw] transition-all duration-300"
    :style="{ backgroundColor: currentBgColor, boxShadow: isScrolled ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }"
  >
    <nav class="flex items-center h-fluid-nav max-w-[120rem] mx-auto">
      <!-- Logo -->
      <a href="/" class="flex-shrink-0 lg:ml-[10.4%]">
        <img :src="logo" :alt="logoAlt || 'Logo'" class="h-fluid-logo w-auto" />
      </a>

      <!-- 桌面端导航 -->
      <ul class="hidden lg:flex items-center gap-6 xl:gap-8 ml-[3.75%]">
        <li
          v-for="(item, index) in items"
          :key="index"
          class="relative group flex items-center h-fluid-nav"
          @mouseenter="hoveredIndex = index"
          @mouseleave="hoveredIndex = null"
        >
          <component
            :is="item.routePath || item.path ? 'a' : 'div'"
            :href="item.routePath || item.path || undefined"
            class="flex items-center h-fluid-nav text-[1rem] whitespace-nowrap transition-colors px-3 rounded hover:bg-white/20"
            :style="{ color: currentTextColor }"
            :class="{ 'text-primary': activeIndex === index }"
          >
            {{ item.name }}
            <svg v-if="item.children && item.children.length" class="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </component>

          <!-- 简单下拉菜单 -->
          <div
            v-if="item.children && item.children.length > 0 && !isComplex(item)"
            class="absolute top-full left-0 hidden group-hover:block bg-white shadow-lg py-4 z-10 font-cn"
            style="width: 100%"
          >
            <ul class="whitespace-nowrap text-center">
              <li v-for="(child, idx) in item.children" :key="idx" class="py-2 hover:bg-gray-50 text-center">
                <component
                  :is="(child as any).routePath || (child as any).path ? 'a' : 'div'"
                  :href="(child as any).routePath || (child as any).path || undefined"
                  class="text-gray-600 hover:text-primary"
                >
                  {{ (child as any).name }}
                </component>
              </li>
            </ul>
          </div>

          <!-- 复杂下拉菜单 -->
          <div
            v-if="item.children && item.children.length > 0 && isComplex(item)"
            class="fixed left-0 hidden group-hover:flex w-screen shadow-xl z-10 font-cn"
            :style="{ top: 'clamp(3rem, 3.33vw, 4rem)' }"
          >
            <div class="w-1/4 bg-blue-50 p-8">
              <div class="flex items-center mb-5">
                <img v-if="navDropdownIcon" :src="navDropdownIcon" class="w-6 h-6 mr-2" :alt="item.desc?.descTitle" />
                <span class="text-xl font-medium">{{ item.desc?.descTitle }}</span>
              </div>
              <p class="text-sm text-gray-500 mb-8">{{ item.desc?.descDetail }}</p>
              <a
                :href="contactHref || '/consultation.html'"
                class="inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
              >
                {{ contactText || "立即咨询" }}
              </a>
            </div>
            <div class="w-3/4 bg-white p-8 grid grid-cols-4 gap-8">
              <div v-for="(sub, idx) in item.children as any" :key="idx">
                <div v-if="isSub(sub)">
                  <h4 class="font-bold text-lg text-gray-800 mb-3">{{ (sub as any).subTitle }}</h4>
                  <ul>
                    <li v-for="(link, linkIdx) in (sub as any).list || []" :key="linkIdx" class="mb-2">
                      <component
                        :is="link.routePath || link.path ? 'a' : 'div'"
                        :href="link.routePath || link.path || undefined"
                        class="text-gray-500 hover:text-primary text-sm"
                      >
                        {{ link.name }}
                      </component>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>

      <!-- 桌面端右侧 -->
      <div class="hidden lg:flex ml-auto pl-[1vw] lg:mr-[13.2%] items-center">
        <svg class="w-5 h-5" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="9" fill="currentColor" class="text-primary" />
          <path
            d="M12.844007,11.1138301 L11.184073,9.51325417 C10.9755626,9.31269979 10.638042,9.31269979 10.4295335,9.51325417 L10.0522637,9.87701893 C9.83885384,10.0827899 9.14780283,9.87798262 8.54325056,9.29500818 C7.93869901,8.71203446 7.72588825,8.04604435 7.93963194,7.84001637 L8.31690168,7.47625208 C8.52490187,7.2752068 8.52490187,6.94976902 8.31690168,6.74872375 L6.656901,5.14821307 C6.44841444,4.94766601 6.11091447,4.94766601 5.90242797,5.14821307 L5.52515823,5.5119772 C5.24639066,5.78076518 5.07659594,6.13430524 5.02037557,6.56282258 C4.96822337,6.96028173 5.0163074,7.40603256 5.16322726,7.88747168 C5.45793405,8.85459495 6.12257469,9.87135887 7.03417134,10.7500653 C7.94576764,11.6287694 9.00008249,12.2698746 10.002779,12.5540309 C10.3721786,12.6587806 10.7211714,12.7114491 11.0446229,12.7114491 C11.1556916,12.7116222 11.2666626,12.7050495 11.3768754,12.6917701 C11.8213029,12.6375613 12.1879687,12.473845 12.4667377,12.2050571 L12.8440061,11.8412919 C13.0519991,11.6402702 13.0519991,11.3148522 12.844007,11.1138301 Z"
            fill="#FFFFFF"
          />
        </svg>
        <a
          v-if="phone"
          :href="`tel:${phone.replace(/-/g, '')}`"
          class="ml-2 text-[1rem] whitespace-nowrap"
          :style="{ color: currentTextColor }"
        >
          咨询热线：{{ phone }}
        </a>
      </div>
    </nav>
  </header>

  <!-- 移动端导航 - 普通文档流定位 -->
  <header class="lg:hidden relative w-full z-50 bg-white">
    <nav class="flex items-center h-[44px] max-w-[120rem] mx-auto px-[4vw]">
      <!-- Logo -->
      <a href="/" class="flex-shrink-0">
        <img :src="logo" :alt="logoAlt || 'Logo'" class="h-[20px] w-auto" />
      </a>

      <!-- 移动端 hamburger 按钮 -->
      <button
        class="ml-auto flex flex-col justify-center items-center w-[24px] h-[24px] z-50 relative text-gray-700"
        @click="menuOpen = !menuOpen"
        aria-label="菜单"
      >
        <!-- 汉堡图标 -->
        <svg v-if="!menuOpen" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <!-- 关闭图标 -->
        <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </nav>

    <!-- 移动端菜单面板 -->
    <div
      class="fixed left-0 w-screen bg-white z-30 transition-all duration-300 lg:hidden shadow-lg overflow-y-auto"
      :class="menuOpen ? 'top-[44px] visible' : 'top-0 invisible pointer-events-none'"
      style="height: calc(100vh - 44px)"
    >
      <ul>
        <template v-for="(item, index) in items" :key="index">
          <!-- 一级菜单 -->
          <li class="flex items-center justify-between px-6 py-4 cursor-pointer" @click="toggleSubmenu(index)">
            <span class="text-gray-700 font-medium text-xl">{{ item.name }}</span>
            <svg
              v-if="item.children?.length"
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': openSubmenus.includes(index) }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </li>

          <!-- 二级菜单（简单类型） -->
          <Transition name="slide-down">
            <li v-if="item.children?.length && openSubmenus.includes(index) && !isComplex(item)" class="bg-gray-50">
              <ul>
                <li v-for="(child, idx) in item.children" :key="idx">
                  <component
                    :is="(child as any).routePath || (child as any).path ? 'a' : 'div'"
                    :href="(child as any).routePath || (child as any).path || undefined"
                    class="block px-6 py-3 pl-10 text-gray-600 hover:bg-gray-100 hover:text-primary text-lg transition-colors"
                    @click="menuOpen = false"
                  >
                    {{ (child as any).name }}
                  </component>
                </li>
              </ul>
            </li>
          </Transition>

          <!-- 二级菜单（复杂类型） -->
          <Transition name="slide-down">
            <li v-if="item.children?.length && openSubmenus.includes(index) && isComplex(item)" class="bg-gray-50">
              <ul>
                <li v-for="(sub, idx) in item.children" :key="idx">
                  <div v-if="isSub(sub)" class="px-6 py-2 text-lg font-semibold text-gray-800">
                    {{ (sub as any).subTitle }}
                  </div>
                  <component
                    v-for="(link, linkIdx) in (sub as any).list || []"
                    :key="linkIdx"
                    :is="link.routePath || link.path ? 'a' : 'div'"
                    :href="link.routePath || link.path || undefined"
                    class="block px-8 py-2.5 pl-14 text-gray-600 hover:bg-gray-100 hover:text-primary text-lg transition-colors"
                    @click="menuOpen = false"
                  >
                    {{ link.name }}
                  </component>
                </li>
              </ul>
            </li>
          </Transition>
        </template>
      </ul>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

defineOptions({
  inheritAttrs: false,
});

/** 旧格式：兼容现有数据 */
interface NavItemV1 {
  name: string;
  path?: string;
  routePath?: string;
  children?: (NavItemV1 | SubItemV1)[];
  desc?: { descTitle?: string; descDetail?: string };
}

interface SubItemV1 {
  subTitle: string;
  routePath?: string;
  list: { name: string; path?: string; routePath?: string }[];
}

/** 新格式：扁平化结构 */
interface NavItemV2 {
  name: string;
  path?: string;
  routePath?: string;
  menuType?: "none" | "simple" | "complex";
  children?: { name: string; path?: string; routePath?: string }[];
  descTitle?: string;
  descDetail?: string;
  subGroups?: { subTitle: string; routePath?: string; list: { name: string; path?: string; routePath?: string }[] }[];
}

type NavItem = NavItemV1 | NavItemV2;

interface Props {
  items?: NavItem[];
  logo?: string;
  navDropdownIcon?: string;
  phone?: string;
  logoAlt?: string;
  contactText?: string;
  contactHref?: string;
  transparentBgColor?: string;
  transparentTextColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  logo: "",
  navDropdownIcon: "",
  phone: "",
  logoAlt: "",
  contactText: "",
  transparentBgColor: "",
  transparentTextColor: "",
});

const logo = props.logo;
const navDropdownIcon = props.navDropdownIcon;
const phone = props.phone;
const logoAlt = props.logoAlt;
const contactText = props.contactText;

/** 将新格式(V2)转换为内部统一格式(V1)，保持渲染逻辑不变 */
function normalizeItem(item: NavItem): NavItemV1 {
  // 旧格式直接返回
  if (!("menuType" in item)) {
    return item as NavItemV1;
  }

  const v2 = item as NavItemV2;
  const result: NavItemV1 = {
    name: v2.name,
    path: v2.path,
    routePath: v2.routePath,
  };

  if (v2.menuType === "simple" && v2.children && v2.children.length > 0) {
    result.children = v2.children;
  }

  if (v2.menuType === "complex") {
    result.desc = {
      descTitle: v2.descTitle,
      descDetail: v2.descDetail,
    };
    result.children = (v2.subGroups || []).map((g) => ({
      subTitle: g.subTitle,
      routePath: g.routePath,
      list: g.list,
    })) as SubItemV1[];
  }

  return result;
}

const items = computed(() => props.items.map(normalizeItem));

const SCROLL_THRESHOLD = 50;
const SCROLLED_BG = "#ffffff";
const SCROLLED_TEXT = "#374151";

const isScrolled = ref(false);
const scrollY = ref(0);

const handleScroll = () => {
  scrollY.value = window.scrollY;
  isScrolled.value = window.scrollY > 10;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

const currentBgColor = computed(() => {
  if (hoveredIndex.value !== null) return SCROLLED_BG;

  if (!props.transparentBgColor) return SCROLLED_BG;

  const scrollProgress = Math.min(scrollY.value / SCROLL_THRESHOLD, 1);
  if (scrollProgress <= 0) return props.transparentBgColor;
  if (scrollProgress >= 1) return SCROLLED_BG;

  return interpolateColor(props.transparentBgColor, SCROLLED_BG, scrollProgress);
});

const currentTextColor = computed(() => {
  if (hoveredIndex.value !== null) return SCROLLED_TEXT;

  if (!props.transparentTextColor) return SCROLLED_TEXT;

  const scrollProgress = Math.min(scrollY.value / SCROLL_THRESHOLD, 1);
  if (scrollProgress <= 0) return props.transparentTextColor;
  if (scrollProgress >= 1) return SCROLLED_TEXT;

  return interpolateColor(props.transparentTextColor, SCROLLED_TEXT, scrollProgress);
});

const interpolateColor = (color1: string, color2: string, factor: number): string => {
  if (color1 === "transparent") color1 = "rgba(255,255,255,0)";
  if (color2 === "transparent") color2 = "rgba(255,255,255,0)";

  const hex2rgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
  };

  const rgb2hex = (r: number, g: number, b: number): string => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = Math.round(x).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

  const c1 = hex2rgb(color1.startsWith("rgba") ? color1 : "#" + color1.replace("#", ""));
  const c2 = hex2rgb(color2.startsWith("rgba") ? color2 : "#" + color2.replace("#", ""));

  const r = c1.r + (c2.r - c1.r) * factor;
  const g = c1.g + (c2.g - c1.g) * factor;
  const b = c1.b + (c2.b - c1.b) * factor;

  return rgb2hex(r, g, b);
};

const activeIndex = ref(0);
const menuOpen = ref(false);
const openSubmenus = ref<number[]>([]);
const hoveredIndex = ref<number | null>(null);

const toggleSubmenu = (index: number) => {
  const idx = openSubmenus.value.indexOf(index);
  if (idx > -1) {
    openSubmenus.value.splice(idx, 1);
  } else {
    openSubmenus.value.push(index);
  }
};

// 模板中使用的类型守卫函数
const isComplex = (item: NavItemV1): boolean => {
  return !!(item.desc && item.children && item.children.length > 0 && "subTitle" in (item.children[0] || {}));
};

const isSub = (item: NavItem | SubItemV1 | undefined): item is SubItemV1 => {
  return !!item && "subTitle" in item && "list" in item;
};

const isNav = (item: NavItem | SubItemV1 | undefined): item is NavItem => {
  return !!item && "name" in item;
};
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-in-out;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
