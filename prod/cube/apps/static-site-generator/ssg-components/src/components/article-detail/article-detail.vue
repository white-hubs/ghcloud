<template>
  <div class="w-full bg-[#FAFAFA] min-h-[50vh] pb-[8vw] lg:pb-[4vw]">
    <!-- 面包屑 -->
    <div class="w-full max-w-[90rem] mx-auto px-[4vw] lg:px-[15.625vw] py-[2.5vw] lg:py-[1.04vw] text-[3.24vw] lg:text-[0.7292vw] text-[#000]">
      <a href="/" class="hover:text-primary transition-colors">首页</a>
      <span class="mx-[1vw] lg:mx-[0.3vw]">></span>
      <a href="/information.html" class="hover:text-primary transition-colors">资讯中心</a>
      <span class="mx-[1vw] lg:mx-[0.3vw]">></span>
      <span class="text-[#585c60]">文章详情</span>
    </div>

    <!-- 白色内容卡片 -->
    <div class="w-full max-w-[90rem] mx-auto px-[4vw] lg:px-[15.625vw]">
      <div class="bg-white rounded-lg px-[4vw] lg:px-[1.5625vw] py-[6vw] lg:py-[3.125vw]">
        <!-- 标题 -->
        <h1 class="text-[5vw] lg:text-[1.25vw] font-bold text-[#182B44] text-center leading-tight">
          {{ title }}
        </h1>

        <!-- 元信息 -->
        <div class="flex items-center justify-center gap-[2vw] lg:gap-[0.7292vw] mt-[4vw] lg:mt-[1.7708vw] text-[3.24vw] lg:text-[0.7292vw] text-[#969A9F]">
          <div class="flex items-center gap-[1vw] lg:gap-[0.3646vw] border-r border-[#CFD1D4] pr-[2vw] lg:pr-[0.7292vw]">
            <span>发布时间:</span>
            <span>{{ createTime }}</span>
          </div>
        </div>

        <!-- 正文内容 -->
        <div
          class="article-content mt-[6vw] lg:mt-[2.8125vw] text-[3.51vw] lg:text-[0.7292vw] text-[#585C60] leading-[1.8] lg:leading-[1.625]"
          v-html="content"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  createTime: string
  content: string
}

defineProps<Props>()
</script>

<style scoped>
.article-content {
  color: #585c60;
  font-family: "SOURCEHANSANSSC-REGULAR", "Source Han Sans CN", "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 0.7292vw;
  font-weight: 400;
  line-height: 1.625;
}
@media (max-width: 1023px) {
  .article-content {
    font-size: 3.51vw;
    line-height: 1.8;
  }
}
.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  vertical-align: middle;
  border-style: none;
  margin: 0 auto;
}
</style>
