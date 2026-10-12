<template>
  <div class="w-full">
    <!-- PC端上半部分：背景图片区域 -->
    <div class="engine-hero-pc" :style="{ backgroundImage: `url(${bgImage})` }">
      <div class="engine-hero-content-pc">
        <!-- 平台标题 -->
        <div v-if="platformTitle" class="platform-title-wrapper-pc">
          <h2 class="platform-title-pc">{{ platformTitle }}</h2>
        </div>

        <!-- 副标题 -->
        <div v-if="subtitle" class="subtitle-wrapper-pc">
          <p class="subtitle-pc">{{ subtitle }}</p>
        </div>

        <!-- 内容区 -->
        <div class="hero-main-content-pc">
          <!-- 左侧：标题和描述 -->
          <div class="hero-left-pc">
            <h3 v-if="title" class="hero-title-pc">{{ title }}</h3>
            <p v-if="description" class="hero-desc-pc">{{ description }}</p>
            <a v-if="learnMoreLink" :href="learnMoreLink" class="hero-btn-pc">
              {{ learnMoreText || "了解更多" }}
            </a>
          </div>

          <!-- 右侧：空白区域 -->
          <div class="hero-right-pc"></div>
        </div>
      </div>
    </div>

    <!-- 移动端上半部分 -->
    <div class="engine-hero-mobile" :style="{ backgroundImage: `url(${bgImage})` }">
      <div v-if="platformTitle" class="platform-title-wrapper-mobile">
        <h2 class="platform-title-mobile">{{ platformTitle }}</h2>
      </div>
      <div v-if="subtitle" class="subtitle-wrapper-mobile">
        <p class="subtitle-mobile">{{ subtitle }}</p>
      </div>
    </div>

    <!-- PC端下半部分：白色毛玻璃效果背景 -->
    <div class="engine-cards-section-pc">
      <div class="engine-cards-container-pc">
        <!-- 引擎卡片网格 -->
        <div class="engine-grid-pc">
          <!-- 左侧两列 -->
          <div class="engine-grid-left-pc">
            <!-- 上排 -->
            <div class="engine-grid-row-pc">
              <!-- 卡片1: 孪生引擎 -->
              <component
                :is="items[0].href ? 'a' : 'div'"
                v-if="items[0]"
                :href="items[0].href || undefined"
                class="engine-card engine-card-small"
              >
                <div class="card-bg"></div>
                <div class="card-content">
                  <h4 class="engine-title">{{ items[0].name }}</h4>
                  <p class="engine-desc">{{ items[0].description }}</p>
                  <img v-if="items[0].icon" :src="items[0].icon" :alt="items[0].name" class="engine-icon-img" />
                </div>
              </component>

              <!-- 卡片2: 数据引擎 -->
              <component
                :is="items[1].href ? 'a' : 'div'"
                v-if="items[1]"
                :href="items[1].href || undefined"
                class="engine-card engine-card-small"
              >
                <div class="card-bg"></div>
                <div class="card-content">
                  <h4 class="engine-title">{{ items[1].name }}</h4>
                  <p class="engine-desc">{{ items[1].description }}</p>
                  <img v-if="items[1].icon" :src="items[1].icon" :alt="items[1].name" class="engine-icon-img" />
                </div>
              </component>
            </div>

            <!-- 下排 -->
            <div class="engine-grid-row-pc">
              <!-- 卡片3: 物联引擎 -->
              <component
                :is="items[3].href ? 'a' : 'div'"
                v-if="items[3]"
                :href="items[3].href || undefined"
                class="engine-card engine-card-small"
              >
                <div class="card-bg"></div>
                <div class="card-content">
                  <h4 class="engine-title">{{ items[3].name }}</h4>
                  <p class="engine-desc">{{ items[3].description }}</p>
                  <img v-if="items[3].icon" :src="items[3].icon" :alt="items[3].name" class="engine-icon-img" />
                </div>
              </component>

              <!-- 卡片4: 业务引擎 -->
              <component
                :is="items[4].href ? 'a' : 'div'"
                v-if="items[4]"
                :href="items[4].href || undefined"
                class="engine-card engine-card-small"
              >
                <div class="card-bg"></div>
                <div class="card-content">
                  <h4 class="engine-title">{{ items[4].name }}</h4>
                  <p class="engine-desc">{{ items[4].description }}</p>
                  <img v-if="items[4].icon" :src="items[4].icon" :alt="items[4].name" class="engine-icon-img" />
                </div>
              </component>
            </div>
          </div>

          <!-- 右侧大卡片：AI引擎 -->
          <component
            :is="items[2].href ? 'a' : 'div'"
            v-if="items[2]"
            :href="items[2].href || undefined"
            class="engine-card engine-card-large"
          >
            <div class="card-bg"></div>
            <div class="card-content card-content-large">
              <h4 class="engine-title">{{ items[2].name }}</h4>
              <p class="engine-desc engine-desc-narrow">{{ items[2].description }}</p>
              <img v-if="items[2].icon" :src="items[2].icon" :alt="items[2].name" class="engine-icon-img engine-icon-img-large" />
            </div>
          </component>
        </div>
      </div>
    </div>

    <!-- 移动端：引擎卡片 -->
    <div class="engine-cards-section-mobile">
      <div class="engine-cards-container-mobile">
        <component
          :is="item.href ? 'a' : 'div'"
          v-for="(item, index) in items"
          :key="index"
          :href="item.href || undefined"
          class="engine-card-mobile group"
        >
          <div class="engine-card-mobile-content">
            <h4 class="engine-card-mobile-title group-hover:text-primary">
              {{ item.name }}
              <svg class="engine-card-mobile-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </h4>
            <p class="engine-card-mobile-desc">{{ item.description }}</p>
          </div>
          <div class="engine-card-mobile-icon">
            <img :src="item.icon" :alt="item.name" class="w-full h-full object-contain" />
          </div>
        </component>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import bgImage from "./engine-section-bg.webp?url";

interface EngineItem {
  icon: string;
  name: string;
  description: string;
  href?: string;
}

interface EngineStat {
  value: string;
  label: string;
}

interface Props {
  platformTitle?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  learnMoreLink?: string;
  learnMoreText?: string;
  items: EngineItem[];
  stats?: EngineStat[];
}

withDefaults(defineProps<Props>(), {
  platformTitle: "",
  title: "",
  subtitle: "",
  description: "",
  learnMoreLink: "",
  learnMoreText: "",
  stats: () => [],
});
</script>

<style scoped>
/* PC端 Hero 区域 */
.engine-hero-pc {
  display: none;
}

@media (min-width: 1024px) {
  .engine-hero-pc {
    display: block;
    position: relative;
    height: 40.8333vw;
    background-size: cover;
    background-position: center;
  }
}

.engine-hero-content-pc {
  margin: 0 auto;
  width: 68.75vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 6vw;
}

.platform-title-wrapper-pc {
  text-align: center;
  margin-bottom: 0.5208vw;
}

.platform-title-pc {
  font-size: 1.5625vw;
  color: #182b44;
  font-weight: 700;
}

.subtitle-wrapper-pc {
  text-align: center;
  margin-bottom: 3.125vw;
}

.subtitle-pc {
  font-size: 0.7292vw;
  color: #585c60;
}

.hero-main-content-pc {
  display: flex;
  gap: 4.1667vw;
  align-items: flex-start;
}

.hero-left-pc {
  width: 35%;
}

.hero-right-pc {
  width: 60%;
}

.hero-title-pc {
  font-size: 1.875vw;
  color: #333333;
  font-weight: 500;
  margin-bottom: 1.0417vw;
}

.hero-desc-pc {
  font-size: 0.7292vw;
  color: #646464;
  line-height: 1.8;
  margin-bottom: 1.5625vw;
}

.hero-btn-pc {
  display: inline-block;
  padding: 0.5208vw 1.5625vw;
  background-color: var(--primary);
  color: #ffffff;
  font-size: 0.625vw;
  border-radius: 4px;
  text-decoration: none;
}

/* 移动端 Hero */
.engine-hero-mobile {
  padding: 4vw 4vw 8vw;
  background-size: cover;
  background-position: center;
}

@media (min-width: 1024px) {
  .engine-hero-mobile {
    display: none;
  }
}

.platform-title-wrapper-mobile {
  text-align: left;
  margin-bottom: 2vw;
}

.platform-title-mobile {
  font-size: 4.5333vw;
  color: #182b44;
  font-weight: 700;
}

.subtitle-wrapper-mobile {
  text-align: left;
  margin-bottom: 4vw;
}

.subtitle-mobile {
  font-size: 3.4667vw;
  color: var(--primary);
}

/* PC端卡片区域 */
.engine-cards-section-pc {
  display: none;
}

@media (min-width: 1024px) {
  .engine-cards-section-pc {
    display: block;
    position: relative;
    margin-top: -5vw;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 2.0833vw 0;
  }
}

.engine-cards-container-pc {
  margin: 0 auto;
  width: 68.75vw;
}

.engine-grid-pc {
  display: flex;
  gap: 1.25vw;
  height: 15.2083vw;
}

.engine-grid-left-pc {
  display: flex;
  flex-direction: column;
  gap: 1.25vw;
  width: 65.1515%;
}

.engine-grid-row-pc {
  display: flex;
  gap: 1.25vw;
  height: 48.7013%;
}

/* 引擎卡片基础样式 */
.engine-card {
  position: relative;
  text-decoration: none;
  transition: transform 0.3s ease;
  display: block;
}

.engine-card:hover {
  transform: translateY(-4px);
}

.engine-card-small {
  width: 48.8372%;
  height: 100%;
}

.engine-card-large {
  width: 33.3333%;
  height: 100%;
}

.card-bg {
  position: absolute;
  inset: 0;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
}

.engine-card:hover .card-bg {
  box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.12);
}

.card-content {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 1.5vw 2vw;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.card-content-large {
  padding-top: 1.5vw;
}

.engine-title {
  font-size: 1.0417vw;
  font-weight: 700;
  color: #060b1a;
  margin-bottom: 0.5vw;
  transition: color 0.3s ease;
  position: relative;
  z-index: 1;
}

.engine-title.active,
.engine-card:hover .engine-title {
  color: var(--primary);
}

.engine-desc {
  font-size: 0.65vw;
  color: #646464;
  line-height: 1.5;
  max-width: 70%;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.engine-desc-narrow {
  max-width: 60%;
}

.engine-icon-img {
  position: absolute;
  right: 8%;
  bottom: 15%;
  width: 25%;
  height: auto;
  object-fit: contain;
}

.engine-icon-img-large {
  width: 45%;
  right: 5%;
}

/* 移动端卡片区域 */
.engine-cards-section-mobile {
  background: rgba(255, 255, 255, 0.9);
  padding: 4vw;
}

@media (min-width: 1024px) {
  .engine-cards-section-mobile {
    display: none;
  }
}

.engine-cards-container-mobile {
  display: flex;
  flex-direction: column;
  gap: 3.2vw;
}

.engine-card-mobile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3vw;
  padding: 4vw;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  transition: all 0.3s ease;
}

.engine-card-mobile-content {
  flex: 1;
}

.engine-card-mobile-title {
  font-size: 4vw;
  font-weight: 700;
  color: #333;
  margin-bottom: 2vw;
  display: flex;
  align-items: center;
  gap: 2vw;
  transition: color 0.3s ease;
}

.engine-card-mobile:hover .engine-card-mobile-title {
  color: var(--primary);
}

.engine-card-mobile-arrow {
  width: 4vw;
  height: 4vw;
}

.engine-card-mobile-desc {
  font-size: 3.2vw;
  color: #646464;
  line-height: 1.5;
}

.engine-card-mobile-icon {
  width: 14vw;
  height: 14vw;
  flex-shrink: 0;
}
</style>
