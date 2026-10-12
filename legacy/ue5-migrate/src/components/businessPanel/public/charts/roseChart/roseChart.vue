<template>
    <div class="roseChart" ref="roseChart"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted, watch } from "vue"
import { render, PieData } from "./chart"
const roseChart = ref();
const props = defineProps<{
    pieData: PieData[],
    title?: string
}>()
watch(
    () => [...props.pieData],
    newVal => {
        render(roseChart.value, newVal, props.title)
    },
);
onMounted(() => {
    if (roseChart.value) {
        render(roseChart.value, props.pieData, props.title)
    }
})
</script>
<style scoped>
.roseChart {
    width: 100%;
    height: 100%;
}
</style>