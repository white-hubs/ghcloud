<template>
  <section :id="sectionId" class="w-full py-[4vw] lg:py-[4.1667vw]" :class="theme === 'dark' ? 'bg-[#070e24]' : 'bg-white'">
    <div class="max-w-[120rem] mx-auto px-[5vw] lg:px-[15.625vw]">
      <!-- 标题区域 -->
      <div class="flex flex-col items-center mb-[3vw] lg:mb-[3.125vw]">
        <h2
          class="text-[4.8vw] lg:text-[1.875vw] font-medium mb-[2vw] lg:mb-[0.7vw]"
          :class="theme === 'dark' ? 'text-white' : 'text-[#07101c]'"
        >
          {{ title }}
        </h2>
        <div class="w-[8vw] h-[0.8vw] lg:w-[3.125vw] lg:h-[0.3125vw] bg-primary rounded-full"></div>
      </div>

      <!-- PC端: 2列大卡片 -->
      <div class="hidden lg:flex lg:justify-center lg:gap-[2.08vw]">
        <div
          v-for="(card, index) in cards"
          :key="index"
          class="group relative w-[33.125vw] h-[15.52vw] rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
          :style="{
            backgroundImage: `url(${card.backgroundImage || backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }"
        >
          <div class="absolute inset-0 p-[2.08vw] flex flex-col">
            <!-- 卡片标题 -->
            <component
              :is="card.cardUrl ? 'a' : 'div'"
              :href="card.cardUrl || undefined"
              class="text-[1.25vw] font-semibold text-[#07101c] hover:text-primary transition-colors mb-[1.5vw]"
            >
              {{ card.cardTitle }}
            </component>

            <!-- 产品列表 -->
            <div class="flex flex-col gap-[1.25vw]">
              <component
                :is="item.href ? 'a' : 'div'"
                v-for="(item, itemIndex) in card.items"
                :key="itemIndex"
                :href="item.href || undefined"
                class="group/item text-[0.9375vw] text-[#07101c] transition-colors hover:text-primary flex items-center gap-[0.3vw]"
              >
                {{ item.name }}
                <span class="opacity-0 group-hover/item:opacity-100 transition-opacity">→</span>
              </component>
            </div>
          </div>
        </div>
      </div>

      <!-- 移动端: 单列大卡片 -->
      <div class="lg:hidden flex flex-col gap-[4vw]">
        <div
          v-for="(card, index) in cards"
          :key="index"
          class="group relative w-full rounded-lg overflow-hidden"
          :style="{
            backgroundImage: `url(${card.backgroundImage || backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            aspectRatio: '636/298',
          }"
        >
          <div class="absolute inset-0 p-[4vw] flex flex-col">
            <!-- 卡片标题 -->
            <component
              :is="card.cardUrl ? 'a' : 'div'"
              :href="card.cardUrl || undefined"
              class="text-[4vw] font-semibold text-[#07101c] hover:text-primary transition-colors mb-[3vw]"
            >
              {{ card.cardTitle }}
            </component>

            <!-- 产品列表 -->
            <div class="flex flex-col gap-[2vw]">
              <component
                :is="item.href ? 'a' : 'div'"
                v-for="(item, itemIndex) in card.items"
                :key="itemIndex"
                :href="item.href || undefined"
                class="group/item text-[3.5vw] text-[#07101c] flex items-center gap-[1vw]"
              >
                {{ item.name }}
                <span class="opacity-0 group-hover/item:opacity-100 transition-opacity">→</span>
              </component>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface CardItem {
  name: string;
  href?: string;
}

interface Card {
  cardTitle: string;
  cardUrl?: string;
  backgroundImage?: string;
  items: CardItem[];
}

interface Props {
  title?: string;
  backgroundImage?: string;
  cards: Card[];
  theme?: "light" | "dark";
  sectionId?: string;
}

withDefaults(defineProps<Props>(), {
  title: "配套产品",
  backgroundImage: "",
  theme: "light",
  sectionId: "",
});
</script>
