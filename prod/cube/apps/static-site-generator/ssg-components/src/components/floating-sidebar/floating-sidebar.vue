<template>
  <div class="fixed right-[1vw] bottom-[2vw] z-50 hidden lg:flex flex-col gap-[0.5vw]">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="relative sidebar-item"
    >
      <component
        :is="item.linkUrl ? 'a' : 'button'"
        :href="item.linkUrl || undefined"
        class="flex items-center justify-center w-[2.5vw] h-[2.5vw] rounded-full shadow-md transition-all duration-200 border bg-white text-gray-600 border-gray-200 sidebar-btn"
        @click="!item.linkUrl ? handleClick(index, item) : undefined"
      >
        <!-- 自定义 SVG（通过 URL 加载后内联渲染，支持 hover 改色） -->
        <span
          v-if="isSvgUrl(item.icon) && svgCache[index]"
          class="flex items-center justify-center"
          v-html="svgCache[index]"
        />
        <!-- 内置图标 -->
        <svg
          v-else-if="item.icon === 'phone'"
          class="w-[1vw] h-[1vw]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
        <svg
          v-else-if="item.icon === 'message'"
          class="w-[1vw] h-[1vw]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
        <svg
          v-else-if="item.icon === 'wechat'"
          class="w-[1vw] h-[1vw]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zM14.51 13.88a.94.94 0 0 1 .939-.944c.519 0 .94.423.94.944a.94.94 0 0 1-.94.943.94.94 0 0 1-.94-.943zm4.963 0a.94.94 0 0 1 .94-.944c.519 0 .939.423.939.944a.94.94 0 0 1-.94.943.94.94 0 0 1-.939-.943z"/>
        </svg>
        <!-- 文字内容 -->
        <span
          v-else-if="item.content"
          class="text-[0.7vw] font-medium"
        >{{ item.content }}</span>
        <!-- 名称兜底 -->
        <span
          v-else-if="item.name"
          class="text-[0.8vw] font-medium"
        >{{ item.name }}</span>
      </component>

      <!-- Popover -->
      <div
        v-if="hasPopoverContent(item)"
        :class="[
          'absolute right-full top-1/2 -translate-y-1/2 mr-[0.5vw] bg-white shadow-lg rounded p-[0.8333vw] transition-all duration-200 z-50 sidebar-popover',
          item.img ? 'min-w-[10vw] min-h-[10vw] flex items-center justify-center' : 'whitespace-nowrap'
        ]"
      >
        <img
          v-if="item.img"
          :src="item.img"
          :alt="item.name || 'popover'"
          class="w-[8vw] h-auto object-contain block"
          @error="void 0"
        >
        <span
          v-else-if="item.content"
          class="text-fluid-sm text-gray-700"
        >{{ item.content }}</span>
        <span
          v-else-if="item.name"
          class="text-fluid-sm text-gray-700"
        >{{ item.name }}</span>
      </div>
    </div>

    <!-- 回到顶部 -->
    <div class="relative sidebar-item">
      <button
        class="flex items-center justify-center w-[2.5vw] h-[2.5vw] rounded-full shadow-md transition-all duration-200 border bg-white text-gray-600 border-gray-200 sidebar-btn"
        @click="scrollToTop"
      >
        <svg class="w-[1vw] h-[1vw]" viewBox="0 0 18 18" fill="currentColor">
          <path d="M10.0079403,6.35869551 L17.2284374,13.6102486 L14.1383762,13.6102486 L14.1383762,18.75 L5.86197901,18.75 L5.84645128,13.6102486 L2.80297279,13.6102486 L10.0079403,6.35869551 Z M18.2532825,1.25 L18.2532825,3.31521726 L1.74707031,3.31521726 L1.74707031,1.25 L18.2532825,1.25 Z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface SidebarItem {
  name?: string
  icon?: string
  content?: string
  img?: string
  linkUrl?: string
}

interface Props {
  items?: SidebarItem[]
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
})

/** 缓存加载的 SVG 内容 */
const svgCache = ref<Record<number, string>>({})

/** 判断是否为 SVG URL */
const isSvgUrl = (icon?: string): boolean => {
  if (!icon) return false
  return icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('//') || icon.endsWith('.svg')
}

/** 处理 SVG 文本，确保 hover 时可改色 */
const processSvg = (svgText: string): string => {
  // 提取 <svg>...</svg> 内容
  const svgMatch = svgText.match(/<svg[\s\S]*?<\/svg>/i)
  if (!svgMatch) return ''
  let svg = svgMatch[0]

  // 确保有 viewBox（没有则无法正确缩放）
  if (!svg.includes('viewBox')) {
    // 尝试从 width/height 提取
    const widthMatch = svg.match(/width=["']([^"']+)["']/i)
    const heightMatch = svg.match(/height=["']([^"']+)["']/i)
    const width = widthMatch ? widthMatch[1] : '24'
    const height = heightMatch ? heightMatch[1] : '24'
    svg = svg.replace(/<svg/i, `<svg viewBox="0 0 ${width} ${height}"`)
  }

  // 移除固定的 fill/stroke 颜色（保留 currentColor/none/transparent）
  svg = svg.replace(/fill=["']#?[0-9a-fA-F]{3,6}["']/gi, 'fill="currentColor"')
  svg = svg.replace(/stroke=["']#?[0-9a-fA-F]{3,6}["']/gi, 'stroke="currentColor"')

  // 如果没有 fill 属性，在 svg 标签上添加
  if (!svg.includes('fill=')) {
    svg = svg.replace(/<svg/, '<svg fill="currentColor"')
  }

  // 设置尺寸样式
  svg = svg.replace(/<svg/, '<svg class="w-[1vw] h-[1vw]"')

  return svg
}

/** 异步加载 SVG */
const loadSvg = async (url: string, index: number): Promise<void> => {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const text = await response.text()
    svgCache.value[index] = processSvg(text)
  } catch (error) {
    // SVG load failed silently
    svgCache.value[index] = ''
  }
}

onMounted(() => {
  props.items.forEach((item, index) => {
    if (isSvgUrl(item.icon)) {
      loadSvg(item.icon!, index)
    }
  })
})

const hasPopoverContent = (item: SidebarItem) => {
  return !!(item.img || item.content || item.name)
}

const handleClick = (index: number, item: SidebarItem) => {
  // sidebar click handled
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style>
.sidebar-item:hover .sidebar-btn {
  background-color: var(--primary);
  color: white;
  border-color: var(--primary);
}
.sidebar-popover {
  opacity: 0;
  visibility: hidden;
}
.sidebar-item:hover .sidebar-popover {
  opacity: 1;
  visibility: visible;
}
</style>
