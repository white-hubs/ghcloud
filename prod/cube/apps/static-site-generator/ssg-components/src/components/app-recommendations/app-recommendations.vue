<template>
  <section id="recommendations" class="w-full scroll-mt-[4rem] py-[6vw] lg:py-[3.3333vw] px-[5vw] lg:px-[15.625vw] bg-[#fbfdff]">
    <h2 class="text-[4vw] lg:text-[1.5625vw] font-bold text-[#182b44] mb-[4vw] lg:mb-[2.0833vw]">
      {{ title || "推荐应用" }}
    </h2>

    <!-- 推荐应用列表 -->
    <div v-if="apps.length" class="grid grid-cols-1 lg:grid-cols-3 gap-[4vw] lg:gap-[1.5625vw]">
      <component
        :is="app.href ? 'a' : 'div'"
        v-for="app in apps"
        :key="app.id"
        :href="app.href || undefined"
        class="group w-full h-full min-h-[11.4583vw] bg-white rounded-lg p-[1.3542vw] flex flex-col cursor-pointer transition-all duration-300 hover:translate-y-[-0.26vw]"
        style="box-shadow: 0 0.2083vw 0.8333vw rgba(0, 0, 0, 0.12)"
      >
        <!-- 头部：图标+名称 -->
        <div class="flex flex-row items-center mb-[1.25vw]">
          <div class="w-[3.125vw] h-[3.125vw] mr-[0.8333vw] flex-shrink-0">
            <img :src="app.icon" :alt="app.name" class="w-full h-full object-contain rounded-lg" />
          </div>
          <div class="flex-1 flex flex-col justify-center min-w-0">
            <div class="flex justify-between items-start mb-[0.2083vw]">
              <div class="text-[0.8333vw] font-medium text-[#333] truncate text-left flex-1 mr-[0.625vw]">{{ app.name }}</div>
              <div v-if="app.href" class="text-[0.7292vw] text-primary whitespace-nowrap">查看详情 &gt;</div>
            </div>
            <div v-if="app.version" class="text-[0.625vw] text-[#666] text-left">版本号: {{ app.version }}</div>
          </div>
        </div>

        <!-- 描述 -->
        <p v-if="app.description" class="text-[0.7292vw] text-[#666] text-left leading-[2] line-clamp-3 flex-1">
          {{ app.description }}
        </p>
      </component>
    </div>

    <!-- 空状态 -->
    <div v-else class="py-[4vw] text-center">
      <p class="text-[2.8vw] lg:text-[0.8333vw] text-gray-500">暂无推荐应用</p>
    </div>
  </section>
</template>

<script setup lang="ts">
interface App {
  id: string;
  name: string;
  icon: string;
  version?: string;
  description?: string;
  href?: string;
}

interface Props {
  title?: string;
  apps: App[];
}

defineProps<Props>();
</script>
