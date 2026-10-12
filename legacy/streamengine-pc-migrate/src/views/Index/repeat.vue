<template>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route =useRoute()
onMounted(() => {
  const {businessType,title}=route.query
  history.pushState({ current: location.pathname + location.search }, '', `/portal/stream-engine-render/index?businessType=${businessType}&type=add&title=${title}&repeat=true`)
})
</script>