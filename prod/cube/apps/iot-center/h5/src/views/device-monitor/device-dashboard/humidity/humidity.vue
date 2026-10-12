<template>
  <ChartData :productPropVoList="props.productPropVoList" :data="props.data" />
</template>
<script lang="ts" setup>
import ChartData from "./components/chart-data.vue";
const props=defineProps({
  data: {
    type: Object,
    default: {}
  },
  productPropVoList: {
    type: Array,
    default: []
  },
  deviceInfo: {
    type: Object,
    default: {}
  }
})
</script>
<style lang="less" scoped>
.title{
  color:white
}
</style>