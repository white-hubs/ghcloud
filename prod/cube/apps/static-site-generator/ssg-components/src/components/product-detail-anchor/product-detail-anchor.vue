<template>
  <nav class="w-full bg-white border-b border-[#e5e7eb]">
    <div class="px-[5vw] lg:px-[15.625vw]">
      <ul class="flex items-center justify-between overflow-x-auto scrollbar-hide">
        <li v-for="anchor in anchors" :key="anchor.id">
          <a
            :href="`#${anchor.id}`"
            :class="[
              'block py-[3vw] lg:py-[1.6667vw] text-[2.8vw] lg:text-[0.8333vw] whitespace-nowrap border-b-2 transition-colors',
              activeId === anchor.id
                ? 'text-primary border-primary'
                : 'text-[#3d456e] border-transparent hover:text-primary'
            ]"
            @click.prevent="scrollToAnchor(anchor.id)"
          >
            {{ anchor.name }}
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
interface Anchor {
  id: string
  name: string
}

interface Props {
  anchors: Anchor[]
  activeId?: string
}

const props = defineProps<Props>()

const scrollToAnchor = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    const navHeight = 64 // 导航栏高度
    const rect = element.getBoundingClientRect()
    const scrollTop = window.pageYOffset + rect.top - navHeight
    window.scrollTo({ top: scrollTop, behavior: 'smooth' })
  }
}
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
