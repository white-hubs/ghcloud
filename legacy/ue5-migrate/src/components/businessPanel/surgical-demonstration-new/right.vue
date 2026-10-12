<template>
  <div>
    <TeachingOverview />
    <TeachingLiveSessions />
    <PopularVideos />
  </div>
</template>

<script setup lang="ts">
import PopularVideos from "./cards/popular-videos.vue";
import TeachingLiveSessions from "./cards/teaching-live-sessions.vue";
import TeachingOverview from "./cards/teaching-overview.vue";
</script>

<style lang="less" scoped></style>
