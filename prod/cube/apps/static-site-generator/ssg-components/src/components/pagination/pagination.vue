<template>
  <nav class="flex items-center justify-center gap-[2vw] lg:gap-[0.5208vw] mt-[6vw] lg:mt-0 mb-[4vw] lg:mb-[4.17vw]" aria-label="分页">
    <template v-if="mode === 'event'">
      <!-- 上一页 -->
      <button
        :disabled="currentPage <= 1"
        class="flex items-center justify-center w-[10vw] h-[10vw] lg:w-[2.0833vw] lg:h-[2.0833vw] rounded border border-gray-200 text-gray-600 hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        @click="handleChange(currentPage - 1)"
      >
        <svg class="w-[5vw] h-[5vw] lg:w-[0.8333vw] lg:h-[0.8333vw]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </button>

      <!-- 页码 -->
      <template v-for="page in visiblePages" :key="page">
        <button
          v-if="page !== '...'"
          :class="[
            'flex items-center justify-center w-[10vw] h-[10vw] lg:w-[2.0833vw] lg:h-[2.0833vw] rounded text-[3.5vw] lg:text-fluid-sm transition-colors',
            page === currentPage
              ? 'bg-primary text-white'
              : 'border border-gray-200 text-gray-600 hover:border-primary hover:text-primary',
          ]"
          @click="handleChange(page as number)"
        >
          {{ page }}
        </button>
        <span v-else class="text-[3.5vw] lg:text-fluid-sm text-gray-400 px-[2vw] lg:px-[0.4167vw]">...</span>
      </template>

      <!-- 下一页 -->
      <button
        :disabled="currentPage >= totalPages"
        class="flex items-center justify-center w-[10vw] h-[10vw] lg:w-[2.0833vw] lg:h-[2.0833vw] rounded border border-gray-200 text-gray-600 hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        @click="handleChange(currentPage + 1)"
      >
        <svg class="w-[5vw] h-[5vw] lg:w-[0.8333vw] lg:h-[0.8333vw]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
        </svg>
      </button>
    </template>

    <template v-else>
      <!-- 上一页 -->
      <a
        v-if="currentPage > 1"
        :href="getPageUrl(currentPage - 1)"
        class="flex items-center justify-center w-[10vw] h-[10vw] lg:w-[2.0833vw] lg:h-[2.0833vw] rounded border border-gray-200 text-gray-600 hover:border-primary hover:text-primary transition-colors"
      >
        <svg class="w-[5vw] h-[5vw] lg:w-[0.8333vw] lg:h-[0.8333vw]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </a>
      <span
        v-else
        class="flex items-center justify-center w-[10vw] h-[10vw] lg:w-[2.0833vw] lg:h-[2.0833vw] rounded border border-gray-200 text-gray-400 opacity-50 cursor-not-allowed"
      >
        <svg class="w-[5vw] h-[5vw] lg:w-[0.8333vw] lg:h-[0.8333vw]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </span>

      <!-- 页码 -->
      <template v-for="page in visiblePages" :key="page">
        <a
          v-if="page !== '...' && page !== currentPage"
          :href="getPageUrl(page as number)"
          class="flex items-center justify-center w-[10vw] h-[10vw] lg:w-[2.0833vw] lg:h-[2.0833vw] rounded text-[3.5vw] lg:text-fluid-sm transition-colors border border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
        >
          {{ page }}
        </a>
        <span
          v-else-if="page !== '...'"
          class="flex items-center justify-center w-[10vw] h-[10vw] lg:w-[2.0833vw] lg:h-[2.0833vw] rounded text-[3.5vw] lg:text-fluid-sm bg-primary text-white"
        >
          {{ page }}
        </span>
        <span v-else class="text-[3.5vw] lg:text-fluid-sm text-gray-400 px-[2vw] lg:px-[0.4167vw]">...</span>
      </template>

      <!-- 下一页 -->
      <a
        v-if="currentPage < totalPages"
        :href="getPageUrl(currentPage + 1)"
        class="flex items-center justify-center w-[10vw] h-[10vw] lg:w-[2.0833vw] lg:h-[2.0833vw] rounded border border-gray-200 text-gray-600 hover:border-primary hover:text-primary transition-colors"
      >
        <svg class="w-[5vw] h-[5vw] lg:w-[0.8333vw] lg:h-[0.8333vw]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
        </svg>
      </a>
      <span
        v-else
        class="flex items-center justify-center w-[10vw] h-[10vw] lg:w-[2.0833vw] lg:h-[2.0833vw] rounded border border-gray-200 text-gray-400 opacity-50 cursor-not-allowed"
      >
        <svg class="w-[5vw] h-[5vw] lg:w-[0.8333vw] lg:h-[0.8333vw]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
        </svg>
      </span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
  mode?: 'event' | 'link'
  pageUrlTemplate?: string
  anchor?: string
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'event',
  pageUrlTemplate: '',
  anchor: '',
})

const emit = defineEmits<{
  (e: 'change', page: number): void
}>()

const handleChange = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('change', page)
  }
}

const getPageUrl = (page: number): string => {
  let url = ''
  if (page === 1) {
    url = props.pageUrlTemplate.replace(/\/page\/\{page\}\.html$/, '.html')
  } else {
    url = props.pageUrlTemplate.replace('{page}', String(page))
  }
  if (props.anchor) {
    url += '#' + props.anchor
  }
  return url
}

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const maxVisible = 5

  if (props.totalPages <= maxVisible) {
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i)
    }
  } else {
    // 复杂分页逻辑
    if (props.currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i)
      pages.push('...')
      pages.push(props.totalPages)
    } else if (props.currentPage >= props.totalPages - 2) {
      pages.push(1)
      pages.push('...')
      for (let i = props.totalPages - 3; i <= props.totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = props.currentPage - 1; i <= props.currentPage + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(props.totalPages)
    }
  }

  return pages
})
</script>
