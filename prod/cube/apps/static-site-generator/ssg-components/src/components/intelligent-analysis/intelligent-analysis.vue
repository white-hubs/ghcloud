<template>
  <div class="w-full" style="background-color: #f3f7ff">
    <!-- PC端 -->
    <div class="hidden lg:block px-[15.625vw] py-[4.6875vw]">
      <!-- 区域标题 -->
      <div class="text-center mb-[3.125vw]">
        <h2 class="text-[1.875vw] font-bold text-[#182b44]">{{ sectionTitle }}</h2>
        <div class="w-[3.125vw] h-[0.3125vw] bg-primary mx-auto mt-[1vw]"></div>
      </div>

      <!-- 分组列表 -->
      <div v-for="(group, groupIndex) in groups" :key="groupIndex" :class="groupIndex !== groups.length - 1 ? 'mb-[4.167vw]' : ''">
        <!-- 分组标题 -->
        <div v-if="group.title" class="mb-[2.083vw]">
          <h3 class="text-[1.25vw] font-medium text-primary mb-[1vw]">{{ group.title }}</h3>
          <p v-if="group.subtitle" class="text-[0.9375vw] text-primary/70">{{ group.subtitle }}</p>
        </div>

        <!-- Grid 布局 -->
        <div
          v-if="group.layout === 'grid'"
          class="grid gap-[2.0833vw]"
          :class="[group.columns === 2 ? 'grid-cols-2' : group.columns === 4 ? 'grid-cols-4' : 'grid-cols-3']"
        >
          <div
            v-for="(item, itemIndex) in group.items"
            :key="itemIndex"
            class="group relative rounded-lg overflow-hidden cursor-pointer aspect-[411/288]"
          >
            <!-- 图片 -->
            <div class="w-full h-full overflow-hidden">
              <img :src="item.image" :alt="item.title" class="w-full h-full object-cover" />
            </div>
            <!-- 黑色透明遮罩（默认显示） -->
            <div class="absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:opacity-0"></div>
            <!-- 蓝色渐变遮罩（hover显示） -->
            <div
              class="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style="background: linear-gradient(180deg, rgba(21, 120, 255, 0.07) 0%, rgba(21, 120, 255, 0.62) 100%)"
            ></div>
            <!-- 文字内容 -->
            <div class="absolute bottom-0 left-0 right-0 p-[1.25vw] z-10">
              <h4 v-if="item.title" class="text-[1vw] font-medium text-white mb-[0.5vw]">{{ item.title }}</h4>
              <p v-if="item.subtitle" class="text-[0.729vw] text-white/80 leading-relaxed">{{ item.subtitle }}</p>
            </div>
          </div>
        </div>

        <!-- Vertical 布局 -->
        <div v-else-if="group.layout === 'vertical'">
          <div
            v-for="(item, itemIndex) in group.items"
            :key="itemIndex"
            :class="itemIndex !== group.items.length - 1 ? 'mb-[2.083vw]' : ''"
          >
            <p
              v-if="item.title"
              class="text-[1vw] font-medium text-[#182b44] mt-[1vw] text-center mb-[3vw]"
              :class="item.title.includes('边缘智算中枢') || item.title.includes('敏感发现、冷静研判') ? '!text-[1.2vw] !font-bold' : ''"
            >
              {{ item.title }}
            </p>
            <p v-if="item.subtitle" class="text-[0.9375vw] text-[#606974] mt-[0.5vw] leading-relaxed text-center mb-[1.5vw]">
              {{ item.subtitle }}
            </p>
            <img :src="item.image" :alt="item.title" class="w-full h-auto" />
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端 -->
    <div class="lg:hidden px-[4.2667vw] py-[8vw]">
      <!-- 区域标题 -->
      <div class="text-center mb-[6vw]">
        <h2 class="text-[5vw] font-bold text-[#182b44]">{{ sectionTitle }}</h2>
        <div class="w-[8vw] h-[0.8vw] bg-primary mx-auto mt-[2vw]"></div>
      </div>

      <!-- 分组列表 -->
      <div v-for="(group, groupIndex) in groups" :key="groupIndex" :class="groupIndex !== groups.length - 1 ? 'mb-[8vw]' : ''">
        <!-- 分组标题 -->
        <div v-if="group.title" class="mb-[4vw]">
          <h3 class="text-[4vw] font-medium text-primary mb-[2vw]">{{ group.title }}</h3>
          <p v-if="group.subtitle" class="text-[3.2vw] text-primary/70">{{ group.subtitle }}</p>
        </div>

        <!-- Grid 布局 - 2列 -->
        <div v-if="group.layout === 'grid'" class="grid grid-cols-2 gap-[3.2vw]">
          <div v-for="(item, itemIndex) in group.items" :key="itemIndex" class="group relative rounded-lg overflow-hidden cursor-pointer">
            <!-- 图片 -->
            <div class="aspect-[411/240] overflow-hidden">
              <img :src="item.image" :alt="item.title" class="w-full h-full object-cover" />
            </div>
            <!-- 黑色透明遮罩（默认显示） -->
            <div class="absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:opacity-0"></div>
            <!-- 蓝色渐变遮罩（hover显示） -->
            <div
              class="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style="background: linear-gradient(180deg, rgba(21, 120, 255, 0.07) 0%, rgba(21, 120, 255, 0.62) 100%)"
            ></div>
            <!-- 文字内容 -->
            <div class="absolute bottom-0 left-0 right-0 p-[3vw] z-10">
              <h4 v-if="item.title" class="text-[3.5vw] font-medium text-white mb-[1vw]">{{ item.title }}</h4>
              <p v-if="item.subtitle" class="text-[2.8vw] text-white/80 leading-relaxed">{{ item.subtitle }}</p>
            </div>
          </div>
        </div>

        <!-- Vertical 布局 -->
        <div v-else-if="group.layout === 'vertical'">
          <div v-for="(item, itemIndex) in group.items" :key="itemIndex" :class="itemIndex !== group.items.length - 1 ? 'mb-[4vw]' : ''">
            <h4
              v-if="item.title"
              class="text-[4vw] font-medium text-[#182b44] mt-[2vw]"
              :class="item.title.includes('边缘智算中枢') || item.title.includes('敏感发现、冷静研判') ? '!text-[4.8vw] !font-bold' : ''"
            >
              {{ item.title }}
            </h4>
            <p v-if="item.subtitle" class="text-[3.2vw] text-[#606974] mt-[1vw] leading-relaxed">{{ item.subtitle }}</p>
            <img :src="item.image" :alt="item.title" class="w-full h-auto" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ImageCard {
  image: string;
  title?: string;
  subtitle?: string;
}

interface Group {
  title?: string;
  subtitle?: string;
  layout: "grid" | "vertical";
  items?: ImageCard[];
  columns?: number;
}

interface Props {
  sectionTitle: string;
  groups: Group[];
}

defineProps<Props>();
</script>
