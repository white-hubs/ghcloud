<template>
  <div class="w-full product-matrix-section">
    <!-- PC端标题 -->
    <h2 v-if="title" class="hidden lg:block text-center font-bold product-matrix-title-pc">
      {{ title }}
    </h2>
    <p v-if="subtitle" class="hidden lg:block text-center product-matrix-subtitle-pc">
      {{ subtitle }}
    </p>
    <!-- 移动端标题 -->
    <h2 v-if="title" class="lg:hidden text-center font-medium text-[4.5333vw] text-[#182b44] mb-[2vw] px-[4vw]">
      {{ title }}
    </h2>
    <p v-if="subtitle" class="lg:hidden text-center text-[3.2vw] text-[#646464] mb-[4vw] px-[4vw] leading-relaxed">
      {{ subtitle }}
    </p>

    <!-- PC端: 三列布局 -->
    <div class="hidden lg:flex product-matrix-pc-container">
      <!-- 软件产品卡片 - 10个items，2行×5列 -->
      <div class="flex flex-col product-card-pc product-card-large">
        <h3 class="font-medium text-center product-category-title-pc">
          {{ softwareCategory.name }}
        </h3>

        <!-- 软件产品网格 - 每行最多4列，10个items分成3行(4+4+2) -->
        <div class="grid flex-1 product-grid-pc">
          <component
            :is="item.href ? 'a' : 'div'"
            v-for="(item, index) in softwareCategory.items"
            :key="index"
            :href="item.href || undefined"
            class="flex flex-col items-center justify-start cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div class="product-icon-box-pc product-icon-wrapper-pc">
              <img v-if="item.icon" :src="item.icon" :alt="item.name" class="product-icon-pc" />
            </div>
            <span class="text-center product-item-name-pc">
              {{ item.name }}
            </span>
          </component>
        </div>
      </div>

      <!-- 硬件产品卡片 -->
      <div class="flex flex-col product-card-pc product-card-large">
        <h3 class="font-medium text-center product-category-title-pc">
          {{ hardwareCategory.name }}
        </h3>

        <!-- 硬件产品网格 - 2行4列，白色方块 -->
        <div class="grid flex-1 product-grid-pc hardware-product-grid-pc">
          <component
            :is="item.href ? 'a' : 'div'"
            v-for="(item, index) in hardwareCategory.items"
            :key="index"
            :href="item.href || undefined"
            class="flex flex-col items-center justify-start cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div class="product-icon-box-pc product-icon-wrapper-pc">
              <img v-if="item.icon" :src="item.icon" :alt="item.name" class="product-icon-pc" />
            </div>
            <span class="text-center product-item-name-pc">
              {{ item.name }}
            </span>
          </component>
        </div>
      </div>

      <!-- 服务产品卡片 - 3个items -->
      <div class="flex flex-col product-card-pc product-card-small">
        <h3 class="font-medium text-center product-category-title-pc">
          {{ serviceCategory.name }}
        </h3>

        <!-- 服务产品竖向列表 -->
        <div class="flex flex-col items-center flex-1 product-service-list-pc">
          <component
            :is="item.href ? 'a' : 'div'"
            v-for="(item, index) in serviceCategory.items"
            :key="index"
            :href="item.href || undefined"
            class="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div class="product-icon-box-pc product-icon-wrapper-pc">
              <img v-if="item.icon" :src="item.icon" :alt="item.name" class="product-icon-pc" />
            </div>
            <span class="text-center product-item-name-pc">
              {{ item.name }}
            </span>
          </component>
        </div>
      </div>
    </div>

    <!-- 移动端: 卡片内横向滚动 -->
    <div class="lg:hidden flex flex-col gap-[4vw] px-[4vw]">
      <!-- 软件产品 -->
      <div class="flex flex-col product-card-mobile">
        <h3 class="text-[3.7333vw] font-medium text-center mb-[3vw] text-[#05060ee5]">
          {{ softwareCategory.name }}
        </h3>
        <div class="overflow-x-auto hide-scrollbar">
          <div class="flex gap-[4vw] min-w-max">
            <component
              :is="item.href ? 'a' : 'div'"
              v-for="(item, index) in softwareCategory.items"
              :key="index"
              :href="item.href || undefined"
              class="flex flex-col items-center w-[18vw] cursor-pointer"
            >
              <div class="w-[12vw] h-[12vw] bg-white rounded-lg flex items-center justify-center mb-[1vw] shadow-sm">
                <img v-if="item.icon" :src="item.icon" :alt="item.name" class="w-[70%] h-[70%] object-contain" />
              </div>
              <span class="text-[3vw] text-center whitespace-nowrap text-[#05060ee5]">{{ item.name }}</span>
            </component>
          </div>
        </div>
      </div>

      <!-- 硬件产品 -->
      <div class="flex flex-col product-card-mobile">
        <h3 class="text-[3.7333vw] font-medium text-center mb-[3vw] text-[#05060ee5]">
          {{ hardwareCategory.name }}
        </h3>
        <div class="overflow-x-auto hide-scrollbar">
          <div class="flex gap-[4vw] min-w-max">
            <component
              :is="item.href ? 'a' : 'div'"
              v-for="(item, index) in hardwareCategory.items"
              :key="index"
              :href="item.href || undefined"
              class="flex flex-col items-center w-[18vw] cursor-pointer"
            >
              <div class="w-[12vw] h-[12vw] bg-white rounded-lg flex items-center justify-center mb-[1vw] shadow-sm">
                <img v-if="item.icon" :src="item.icon" :alt="item.name" class="w-[70%] h-[70%] object-contain" />
              </div>
              <span class="text-[3vw] text-center whitespace-nowrap text-[#05060ee5]">{{ item.name }}</span>
            </component>
          </div>
        </div>
      </div>

      <!-- 服务产品 -->
      <div class="flex flex-col product-card-mobile">
        <h3 class="text-[3.7333vw] font-medium text-center mb-[3vw] text-[#05060ee5]">
          {{ serviceCategory.name }}
        </h3>
        <div class="overflow-x-auto hide-scrollbar">
          <div class="flex gap-[4vw] min-w-max">
            <component
              :is="item.href ? 'a' : 'div'"
              v-for="(item, index) in serviceCategory.items"
              :key="index"
              :href="item.href || undefined"
              class="flex flex-col items-center w-[18vw] cursor-pointer"
            >
              <div class="w-[12vw] h-[12vw] bg-white rounded-lg flex items-center justify-center mb-[1vw] shadow-sm">
                <img v-if="item.icon" :src="item.icon" :alt="item.name" class="w-[70%] h-[70%] object-contain" />
              </div>
              <span class="text-[3vw] text-center whitespace-nowrap text-[#05060ee5]">{{ item.name }}</span>
            </component>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ProductItem {
  name: string;
  icon?: string;
  href?: string;
}

interface Category {
  name: string;
  items: ProductItem[];
}

interface Props {
  title?: string;
  subtitle?: string;
  softwareCategory?: Category;
  hardwareCategory?: Category;
  serviceCategory?: Category;
}

withDefaults(defineProps<Props>(), {
  title: "",
  subtitle: "",
  softwareCategory: () => ({
    name: "软件产品",
    items: [],
  }),
  hardwareCategory: () => ({
    name: "硬件产品",
    items: [],
  }),
  serviceCategory: () => ({
    name: "服务产品",
    items: [],
  }),
});
</script>

<style scoped>
/* 主容器样式 */
.product-matrix-section {
  background-color: #f9fcff;
  padding: 4.1667vw 0;
}

/* PC端标题 */
.product-matrix-title-pc {
  font-size: 1.5625vw;
  color: #182b44;
  line-height: 1.2;
  margin-bottom: 1.0417vw;
}

.product-matrix-subtitle-pc {
  font-size: 0.8333vw;
  color: #646464;
  line-height: 1.6;
  margin-bottom: 3.125vw;
  padding: 0 20vw;
}

/* PC端容器 */
.product-matrix-pc-container {
  gap: 1.875vw;
  justify-content: center;
}

/* PC端卡片基础样式 */
.product-card-pc {
  background: linear-gradient(180deg, #f7faff 0%, #f0f4ff 99%);
  border: 2px solid #ffffff;
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.03);
  border-radius: 16px;
}

.product-card-large {
  width: 27.2917vw;
  padding: 2.6042vw 1.0417vw 2.6042vw;
}

.product-card-small {
  width: 10.4167vw;
  padding: 2.6042vw 0.8333vw 2.6042vw;
}

/* PC端分类标题 */
.product-category-title-pc {
  font-size: 1.4583vw;
  color: #05060ee5;
  margin-bottom: 2.6042vw;
  font-weight: bold;
}

/* PC端网格 */
.product-grid-pc {
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5625vw 0.8333vw;
  align-content: start;
}

.hardware-product-grid-pc {
  row-gap: 1.5625vw;
}

/* PC端图标容器 */
.product-icon-wrapper-pc {
  width: 3.3333vw;
  height: 3.3333vw;
  margin-bottom: 0.4167vw;
}

.product-icon-box-pc {
  background-color: white;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* PC端图标 */
.product-icon-pc {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* PC端产品名称 */
.product-item-name-pc {
  font-size: 0.8333vw;
  color: #05060ee5;
  line-height: 1.5;
}

/* PC端服务列表 */
.product-service-list-pc {
  gap: 2.0833vw;
}

/* 移动端卡片 */
.product-card-mobile {
  padding: 4vw;
  background: linear-gradient(180deg, #f7faff 0%, #f0f4ff 99%);
  border: 2px solid #ffffff;
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.03);
  border-radius: 16px;
}

/* 隐藏滚动条但保持可滚动 */
.hide-scrollbar {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
