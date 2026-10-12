<template>
  <section class="w-full h-[60vw] lg:h-[23.9583vw] relative overflow-hidden">
    <!-- 背景图 -->
    <div class="absolute inset-0">
      <img
        :src="backgroundImage"
        alt=""
        class="w-full h-full object-cover"
      />
    </div>

    <!-- 内容层 -->
    <div class="relative z-10 h-full flex flex-col items-center justify-center px-[5vw] lg:px-[15.625vw]">
      <!-- 标题 -->
      <h1 class="text-[6vw] lg:text-[2.34375vw] font-bold text-[#182b44] mb-[2vw] lg:mb-[0.78125vw]">
        {{ title }}
      </h1>

      <!-- 副标题 -->
      <p v-if="subtitle" class="text-[3vw] lg:text-[1.0417vw] text-[#2c3137] mb-[4vw] lg:mb-[2.0833vw] text-center whitespace-nowrap">
        {{ subtitle }}
      </p>

      <!-- 搜索框 -->
      <div class="relative w-full max-w-[90vw] lg:w-[46.875vw]">
        <input
          v-model="searchText"
          type="text"
          :placeholder="placeholder || '搜索你感兴趣的产品'"
          class="w-full h-[10vw] lg:h-[3.125vw] px-[4vw] lg:px-[1.5625vw] pr-[12vw] lg:pr-[3.125vw] text-[3vw] lg:text-[0.8333vw] text-[#182b44] bg-white rounded-full border-none shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-[#abb4c0]"
          @keyup.enter="handleSearch"
        />
        <!-- 搜索按钮 -->
        <button
          class="absolute right-[1vw] lg:right-[0.5208vw] top-1/2 -translate-y-1/2 w-[8vw] h-[8vw] lg:w-[2.0833vw] lg:h-[2.0833vw] flex items-center justify-center text-primary hover:text-primary/80 transition-colors"
          @click="handleSearch"
        >
          <svg class="w-[5vw] h-[5vw] lg:w-[1.25vw] lg:h-[1.25vw]" viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  title: string
  subtitle?: string
  placeholder?: string
  backgroundImage?: string
  searchAllHref?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  search: [text: string]
}>()

const searchText = ref('')

// 从 URL 读取搜索关键词
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const q = urlParams.get('q')
  if (q) {
    searchText.value = q
  }
})

const handleSearch = () => {
  const keyword = searchText.value.trim()
  
  // 获取当前路径（去掉 .html 后缀用于比较）
  const currentPath = window.location.pathname.replace('.html', '')
  const targetPath = props.searchAllHref?.replace('.html', '') || ''
  
  // 如果配置了 searchAllHref 且当前页面不是汇总页面，跳转到汇总页面
  if (props.searchAllHref && !currentPath.includes(targetPath)) {
    const targetUrl = new URL(props.searchAllHref, window.location.origin)
    if (keyword) {
      targetUrl.searchParams.set('q', keyword)
    }
    window.location.href = targetUrl.toString()
    return
  }
  
  // 更新 URL 参数
  const url = new URL(window.location.href)
  if (keyword) {
    url.searchParams.set('q', keyword)
  } else {
    url.searchParams.delete('q')
  }
  // 重置页码
  url.searchParams.delete('page')
  
  // 使用 pushState 更新 URL
  window.history.pushState({}, '', url)
  
  // 触发自定义事件，通知其他组件搜索关键词已更新
  window.dispatchEvent(new CustomEvent('product-search', { detail: { keyword } }))
  
  // 触发搜索事件
  emit('search', keyword)
  
  // 滚动到产品列表
  setTimeout(() => {
    const productSection = document.querySelector('[style*="background-color: #f5f7fa"]')
    if (productSection) {
      productSection.scrollIntoView({ behavior: 'smooth' })
    }
  }, 100)
}
</script>
