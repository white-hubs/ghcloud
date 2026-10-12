<template>
  <div class="carousel-wrapper w-full">
    <div class="carousel relative w-full h-fluid-carousel overflow-hidden">
      <div class="slides flex h-full transition-transform duration-500 ease-in-out" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
        <div v-for="(item, index) in items" :key="index" class="slide min-w-full h-full relative">
          <img :src="item.image" :alt="item.title" class="absolute inset-0 w-full h-full object-cover" />
          <div class="absolute inset-0 flex items-center z-10">
            <div class="max-w-6xl mx-auto px-4 lg:px-6 w-full">
              <div v-if="item.badge" class="inline-block px-3 py-1 bg-primary/90 text-white text-fluid-xs rounded mb-3 lg:mb-[3.125vw]">{{ item.badge }}</div>
              <h2 v-if="item.title" class="text-[5vw] lg:text-fluid-4xl font-bold mb-5 lg:mb-[3.125vw]" :style="{ color: item.titleColor || '#333' }">{{ item.title }}</h2>
              <p v-if="item.subtitle" class="text-[3.5vw] lg:text-fluid-lg mb-2 lg:mb-[3.125vw] font-medium max-w-[52rem] lg:line-clamp-4 whitespace-pre-line" :style="{ color: item.subtitleColor || '#666' }">{{ item.subtitle }}</p>
              <p v-if="item.description" class="text-[3.2vw] lg:text-fluid-base mb-4 lg:mb-[3.125vw] max-w-[48rem] lg:line-clamp-4" :style="{ color: item.subtitleColor || '#666' }">{{ item.description }}</p>
              
              <!-- Buttons -->
              <div v-if="item.primaryButton || item.secondaryButton" class="flex flex-wrap gap-3 lg:gap-4">
                <!-- Primary button -->
                <a v-if="item.primaryButton" :href="item.primaryButton.link" class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90" :style="{ backgroundColor: item.primaryButton.color || 'var(--primary)', color: '#fff' }">
                  {{ item.primaryButton.text }}
                </a>
                
                <!-- Secondary button -->
                <a v-if="item.secondaryButton" :href="item.secondaryButton.link" class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-white transition-all hover:bg-gray-100" :style="{ 
                  color: item.secondaryButton.color || 'var(--primary)'
                }">
                  {{ item.secondaryButton.text }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="items.length > 1" class="dots absolute bottom-4 lg:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        <span v-for="(item, index) in items" :key="index" class="dot w-fluid-3 h-fluid-3 rounded-full cursor-pointer transition-colors" :class="index === currentIndex ? 'bg-primary' : 'bg-white/50'" @click="currentIndex = index"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface ButtonConfig {
  text: string
  link: string
  color?: string
}

interface CarouselItem {
  image: string
  title?: string
  subtitle?: string
  description?: string
  badge?: string
  link?: string
  titleColor?: string
  subtitleColor?: string
  theme?: 'dark' | 'light'
  primaryButton?: ButtonConfig
  secondaryButton?: ButtonConfig
}

interface Props {
  items: CarouselItem[]
}

const props = defineProps<Props>()
const currentIndex = ref(0)
let timer: ReturnType<typeof setInterval>

function next() {
  currentIndex.value = (currentIndex.value + 1) % props.items.length
}

onMounted(() => {
  if (props.items.length > 1) {
    timer = setInterval(next, 5000)
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
