<template>
  <div class="w-full h-[50.7813vw] bg-white relative">
    <h2 class="absolute left-1/2 -translate-x-1/2 top-[6.25vw] text-[1.5625vw] font-bold text-[#182b44] font-['SOURCEHANSANSSC-BOLD']">{{ title || '我们的团队' }}</h2>
    <p class="absolute left-1/2 -translate-x-1/2 top-[10.625vw] text-[0.7292vw] text-[#585c60] whitespace-nowrap font-['SOURCEHANSANSSC-REGULAR']">{{ subtitle || '在成都、长沙、深圳设立了研发中心和业务中心，具备强大的产品技术实力与完善的服务能力' }}</p>
    <ul class="absolute left-1/2 -translate-x-1/2 top-[15.625vw] flex justify-center list-none p-0 m-0">
      <li v-for="(item, i) in displayItems" :key="i"
          :style="{ backgroundImage: `url(${item.image})` }"
          :class="['relative overflow-hidden transition-all duration-300 cursor-pointer bg-cover bg-no-repeat bg-center h-[28.9063vw]', activeIndex === i ? 'w-[44.5313vw]' : 'w-[10.1563vw]']"
          @mouseenter="activeIndex = i">
        <div v-if="activeIndex !== i" class="absolute inset-0 bg-[#010914]/65"></div>
        <div v-if="activeIndex === i && (item.title || item.description)" class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-[1.875vw] text-white text-center">
          <h3 v-if="item.title" class="text-[1.0417vw] font-bold mb-[0.625vw] text-center">{{ item.title }}</h3>
          <p v-if="item.description" class="text-[0.7292vw] leading-relaxed opacity-90 text-center">{{ item.description }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface GalleryItem {
  image: string
  title?: string
  description?: string
}

const props = defineProps<{
  images?: string[]
  items?: GalleryItem[]
  title?: string
  subtitle?: string
}>()

const activeIndex = ref(0)

const displayItems = computed<GalleryItem[]>(() => {
  if (props.items && props.items.length > 0) {
    return props.items
  }
  return (props.images || []).map(img => ({ image: img }))
})
</script>
